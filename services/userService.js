const userRepo = require("../repositories/userRepository");

exports.getAllUsers = async () => {
  return await userRepo.getAllUsers();
};

exports.getUserById = async (id) => {
  return await userRepo.getUserById(id);
};

exports.createUser = async (name) => {
  return await userRepo.createUser(name);
};

exports.updateUser = async (id, name) => {
  return await userRepo.updateUser(id, name);
};

exports.deleteUser = async (id) => {
  return await userRepo.deleteUser(id);
};