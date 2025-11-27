const HealthLog = require("../models/HealthLog");

exports.getLogs = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.user.id };
    if (date) filter.date = date;
    const logs = await HealthLog.find(filter);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createOrUpdateLog = async (req, res) => {
  try {
    const { date } = req.body;
    let log = await HealthLog.findOne({ userId: req.user.id, date });
    if (log) {
      Object.assign(log, req.body);
      await log.save();
      return res.json(log);
    }
    log = new HealthLog({ ...req.body, userId: req.user.id });
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    await HealthLog.deleteOne({ userId: req.user.id, date: req.params.date });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};