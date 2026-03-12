const userService = require("../services/userService");

/* GET ALL USERS */

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* GET USER BY ID */

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* CREATE USER */

exports.createUser = async (req, res) => {
  try {

    const { mssv, name } = req.body;

    await userService.createUser(mssv, name);

    res.json({ message: "User created" });

  } catch (err) {

    if (err.code === "23505") {
      return res.status(400).json({
        error: "MSSV already exists"
      });
    }

    res.status(500).json({ error: err.message });
  }
};

/* UPDATE USER */

exports.updateUser = async (req, res) => {
  try {

    const { name } = req.body;

    const user = await userService.updateUser(req.params.id, name);

    res.json({
      message: "User updated",
      data: user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* DELETE USER */

exports.deleteUser = async (req, res) => {
  try {

    await userService.deleteUser(req.params.id);

    res.json({
      message: "User deleted"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};