const NotificationLog = require("../models/NotificationLog");

exports.listNotifications = async (req, res) => {
  try {
    const notifs = await NotificationLog.find({ userId: req.user.id });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.readNotification = async (req, res) => {
  try {
    const updated = await NotificationLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};