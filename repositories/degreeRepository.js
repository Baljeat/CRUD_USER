const db = require("../config/db");

exports.findByEmployee = async (manv) => {
    const result = await db.query(
        "SELECT * FROM bangcap WHERE manv = $1 ORDER BY namtotnghiep DESC", 
        [manv]
    );
    return result.rows;
};

exports.create = async (data) => {
    const { mabc, manv, tenbc, chuyennganh, xeploai, namtotnghiep, truongdaotao } = data;
    const result = await db.query(
        `INSERT INTO bangcap (mabc, manv, tenbc, chuyennganh, xeploai, namtotnghiep, truongdaotao) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [mabc, manv, tenbc, chuyennganh, xeploai, namtotnghiep || null, truongdaotao]
    );
    return result.rows[0];
};

exports.update = async (mabc, data) => {
    const { tenbc, chuyennganh, xeploai, namtotnghiep, truongdaotao } = data;
    const result = await db.query(
        `UPDATE bangcap SET tenbc = $1, chuyennganh = $2, xeploai = $3, namtotnghiep = $4, truongdaotao = $5
         WHERE mabc = $6 RETURNING *`,
        [tenbc, chuyennganh, xeploai, namtotnghiep || null, truongdaotao, mabc]
    );
    return result.rows[0];
};

exports.delete = async (mabc) => {
    await db.query("DELETE FROM bangcap WHERE mabc = $1", [mabc]);
};