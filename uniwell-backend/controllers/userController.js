const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updates.passwordHash;
    delete updates.email; // Email biasanya tidak bisa diubah
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updates, 
      { new: true }
    ).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Get old user data before update
    const oldUser = await User.findById(req.user.id);
    
    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl },
      { new: true }
    ).select("-passwordHash");

    // Delete old avatar if exists and different
    if (oldUser.avatarUrl && oldUser.avatarUrl !== avatarUrl) {
      const oldPath = path.join(__dirname, "..", oldUser.avatarUrl);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
          console.log("Old avatar deleted:", oldPath);
        } catch (deleteErr) {
          console.error("Failed to delete old avatar:", deleteErr);
        }
      }
    }

    res.json({ 
      message: "Avatar uploaded successfully",
      avatarUrl,
      user 
    });
  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Save push subscription
exports.savePushSub = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { pushSubscription: req.body },
      { new: true }
    ).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: "Push subscription saved",
      user 
    });
  } catch (err) {
    console.error("Save push subscription error:", err);
    res.status(500).json({ message: err.message });
  }
};