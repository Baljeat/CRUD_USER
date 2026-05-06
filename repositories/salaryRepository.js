const db = require("../config/db");

exports.getSalaryByEmployee = async (manv) => {
  // Lấy thêm trường thang, nam từ kyluong để frontend dùng
  const result = await db.query(
    "SELECT l.*, h.luongcoban, EXTRACT(MONTH FROM l.kyluong) AS thang, EXTRACT(YEAR FROM l.kyluong) AS nam FROM luong l LEFT JOIN hopdong h ON l.mahd = h.mahd WHERE l.manv = $1 ORDER BY l.kyluong DESC",
    [manv],
  );
  return result.rows;
};

exports.getAllSalaries = async (month, year) => {
    let query = `
        SELECT l.*, nv.hotennv, hd.luongcoban
        FROM luong l
        JOIN nhanvien nv ON l.manv = nv.manv
        LEFT JOIN hopdong hd ON l.mahd = hd.mahd
        WHERE 1=1
    `;
    const params = [];

    if (month && year) {
        query += ` AND EXTRACT(MONTH FROM l.kyluong) = $1 AND EXTRACT(YEAR FROM l.kyluong) = $2`;
        params.push(month, year);
    }

    query += ` ORDER BY l.kyluong DESC, l.manv ASC`;

    const result = await db.query(query, params);
    return result.rows;
};

exports.getAttendanceStats = async (month, year) => {
    const result = await db.query(`
        SELECT manv, COUNT(macc) as songaycong,
               SUM(CASE WHEN trangthai = 'Tăng ca' THEN sogiolam - 8 ELSE 0 END) as giotangca,
               SUM(CASE WHEN trangthai = 'Trễ' THEN 1 ELSE 0 END) as solantre
        FROM chamcong
        WHERE EXTRACT(MONTH FROM ngaylam) = $1 AND EXTRACT(YEAR FROM ngaylam) = $2
        GROUP BY manv
    `, [month, year]);
    return result.rows;
};

exports.getActiveContract = async (manv) => {
    const result = await db.query(`
        SELECT mahd, luongcoban FROM hopdong 
        WHERE manv = $1 AND trangthai = 'active' ORDER BY ngayky DESC LIMIT 1
    `, [manv]);
    return result.rows[0];
};

exports.upsertSalary = async (data) => {
    const { manv, kyluong, songaycong, giotangca, thuong, khautru, mahd } = data;
    await db.query(`
        INSERT INTO luong (manv, kyluong, songaycong, giotangca, phucap, thuong, khautru, trangthai, mahd)
        VALUES ($1, $2, $3, $4, 0, $5, $6, 'Chưa trả', $7)
        ON CONFLICT (manv, kyluong) 
        DO UPDATE SET songaycong = EXCLUDED.songaycong, giotangca = EXCLUDED.giotangca, thuong = EXCLUDED.thuong, khautru = EXCLUDED.khautru, mahd = EXCLUDED.mahd
    `, [manv, kyluong, songaycong, giotangca, thuong, khautru, mahd]);
};

exports.updateSalaryStatus = async (manv, kyluong, trangthai) => {
    let query = "UPDATE luong SET trangthai = $1";
    let params = [trangthai, manv, kyluong];
    
    if (trangthai === 'Đã trả') {
        query += ", ngaytraluong = CURRENT_DATE";
    } else {
        query += ", ngaytraluong = NULL";
    }
    
    query += " WHERE manv = $2 AND kyluong = $3";
    await db.query(query, params);
};

exports.getSalaryStatus = async (manv, kyluong) => {
    const result = await db.query("SELECT trangthai FROM luong WHERE manv = $1 AND kyluong = $2", [manv, kyluong]);
    return result.rows[0];
};

exports.updateSalaryDetails = async (manv, kyluong, phucap, thuong, khautru) => {
    await db.query(
        "UPDATE luong SET phucap = $1, thuong = $2, khautru = $3 WHERE manv = $4 AND kyluong = $5",
        [phucap || 0, thuong || 0, khautru || 0, manv, kyluong]
    );
};
