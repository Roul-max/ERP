import { Request, Response } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';
import NotificationBroadcast from "../models/NotificationBroadcast";

export const sendNotification = async (req: any, res: any) => {
  try {
    const { recipientId, title, message, type, channel, roles } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    const normalizedChannel = channel === "email" ? "email" : "inApp";
    const roleFilter = Array.isArray(roles) ? roles.map((r) => String(r)) : [];

    const userFilter: any = { isActive: true };
    if (recipientId) userFilter._id = recipientId;
    if (!recipientId && roleFilter.length) userFilter.role = { $in: roleFilter };

    const users = await User.find(userFilter).lean();

    const broadcast = await NotificationBroadcast.create({
      createdBy: req.user._id,
      title,
      message,
      type,
      channel: normalizedChannel,
      audience: {
        recipientId: recipientId || undefined,
        roles: roleFilter.length ? roleFilter : undefined,
        allActive: !recipientId,
      },
      stats: {
        matchedUsers: users.length,
        inAppCreated: 0,
        emailPlanned: 0,
      },
    } as any);

    let inAppCreated = 0;
    let emailPlanned = 0;

    if (normalizedChannel === "inApp") {
      const notifications = users
        .filter((u: any) => u?.notificationPreferences?.inApp !== false)
        .map((u: any) => ({
          recipient: u._id,
          sender: req.user._id,
          broadcast: broadcast._id,
          title,
          message,
          type,
          channel: "inApp",
        }));
      if (notifications.length) {
        await Notification.insertMany(notifications);
      }
      inAppCreated = notifications.length;
    } else {
      emailPlanned = users.filter((u: any) => u?.notificationPreferences?.email !== false).length;
    }

    broadcast.stats = {
      matchedUsers: users.length,
      inAppCreated,
      emailPlanned,
    } as any;
    await broadcast.save();

    res.status(201).json({
      broadcastId: broadcast._id,
      channel: broadcast.channel,
      stats: broadcast.stats,
      message:
        normalizedChannel === "inApp"
          ? `In-app broadcast created for ${inAppCreated} users`
          : `Email broadcast planned for ${emailPlanned} users`,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyNotifications = async (req: any, res: any) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort('-createdAt');
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req: any, res: any) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const listBroadcasts = async (req: any, res: any) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 5), 100);
    const skip = (page - 1) * limit;
    const channel = (req.query.channel || "").toString();

    const filter: any = { createdBy: req.user._id };
    if (channel === "inApp" || channel === "email") filter.channel = channel;

    const [total, broadcasts] = await Promise.all([
      NotificationBroadcast.countDocuments(filter),
      NotificationBroadcast.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    res.json({
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      broadcasts,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load broadcasts" });
  }
};
