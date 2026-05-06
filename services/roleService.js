const roleRepository = require("../repositories/roleRepository");

exports.getAllRoles = async () => {
    return await roleRepository.getAllRoles();
};

exports.createRole = async (data) => {
    if (!data.macv || !data.tencv) throw new Error("Mã và tên chức vụ là bắt buộc");
    return await roleRepository.createRole(data);
};

exports.updateRole = async (macv, data) => {
    return await roleRepository.updateRole(macv, data);
};

exports.deleteRole = async (macv) => {
    return await roleRepository.deleteRole(macv);
};