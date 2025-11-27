const Reminder = require("../models/Reminder");

exports.listReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const reminder = new Reminder({ ...req.body, userId: req.user.id });
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const updated = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    await Reminder.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.triggerNow = async (req, res) => {
  // Simulasi/reminder manual
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!reminder) return res.status(404).json({ message: "Not found" });
    // Dummy response: seharusnya push notif/real task
    res.json({ message: `Triggered reminder: ${reminder.title}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};