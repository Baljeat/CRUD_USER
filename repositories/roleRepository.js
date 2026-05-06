const db = require("../config/db");

exports.getAllRoles = async () => {
    const result = await db.query("SELECT * FROM chucvu ORDER BY macv ASC");
    return result.rows;
};

exports.createRole = async (data) => {
    const { macv, tencv, mota } = data;
    const result = await db.query(
        "INSERT INTO chucvu (macv, tencv, mota) VALUES ($1, $2, $3) RETURNING *",
        [macv, tencv, mota]
    );
    return result.rows[0];
};

exports.updateRole = async (macv, data) => {
    const { tencv, mota } = data;
    const result = await db.query(
        "UPDATE chucvu SET tencv = COALESCE($1, tencv), mota = COALESCE($2, mota) WHERE macv = $3 RETURNING *",
        [tencv, mota, macv]
    );
    return result.rows[0];
};

exports.deleteRole = async (macv) => {
    await db.query("DELETE FROM chucvu WHERE macv = $1", [macv]);
};