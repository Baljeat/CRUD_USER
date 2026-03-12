const db = require("../config/db");

exports.getAllUsers = async () => {
  const result = await db.query("SELECT * FROM users ORDER BY id");
  return result.rows;
};

exports.getUserById = async (id) => {
  const result = await db.query(
    "SELECT * FROM users WHERE id=$1",
    [id]
  );
  return result.rows[0];
};

exports.createUser = async (id, name) => {
  const result = await db.query(
    "INSERT INTO users(id,name) VALUES($1,$2)",
    [id, name]
  );
  return result;
};

exports.updateUser = async (id, name) => {
  const result = await db.query(
    "UPDATE users SET name=$1 WHERE id=$2",
    [name, id]
  );
  return result;
};

exports.deleteUser = async (id) => {
  const result = await db.query(
    "DELETE FROM users WHERE id=$1",
    [id]
  );
  return result;
};