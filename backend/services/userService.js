const db = require("../config/db");

exports.getAllUsers = async () => {
  const result = await db.query(
    "SELECT * FROM users ORDER BY id"
  );
  return result.rows;
};

exports.getUserById = async (id) => {
  const result = await db.query(
    "SELECT * FROM users WHERE id=$1",
    [id]
  );
  return result.rows[0];
};

exports.createUser = async (name) => {
  const result = await db.query(
    "INSERT INTO users(name) VALUES($1) RETURNING *",
    [name]
  );
  return result.rows[0];
};

exports.updateUser = async (id, name) => {
  const result = await db.query(
    "UPDATE users SET name=$1 WHERE id=$2 RETURNING *",
    [name, id]
  );
  return result.rows[0];
};

exports.deleteUser = async (id) => {
  await db.query(
    "DELETE FROM users WHERE id=$1",
    [id]
  );
};