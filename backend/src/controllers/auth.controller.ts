import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
    expiresIn: '30d',
  });
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: (user as any).avatar,
        token: generateToken(user._id as unknown as string),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: any, res: any) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: (user as any).avatar,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: (updatedUser as any).avatar,
        token: generateToken(updatedUser._id as unknown as string),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const changePassword = async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await user.matchPassword(String(currentPassword));
    if (!ok) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = String(newPassword);
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: (updatedUser as any).avatar,
      token: generateToken(updatedUser._id as unknown as string),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to change password" });
  }
};

const parseBase64Image = (value: string) => {
  const trimmed = (value || "").trim();
  const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { mimeType: "", data: "" };
  return { mimeType: match[1], data: match[2] };
};

export const updateAvatar = async (req: any, res: any) => {
  try {
    const base64 = String(req.body?.base64 || "").trim();
    if (!base64) return res.status(400).json({ message: "base64 is required" });

    const parsed = parseBase64Image(base64);
    const mimeType = parsed.mimeType;
    if (!mimeType) return res.status(400).json({ message: "Invalid image data URL" });

    const allowed = new Set(["image/png", "image/jpeg", "image/webp"]);
    if (!allowed.has(mimeType)) {
      return res.status(400).json({ message: `Unsupported image type: ${mimeType}` });
    }

    const buffer = Buffer.from(parsed.data, "base64");
    const maxBytes = 500 * 1024; // 500KB
    if (buffer.length === 0) return res.status(400).json({ message: "Invalid base64 data" });
    if (buffer.length > maxBytes) {
      return res.status(400).json({ message: "Image too large (max 500KB)" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    (user as any).avatar = base64;
    await user.save();

    res.json({ avatar: (user as any).avatar });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to update avatar" });
  }
};

export const deleteAvatar = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    (user as any).avatar = undefined;
    await user.save();
    res.json({ avatar: null });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to delete avatar" });
  }
};

export const getPreferences = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      notificationPreferences: user.notificationPreferences || {
        email: true,
        inApp: true,
        sms: false,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load preferences" });
  }
};

export const updatePreferences = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const prefs = req.body?.notificationPreferences || {};
    const next = {
      email: prefs.email ?? user.notificationPreferences?.email ?? true,
      inApp: prefs.inApp ?? user.notificationPreferences?.inApp ?? true,
      sms: prefs.sms ?? user.notificationPreferences?.sms ?? false,
    };

    user.notificationPreferences = {
      email: Boolean(next.email),
      inApp: Boolean(next.inApp),
      sms: Boolean(next.sms),
    };

    await user.save();

    res.json({ notificationPreferences: user.notificationPreferences });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to update preferences" });
  }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: any, res: any) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // We return 200 to prevent email enumeration
            return res.status(200).json({ message: 'Email sent' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // In production, this points to your frontend URL
        const resetUrl = `${req.protocol}://${req.get('host')}/#/reset-password/${resetToken}`; 
        
        // Mock sending email
        console.log('====================================');
        console.log(`Password Reset Link for ${email}:`);
        console.log(resetUrl);
        console.log('====================================');

        res.status(200).json({ message: 'Email sent' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/v1/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = async (req: any, res: any) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id as unknown as string),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Redirect to Google Auth
// @route   GET /api/v1/auth/google
// @access  Public
export const googleAuth = (req: any, res: any) => {
  // Simulator: Immediately redirect to callback with mock code
  res.redirect('/api/v1/auth/google/callback?code=mock_code_123');
};

// @desc    Google Auth Callback
// @route   GET /api/v1/auth/google/callback
// @access  Public
export const googleCallback = async (req: any, res: any) => {
  try {
    // Mocking finding/creating a user
    let user = await User.findOne({ email: 'googleuser@university.com' });
    
    if (!user) {
      user = await User.create({
        name: 'Google User',
        email: 'googleuser@university.com',
        password: crypto.randomBytes(10).toString('hex'), // Random password
        role: 'student'
      });
    }

    const token = generateToken(user._id as unknown as string);

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/#/login?token=${token}`);
  } catch (error) {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    res.redirect(`${frontendUrl}/#/login?error=Google_Auth_Failed`);
  }
};
