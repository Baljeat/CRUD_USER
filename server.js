const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");

// Import các file routes hiện có
const roleRoutes = require("./routes/roleRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const degreeRoutes = require("./routes/degreeRoutes");
const contractRoutes = require("./routes/contractRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const contractTypeRoutes = require("./routes/contractTypeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CRUD USERS API is running");
});

// Đăng ký các routes hiện có
app.use("/", userRoutes);
app.use("/", authRoutes);
app.use("/", employeeRoutes);
app.use("/", dashboardRoutes);
app.use("/chucvu", roleRoutes);
app.use("/", departmentRoutes);
app.use("/luong", salaryRoutes);
app.use("/bangcap", degreeRoutes);
app.use("/hopdong", contractRoutes);
app.use("/chamcong", attendanceRoutes);
app.use("/loaihopdong", contractTypeRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
