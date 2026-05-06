const db = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    // QUÉT REAL-TIME: Đồng bộ trạng thái Hợp đồng và Nhân viên trước khi thống kê
    await db.query(`
        UPDATE hopdong SET trangthai = 'inactive' 
        WHERE trangthai = 'active' AND ngaykt IS NOT NULL AND ngaykt < CURRENT_DATE
    `);

    // 1. Tổng nhân viên
    const totalNV = await db.query("SELECT COUNT(*) FROM nhanvien");
    
    // 2. Tổng phòng ban
    const totalPB = await db.query("SELECT COUNT(*) FROM phongban");
    
    // 3. Tổng quỹ lương
    // Đã join với hopdong vì luongcoban lưu bên bảng hopdong theo chuẩn thiết kế mới
    const totalSalary = await db.query("SELECT SUM(h.luongcoban + l.phucap + l.thuong - l.khautru) as sum FROM luong l JOIN hopdong h ON l.mahd = h.mahd");
    
    // 4. ĐIỂM QUAN TRỌNG: Lấy số người đi làm theo ngày thực tế của hệ thống
    const attendanceToday = await db.query(
        "SELECT COUNT(*) FROM chamcong WHERE ngaylam = CURRENT_DATE AND (trangthai = 'Đủ công' OR trangthai = 'Trễ' OR trangthai = 'Tăng ca')"
    );

    // 5. 5 nhân viên mới nhất
    const recentNV = await db.query(
        `SELECT n.manv, n.hotennv, c.tencv, n.ngaybatdaulam, n.trangthai 
         FROM nhanvien n 
         LEFT JOIN chucvu c ON n.macv = c.macv 
         ORDER BY n.ngaybatdaulam DESC LIMIT 5`
    );

    // 6. Đếm số lượng hợp đồng sắp hết hạn trong 30 ngày tới
    const expiringContracts = await db.query(`
        SELECT COUNT(*) FROM hopdong 
        WHERE trangthai = 'active' 
          AND ngaykt IS NOT NULL 
          AND ngaykt BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    `);

    res.json({
      totalEmployees: parseInt(totalNV.rows[0].count),
      totalDepartments: parseInt(totalPB.rows[0].count),
      totalSalary: parseFloat(totalSalary.rows[0].sum || 0),
      attendanceToday: parseInt(attendanceToday.rows[0].count),
      recentEmployees: recentNV.rows,
      expiringContracts: parseInt(expiringContracts.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};
