const db = require("../config/db");

exports.getAttendanceByEmployee = async (manv) => {
  // Lấy lịch sử chấm công của một nhân viên
  const result = await db.query(
    "SELECT * FROM chamcong WHERE manv = $1 ORDER BY ngaylam DESC",
    [manv],
  );
  return result.rows;
};

exports.getTodayAttendance = async (manv, date) => {
  const result = await db.query(
    "SELECT * FROM chamcong WHERE manv = $1 AND ngaylam = $2",
    [manv, date],
  );
  return result.rows[0];
};

exports.checkIn = async (data) => {
  const { macc, ngaylam, checkin, trangthai, manv } = data;
  const result = await db.query(
    `INSERT INTO chamcong (macc, ngaylam, checkin, trangthai, manv) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [macc, ngaylam, checkin, trangthai, manv],
  );
  return result.rows[0];
};

exports.checkOut = async (macc, data) => {
  const { checkout, sogiolam, trangthai } = data;
  const result = await db.query(
    `UPDATE chamcong 
         SET checkout = $1, sogiolam = $2, trangthai = $3 
         WHERE macc = $4 RETURNING *`,
    [checkout, sogiolam, trangthai, macc],
  );
  return result.rows[0];
};
