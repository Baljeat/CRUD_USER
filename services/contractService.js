const contractRepository = require("../repositories/contractRepository");

exports.getAll = async () => {
    return await contractRepository.getAll();
};

exports.create = async (data) => {
    const newContract = await contractRepository.create(data);
    
    // Tự động Active nhân viên và tài khoản khi ký hợp đồng mới
    if (data.manv) {
        await contractRepository.activateEmployeeAndAccount(data.manv);
    }
    return newContract;
};

exports.update = async (id, data) => {
    const updatedContract = await contractRepository.update(id, data);
    
    // Tự động Active nhân viên và tài khoản khi gia hạn/sửa hợp đồng
    const manv = data.manv || (updatedContract && updatedContract.manv);
    if (manv) {
        await contractRepository.activateEmployeeAndAccount(manv);
    }
    
    return updatedContract;
};