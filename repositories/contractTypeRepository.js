const db = require("../config/db");

exports.getAll = async () => {
    const result = await db.query("SELECT * FROM loaihopdong ORDER BY maloaihd ASC");
    return result.rows;
};

exports.create = async (data) => {
    const { maloaihd, tenloai } = data;
    const result = await db.query(
        "INSERT INTO loaihopdong (maloaihd, tenloai) VALUES ($1, $2) RETURNING *",
        [maloaihd, tenloai]
    );
    return result.rows[0];
};

exports.update = async (maloaihd, data) => {
    const result = await db.query("UPDATE loaihopdong SET tenloai = $1 WHERE maloaihd = $2 RETURNING *", [data.tenloai, maloaihd]);
    return result.rows[0];
};

exports.delete = async (maloaihd) => {
    await db.query("DELETE FROM loaihopdong WHERE maloaihd = $1", [maloaihd]);
};