const db = require("../config/db");

exports.getEmployees = async (filters) => {
    // TỰ ĐỘNG HÓA 1: Cập nhật hợp đồng hết hạn (Tránh trường hợp chưa ai mở trang Hợp đồng)
    await db.query(`
        UPDATE hopdong SET trangthai = 'inactive' 
        WHERE trangthai = 'active' AND ngaykt IS NOT NULL AND ngaykt < CURRENT_DATE
    `);

    const { search, macv, mapb, trangthai } = filters;
    let query = "SELECT * FROM nhanvien WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (search) {
        query += ` AND (hotennv ILIKE $${paramIndex} OR manv ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
    }

    if (macv) {
        query += ` AND macv = $${paramIndex}`;
        params.push(macv);
        paramIndex++;
    }

    if (mapb) {
        query += ` AND mapb = $${paramIndex}`;
        params.push(mapb);
        paramIndex++;
    }

    if (trangthai) {
        query += ` AND trangthai = $${paramIndex}`;
        params.push(trangthai);
        paramIndex++;
    }

    query += " ORDER BY manv ASC";

    const result = await db.query(query, params);
    return result.rows;
};

exports.getEmployeeById = async (manv) => {
    const result = await db.query("SELECT * FROM nhanvien WHERE manv = $1", [manv]);
    return result.rows[0];
};

exports.createEmployee = async (data) => {
    const { manv, hotennv, gioitinh, ngsinh, sdt, email, diachi, ngaybatdaulam, macv, trangthai, mapb } = data;
    
    const check = await db.query("SELECT * FROM nhanvien WHERE manv = $1", [manv]);
    if (check.rows.length > 0) {
        throw new Error("Mã nhân viên đã tồn tại");
    }

    const result = await db.query(
        `INSERT INTO nhanvien (manv, hotennv, gioitinh, ngsinh, sdt, email, diachi, ngaybatdaulam, macv, trangthai, mapb) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [manv, hotennv, gioitinh, ngsinh, sdt, email, diachi, ngaybatdaulam, macv, trangthai, mapb]
    );
    return result.rows[0];
};

exports.updateEmployee = async (manv, data) => {
    const { hotennv, gioitinh, ngsinh, sdt, email, diachi, ngaybatdaulam, macv, trangthai, mapb } = data;

    const result = await db.query(
        `UPDATE nhanvien 
         SET hotennv = COALESCE($1, hotennv), 
             gioitinh = COALESCE($2, gioitinh),
             ngsinh = COALESCE($3, ngsinh),
             sdt = COALESCE($4, sdt),
             email = COALESCE($5, email), 
             diachi = COALESCE($6, diachi),
             ngaybatdaulam = COALESCE($7, ngaybatdaulam),
             macv = COALESCE($8, macv), 
             trangthai = COALESCE($9, trangthai),
             mapb = COALESCE($10, mapb) 
         WHERE manv = $11 RETURNING *`,
        [hotennv, gioitinh, ngsinh, sdt, email, diachi, ngaybatdaulam, macv, trangthai, mapb, manv]
    );

    if (result.rows.length === 0) {
        throw new Error("Không tìm thấy nhân viên");
    }
    return result.rows[0];
};

exports.deleteEmployee = async (manv) => {
    const result = await db.query("DELETE FROM nhanvien WHERE manv = $1 RETURNING *", [manv]);
    if (result.rows.length === 0) {
        throw new Error("Không tìm thấy nhân viên để xoá");
    }
};

exports.createEmployeeWithAccount = async (empData, userData, degreesData = []) => {
    try {
        await db.query('BEGIN');
        
        const resultEmp = await db.query(
            `INSERT INTO nhanvien (manv, hotennv, gioitinh, ngsinh, sdt, email, diachi, ngaybatdaulam, macv, trangthai, mapb) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [empData.manv, empData.hotennv, empData.gioitinh, empData.ngsinh, empData.sdt, empData.email, empData.diachi, empData.ngaybatdaulam, empData.macv, empData.trangthai, empData.mapb]
        );

        await db.query(
            `INSERT INTO taikhoan (tentk, pass, phanquyen, trangthai, manv) 
             VALUES ($1, $2, $3, $4, $5)`,
            [userData.tentk, userData.pass, userData.phanquyen, userData.trangthai, userData.manv]
        );
        
        // Chèn mảng Bằng cấp vào chung một Transaction
        if (degreesData && degreesData.length > 0) {
            for (let degree of degreesData) {
                await db.query(
                    `INSERT INTO bangcap (mabc, manv, tenbc, chuyennganh, xeploai, namtotnghiep, truongdaotao) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [degree.mabc, degree.manv, degree.tenbc, degree.chuyennganh, degree.xeploai, degree.namtotnghiep || null, degree.truongdaotao]
                );
            }
        }

        await db.query('COMMIT');
        return resultEmp.rows[0];
    } catch (err) {
        await db.query('ROLLBACK');
        throw err;
    }
};

exports.softDeleteEmployee = async (manv) => {
    try {
        await db.query('BEGIN');
        
        const checkLeader = await db.query(
            "SELECT mapb, tenpban FROM phongban WHERE matp = $1", [manv]
        );

        if (checkLeader.rowCount > 0) {
            throw new Error(`Không thể cho nghỉ việc vì nhân viên này đang là Trưởng phòng của [${checkLeader.rows[0].tenpban}].`);
        }

        await db.query("UPDATE nhanvien SET trangthai = 'Nghỉ việc', macv = 'CV01' WHERE manv = $1", [manv]);
        
        await db.query("UPDATE taikhoan SET trangthai = 'khoá' WHERE manv = $1", [manv]);

        await db.query('COMMIT');
        return true;
    } catch (err) {
        await db.query('ROLLBACK');
        throw err;
    }
};