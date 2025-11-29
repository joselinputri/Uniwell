const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log("📝 Register attempt:", { name, email });
    
    // Cek apakah user sudah ada
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Email already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Buat user baru
    const user = new User({ 
      name, 
      email, 
      passwordHash,
      dailyWaterGoalMl: 2000,
      dailySleepGoalHrs: 8
    });
    
    await user.save();
    console.log("✅ User created:", email);
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      message: "Registration successful" 
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("🔐 Login attempt:", email);
    
    // Cari user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Cek password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log("❌ Wrong password for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    console.log("✅ Login success:", email);
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      message: "Login successful" 
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      dailyWaterGoalMl: user.dailyWaterGoalMl,
      dailySleepGoalHrs: user.dailySleepGoalHrs,
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    console.error("❌ Get user error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // Di JWT, logout dilakukan di frontend (hapus token)
    res.json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};