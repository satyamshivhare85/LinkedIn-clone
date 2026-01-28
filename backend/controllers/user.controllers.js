import UploadOnCloudinary from "../config/cloudinary.js";
import upload from "../middleware/multer.js";
import User from "../models/user.model.js";

// ===============================
// GET CURRENT USER
// ===============================
export const getCurrentUser = async (req, res) => {
  try {
    // req.userId comes from isAuth middleware
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Get current user error" });
  }
};

// ===============================
// UPDATE PROFILE
// ===============================
export const updateProfie = async (req, res) => {
  try {
    let {
      firstname,
      lastname,
      username,
      headline,
      location,
      gender,
      skills,
      education,
      experience,
    } = req.body

    // 🔥 PARSE stringified arrays
    skills = skills ? JSON.parse(skills) : []
    education = education ? JSON.parse(education) : []
    experience = experience ? JSON.parse(experience) : []

    let profileImage
    let coverImage

    if (req.files?.profileImage) {
      profileImage = await UploadOnCloudinary(
        req.files.profileImage[0].path
      )
    }

    if (req.files?.coverImage) {
      coverImage = await UploadOnCloudinary(
        req.files.coverImage[0].path
      )
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstname,
        lastname,
        username,
        headline,
        location,
        gender,
        skills,
        education,
        experience,
        ...(profileImage && { profileImage }),
        ...(coverImage && { coverImage }),
      },
      { new: true }
    ).select("-password")

    return res.status(200).json(user)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "update profile error" })
  }
}
