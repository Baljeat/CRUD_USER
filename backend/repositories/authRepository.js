const db = require("../config/db");

// GET ALL
exports.getAllAccounts = async () => {
    const result = await db.query(
        "SELECT tentk, phanquyen, trangthai, manv FROM taikhoan"
    );
    return result.rows;
};

// GET BY USERNAME
exports.getByUsername = async (username) => {
    const result = await db.query(
        "SELECT * FROM taikhoan WHERE tentk = $1",
        [username]
    );
    return result.rows[0];
};

// CREATE
exports.createAccount = async (data) => {
    const { tentk, password, phanquyen, manv, trangthai } = data;

    // check trùng
    const check = await db.query(
        "SELECT * FROM taikhoan WHERE tentk = $1",
        [tentk]
    );

    if (check.rows.length > 0) {
        throw new Error("Tài khoản đã tồn tại");
    }

    const result = await db.query(
        `INSERT INTO taikhoan (tentk, pass, phanquyen, trangthai, manv)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [tentk, password, phanquyen, trangthai || 'active', manv]
    );

    return result.rows[0];
};
// UPDATE
exports.updateAccount = async (tentk, data) => {
    const { phanquyen, trangthai, manv } = data;

    const result = await db.query(
        `UPDATE taikhoan
         SET phanquyen = COALESCE($1, phanquyen),
             trangthai = COALESCE($2, trangthai),
             manv = COALESCE($3, manv)
         WHERE tentk = $4
         RETURNING *`,
        [phanquyen || null, trangthai || null, manv || null, tentk]
    );
    if (result.rows.length === 0) {
        throw new Error("Không tìm thấy tài khoản");
    }

    return result.rows[0];
};

// DELETE
exports.deleteAccount = async (tentk) => {
    await db.query(
        "DELETE FROM taikhoan WHERE tentk = $1",
        [tentk]
    );
};