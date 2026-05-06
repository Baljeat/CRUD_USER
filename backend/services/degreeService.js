const degreeRepository = require("../repositories/degreeRepository");

exports.getDegreesByEmployee = async (manv) => {
    return await degreeRepository.findByEmployee(manv);
};

exports.addDegree = async (data) => {
    if (!data.manv || !data.tenbc) {
        throw new Error("Mã NV và Tên bằng không được để trống.");
    }
    // Random ID cho mabc
    const mabc = "BC" + Math.floor(Math.random() * 100000000).toString().padStart(8, "0");
    return await degreeRepository.create({ ...data, mabc });
};

exports.updateDegree = async (mabc, data) => {
    if (!data.tenbc) {
        throw new Error("Tên bằng không được để trống.");
    }
    return await degreeRepository.update(mabc, data);
};

exports.deleteDegree = async (mabc) => {
    return await degreeRepository.delete(mabc);
};