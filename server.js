require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDB();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/health", require("./routes/health"));
app.use("/api/tasks", require("./routes/task"));
app.use("/api/reminders", require("./routes/reminder"));
app.use("/api/expenses", require("./routes/expense"));
app.use("/api/notifications", require("./routes/notification"));

app.use((req, res) => res.status(404).json({ message: "404 not found" }));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));