const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.savePushSub = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { pushSubscription: req.body });
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};