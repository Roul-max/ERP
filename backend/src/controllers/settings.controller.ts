import InstitutionSettings from "../models/InstitutionSettings";

const defaultAcademicYears = () => {
  const now = new Date();
  const y = now.getFullYear();
  // Academic year commonly spans current year -> next year.
  return { academicYearStart: y, academicYearEnd: y + 1 };
};

export const getInstitutionSettings = async (_req: any, res: any) => {
  try {
    let settings = await InstitutionSettings.findOne({});
    if (!settings) {
      const years = defaultAcademicYears();
      settings = await InstitutionSettings.create({
        institutionName: "ACE University",
        emailDomain: "@university.edu",
        contactEmail: "admin@university.edu",
        ...years,
      } as any);
    }

    res.json({
      institutionName: settings.institutionName,
      emailDomain: settings.emailDomain,
      contactEmail: settings.contactEmail,
      academicYearStart: settings.academicYearStart,
      academicYearEnd: settings.academicYearEnd,
      updatedAt: settings.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load settings" });
  }
};

export const updateInstitutionSettings = async (req: any, res: any) => {
  try {
    const {
      institutionName,
      emailDomain,
      contactEmail,
      academicYearStart,
      academicYearEnd,
    } = req.body || {};

    if (!institutionName || typeof institutionName !== "string") {
      return res.status(400).json({ message: "Institution name is required" });
    }
    if (!emailDomain || typeof emailDomain !== "string") {
      return res.status(400).json({ message: "Email domain is required" });
    }
    if (!contactEmail || typeof contactEmail !== "string") {
      return res.status(400).json({ message: "Contact email is required" });
    }
    const start = Number(academicYearStart);
    const end = Number(academicYearEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      return res
        .status(400)
        .json({ message: "Academic year must be a valid range" });
    }

    let settings = await InstitutionSettings.findOne({});
    if (!settings) {
      settings = new InstitutionSettings();
    }

    settings.institutionName = institutionName.trim();
    settings.emailDomain = emailDomain.trim();
    settings.contactEmail = contactEmail.trim();
    settings.academicYearStart = Math.trunc(start);
    settings.academicYearEnd = Math.trunc(end);
    settings.updatedBy = req.user?._id;

    const saved = await settings.save();

    res.json({
      institutionName: saved.institutionName,
      emailDomain: saved.emailDomain,
      contactEmail: saved.contactEmail,
      academicYearStart: saved.academicYearStart,
      academicYearEnd: saved.academicYearEnd,
      updatedAt: saved.updatedAt,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to update settings" });
  }
};

