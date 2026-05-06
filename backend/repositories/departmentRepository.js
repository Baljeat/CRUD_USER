const db = require("../config/db");

exports.getAllDepartments = async () => {
    const result = await db.query("SELECT * FROM phongban ORDER BY mapb ASC");
    return result.rows;
};

exports.getDepartmentById = async (mapb) => {
    const result = await db.query("SELECT * FROM phongban WHERE mapb = $1", [mapb]);
    return result.rows[0];
};

exports.createDepartment = async (data) => {
    const { mapb, tenpban, mota } = data;
    
    const check = await db.query("SELECT * FROM phongban WHERE mapb = $1", [mapb]);
    if (check.rows.length > 0) throw new Error("Mã phòng ban đã tồn tại");

    const result = await db.query(
        "INSERT INTO phongban (mapb, tenpban, mota ) VALUES ($1, $2, $3) RETURNING *",
        [mapb, tenpban, mota]
    );
    return result.rows[0];
};


exports.updateDepartment = async (mapb, data) => {
    // 1. Chỉ lấy tenpban và mota từ data gửi lên
    const { tenpban, mota } = data;

    // 2. Viết lại câu lệnh SQL chỉ cập nhật 2 trường này
    const query = `UPDATE phongban SET tenpban = $1, mota = $2 WHERE mapb = $3`;
    const values = [tenpban, mota, mapb];

    // 3. Thực thi câu lệnh
    const result = await db.query(query, values);
    return result;
};

exports.deleteDepartment = async (mapb) => {
    const result = await db.query("DELETE FROM phongban WHERE mapb = $1 RETURNING *", [mapb]);
    if (result.rows.length === 0) throw new Error("Không tìm thấy phòng ban để xóa");
};

exports.assignEmployeesToDepartment = async (mapb, manvList) => {
    const result = await db.query(
        "UPDATE nhanvien SET mapb = $1 WHERE manv = ANY($2::varchar[]) RETURNING manv, hotennv, mapb",
        [mapb, manvList]
    );
    return result.rows;
};

exports.getHistory = async (mapb) => {
    const result = await db.query(
        `SELECT q.*, n.hotennv 
         FROM qtcongtac q 
         JOIN nhanvien n ON q.manv = n.manv 
         WHERE q.mapb = $1 
         ORDER BY q.ngaybd DESC`, 
        [mapb]
    );
    return result.rows;
};

exports.getLeaderOfDepartment = async (mapb) => {
    const result = await db.query("SELECT matp FROM phongban WHERE UPPER(TRIM(mapb)) = $1", [mapb]);
    return result.rows[0];
};

exports.checkEmployeeStatus = async (manv) => {
    const result = await db.query("SELECT trangthai, hotennv FROM nhanvien WHERE manv = $1", [manv]);
    return result.rows[0];
};

exports.checkActiveContract = async (manv) => {
    const result = await db.query("SELECT mahd FROM hopdong WHERE manv = $1 AND trangthai = 'active'", [manv]);
    return result.rows[0];
};

exports.executeAssignTransaction = async (cleanMapb, manvList, leaderValue, oldLeader, gioVietNam) => {
    try {
        await db.query('BEGIN');

        await db.query(
            "UPDATE phongban SET matp = $1 WHERE UPPER(TRIM(mapb)) = $2",
            [leaderValue, cleanMapb]
        );

        if (oldLeader !== leaderValue) {
            if (oldLeader) {
                await db.query(
                    `UPDATE qtcongtac SET ngaykt = $1 WHERE mapb = $2 AND manv = $3 AND ngaykt IS NULL`,
                    [gioVietNam, cleanMapb, oldLeader]
                );
            }

            if (leaderValue) {
                const mact = "CT" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
                await db.query(
                    `INSERT INTO qtcongtac (mact, mapb, manv, ngaybd, macv) VALUES ($1, $2, $3, $4, 'CV02')`,
                    [mact, cleanMapb, leaderValue, gioVietNam]
                );
            }
        }

        if (manvList && manvList.length > 0) {
            await db.query("UPDATE nhanvien SET mapb = $1 WHERE manv = ANY($2::varchar[])", [cleanMapb, manvList]);
        }

        await db.query('COMMIT');
        return true;
    } catch (err) {
        await db.query('ROLLBACK');
        throw err; 
    }
};