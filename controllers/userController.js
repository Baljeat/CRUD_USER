const userService = require("../services/userService");

const mockUsers = [
  { id: DH52200344, name: "Võ Phương Anh" },
  { id: DH52200423, name: "Lâm Dũ Cường" },
  { id: DH52200627, name: "Nguyễn Thúy Hằng" },
  { id: DH52200670, name: "Bành Kim Hiếu" },
  { id: DH52200975, name: "Hoàng Đặng Diệp Lân" },
  { id: DH52201679, name: "Nguyễn Hồng Quốc Trường" }
];

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    // fallback mock data
    res.json(mockUsers);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    const user = mockUsers.find(u => u.id == req.params.id);
    res.json(user || { message: "User not found" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name } = req.body;
    await userService.createUser(name);
    res.json({ message: "User created" });
  } catch (err) {
    res.json({ message: "User created (mock)" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name } = req.body;
    await userService.updateUser(req.params.id, name);
    res.json({ message: "User updated" });
  } catch (err) {
    res.json({ message: "User updated (mock)" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.json({ message: "User deleted (mock)" });
  }
};