const attendanceRepo = require("../repositories/attendanceRepository");
const db = require("../config/db");
const moment = require("moment-timezone");

exports.getMyAttendance = async (manv) => {
  return await attendanceRepo.getAttendanceByEmployee(manv);
};

exports.checkIn = async (manv) => {
  // Cắt lấy định dạng YYYY-MM-DD
  const today = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
  const existing = await attendanceRepo.getTodayAttendance(manv, today);

  if (existing) throw new Error("Hôm nay bạn đã check-in rồi!");

  // KIỂM TRA LOGIC: Nhân viên phải có ít nhất 1 hợp đồng Active mới được chấm công
  const hasActiveContract = await db.query(
      "SELECT 1 FROM hopdong WHERE manv = $1 AND trangthai = 'active'", [manv]
  );
  if (hasActiveContract.rowCount === 0) {
      throw new Error("Bạn hiện không có hợp đồng lao động nào đang hiệu lực để có thể chấm công.");
  }

  const now = moment().tz("Asia/Ho_Chi_Minh");
  // Tính đi trễ theo múi giờ Việt Nam
  const isLate = now.hours() >= 8 && now.minutes() > 0;
  const trangthai = isLate ? "Trễ" : "Đủ công";

  // Random ID cho macc (dựa theo giới hạn VARCHAR(10))
  const macc =
    "C" +
    Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0");

  return await attendanceRepo.checkIn({
    macc,
    ngaylam: today,
    checkin: now.format(), // Format ISO kèm đuôi múi giờ +07:00
    trangthai,
    manv: manv,
  });
};

exports.checkOut = async (manv) => {
  const today = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
  const record = await attendanceRepo.getTodayAttendance(manv, today);

  if (!record) throw new Error("Bạn chưa check-in hôm nay!");
  if (record.checkout) throw new Error("Bạn đã check-out hôm nay rồi!");

  const checkinTime = new Date(record.checkin);
  const checkoutTime = moment().tz("Asia/Ho_Chi_Minh");

  // Tính tổng giờ làm (chuyển đổi ms -> giờ)
  const diffMs = checkoutTime.valueOf() - checkinTime.getTime();
  const sogiolam = (diffMs / (1000 * 60 * 60)).toFixed(2);

  let trangthai = record.trangthai;
  if (sogiolam > 8) trangthai = "Tăng ca";

  return await attendanceRepo.checkOut(record.macc, {
    checkout: checkoutTime.format(), // Format ISO kèm đuôi múi giờ +07:00
    sogiolam,
    trangthai,
  });
};

// ==========================================
// --- LOGIC DÀNH CHO ADMIN QUẢN LÝ ---
// ==========================================

exports.getAllAttendances = async (date, month, year) => {
  let query = `
      SELECT c.*, nv.hotennv, pb.tenpban 
      FROM chamcong c
      JOIN nhanvien nv ON c.manv = nv.manv
      LEFT JOIN phongban pb ON nv.mapb = pb.mapb
      WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  // Lọc theo ngày cụ thể, hoặc lọc theo tháng/năm
  if (date) {
      query += ` AND c.ngaylam = $${paramCount}`;
      params.push(date);
  } else if (month && year) {
      query += ` AND EXTRACT(MONTH FROM c.ngaylam) = $${paramCount} AND EXTRACT(YEAR FROM c.ngaylam) = $${paramCount + 1}`;
      params.push(month, year);
  }

  query += ` ORDER BY c.ngaylam DESC, c.checkin DESC`;

  const result = await db.query(query, params);
  return result.rows;
};

exports.adminUpdateAttendance = async (macc, data) => {
  const { checkout, trangthai } = data;
  
  // 1. Lấy giờ checkin gốc để tính toán
  const recordRes = await db.query("SELECT checkin FROM chamcong WHERE macc = $1", [macc]);
  if (recordRes.rowCount === 0) throw new Error("Không tìm thấy bản ghi chấm công này!");
  
  const checkinTime = new Date(recordRes.rows[0].checkin);
  const checkoutTime = new Date(checkout);
  
  if (checkoutTime <= checkinTime) {
      throw new Error("Lỗi Logic: Giờ Check-out do Admin nhập bắt buộc phải sau giờ Check-in.");
  }

  // 2. Tính lại tổng giờ làm
  const diffMs = checkoutTime - checkinTime;
  const sogiolam = (diffMs / (1000 * 60 * 60)).toFixed(2);

  // 3. Tính lại trạng thái nếu Admin không chỉ định cứng
  let newTrangthai = trangthai;
  if (!newTrangthai) {
      newTrangthai = (sogiolam > 8) ? "Tăng ca" : "Đủ công";
  }

  // 4. Lưu vào Database
  const result = await db.query(
      "UPDATE chamcong SET checkout = $1, sogiolam = $2, trangthai = $3 WHERE macc = $4 RETURNING *",
      [checkout, sogiolam, newTrangthai, macc]
  );
  return result.rows[0];
};
