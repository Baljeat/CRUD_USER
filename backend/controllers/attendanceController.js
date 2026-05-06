const attendanceService = require("../services/attendanceService");

exports.getMyAttendance = async (req, res) => {
  try {
    // req.user.manv được lấy từ middleware xác thực JWT
    const data = await attendanceService.getMyAttendance(req.user.manv);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const data = await attendanceService.checkIn(req.user.manv);
    res.json({ message: "Check-in thành công", data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const data = await attendanceService.checkOut(req.user.manv);
    res.json({ message: "Check-out thành công", data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllAttendances = async (req, res) => {
  try {
    const { date, month, year } = req.query;
    const data = await attendanceService.getAllAttendances(date, month, year);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adminUpdateAttendance = async (req, res) => {
  try {
      const { macc } = req.params;
      const updatedRecord = await attendanceService.adminUpdateAttendance(macc, req.body);
      res.status(200).json({ message: "Cập nhật giờ Check-out thành công!", data: updatedRecord });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};