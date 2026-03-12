const db = require("../config/db");

/* GET ALL USERS */

exports.getAllUsers = async () => {
  const result = await db.query("SELECT * FROM users ORDER BY id");
  return result.rows;
};

/* GET USER BY ID */

exports.getUserById = async (id) => {
  const result = await db.query(
    "SELECT * FROM users WHERE id=$1",
    [id]
  );
  return result.rows[0];
};

/* CREATE USER */

exports.createUser = async (mssv, name) => {
  const result = await db.query(
    "INSERT INTO users(mssv,name) VALUES($1,$2) RETURNING *",
    [mssv, name]
  );
  return result.rows[0];
};

/* UPDATE USER */

exports.updateUser = async (id, name) => {
  const result = await db.query(
    "UPDATE users SET name=$1 WHERE id=$2 RETURNING *",
    [name, id]
  );
  return result.rows[0];
};

/* DELETE USER */

exports.deleteUser = async (id) => {
  const result = await db.query(
    "DELETE FROM users WHERE id=$1",
    [id]
  );
  return result;
};