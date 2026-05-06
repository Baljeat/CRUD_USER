const db = require("../config/db");

exports.getAll = async () => {

    // TỰ ĐỘNG HÓA: Quét và cập nhật hợp đồng hết hạn theo thời gian thực
    await db.query(`
        UPDATE hopdong 
        SET trangthai = 'inactive' 
        WHERE trangthai = 'active' 
          AND ngaykt IS NOT NULL 
          AND ngaykt < CURRENT_DATE
    `);

    const result = await db.query(
        `SELECT h.*, n.hotennv, l.tenloai 
         FROM hopdong h 
         JOIN nhanvien n ON h.manv = n.manv 
         JOIN loaihopdong l ON h.maloaihd = l.maloaihd 
         ORDER BY h.mahd ASC`
    );
    return result.rows;
};

exports.create = async (data) => {
    const { mahd, ngayky, ngaybd, ngaykt, luongcoban, trangthai, manv, maloaihd } = data;

    // Kiểm tra xem Mã hợp đồng đã tồn tại trong CSDL hay chưa
    const checkExist = await db.query("SELECT mahd FROM hopdong WHERE mahd = $1", [mahd]);
    if (checkExist.rows.length > 0) {
        throw new Error("Mã hợp đồng này đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
    }

    // Kiểm tra trùng lặp Hợp đồng Active trong CSDL
    const check = await db.query(
        `SELECT mahd FROM hopdong 
         WHERE manv = $1 
           AND trangthai = 'active'
           AND (ngaykt IS NULL OR ngaykt >= $2::date)`,
        [manv, ngaybd]
    );
    if (check.rows.length > 0) {
        throw new Error(`Nhân viên này đang có hợp đồng (Mã: ${check.rows[0].mahd}) hiệu lực trùng thời gian. Vui lòng kết thúc hợp đồng cũ trước.`);
    }

    const result = await db.query(
        `INSERT INTO hopdong (mahd, ngayky, ngaybd, ngaykt, luongcoban, trangthai, manv, maloaihd) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [mahd, ngayky, ngaybd, ngaykt || null, luongcoban, trangthai || 'active', manv, maloaihd]
    );
    return result.rows[0];
};

exports.countFixedTermContracts = async (manv, excludeMahd = null) => {
    let query = `
        SELECT COUNT(*) 
        FROM hopdong 
        WHERE manv = $1 
          AND maloaihd != 'LHD01' 
          AND ngaykt IS NOT NULL
    `;
    const params = [manv];
    if (excludeMahd) {
        query += ` AND mahd != $${params.length + 1}`;
        params.push(excludeMahd);
    }
    const result = await db.query(query, params);
    return parseInt(result.rows[0].count);
};

exports.update = async (mahd, data) => {
    const { ngayky, ngaybd, ngaykt, luongcoban, trangthai, manv, maloaihd } = data;
    
    // Kiểm tra trùng lặp Hợp đồng Active trong CSDL (bỏ qua chính nó)
    if (trangthai === 'active') {
        const check = await db.query(
            `SELECT mahd FROM hopdong 
             WHERE manv = $1 
               AND mahd != $2
               AND trangthai = 'active'
               AND (ngaykt IS NULL OR ngaykt >= $3::date)`,
            [manv, mahd, ngaybd]
        );
        if (check.rows.length > 0) {
            throw new Error(`Cập nhật thất bại. Nhân viên đang có hợp đồng khác (Mã: ${check.rows[0].mahd}) trùng lặp thời gian.`);
        }
    }

    const result = await db.query(
        `UPDATE hopdong SET ngayky=$1, ngaybd=$2, ngaykt=$3, luongcoban=$4, trangthai=$5, manv=$6, maloaihd=$7 
         WHERE mahd=$8 RETURNING *`,
        [ngayky, ngaybd, ngaykt || null, luongcoban, trangthai, manv, maloaihd, mahd]
    );
    return result.rows[0];
};

exports.activateEmployeeAndAccount = async (manv) => {
    await db.query("UPDATE nhanvien SET trangthai = 'active' WHERE manv = $1", [manv]);
    await db.query("UPDATE taikhoan SET trangthai = 'active' WHERE manv = $1", [manv]);
};

exports.findActiveContractByEmployee = async (manv) => {
    const result = await db.query(`
        SELECT mahd, luongcoban FROM hopdong 
        WHERE manv = $1 AND trangthai = 'active' ORDER BY ngayky DESC LIMIT 1
    `, [manv]);
    return result.rows[0];
};