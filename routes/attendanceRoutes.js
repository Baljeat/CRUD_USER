const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { verifyToken } = require("../middleware/authMiddleware");

// Các API này dành cho Employee (nhân viên đã đăng nhập)
router.get("/me", verifyToken, attendanceController.getMyAttendance);
router.post("/checkin", verifyToken, attendanceController.checkIn);
router.post("/checkout", verifyToken, attendanceController.checkOut);

// Chỉ Admin hoặc HR mới có quyền gọi 2 API này
router.get("/admin/all", attendanceController.getAllAttendances);
router.put("/admin/update/:macc", attendanceController.adminUpdateAttendance);

module.exports = router;
