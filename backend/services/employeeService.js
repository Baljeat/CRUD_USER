const employeeRepository = require("../repositories/employeeRepository");

exports.getEmployees = async (filters) => {
    return await employeeRepository.getEmployees(filters);
};

exports.getEmployeeById = async (manv) => {
    return await employeeRepository.getEmployeeById(manv);
};

exports.createEmployee = async (data) => {
    // Logic tự động tạo thông tin tài khoản
    const numberPart = data.manv.replace(/nv/i, '');
    const tenTaiKhoan = `user${parseInt(numberPart, 10)}`;

    const userData = {
        tentk: tenTaiKhoan,
        pass: "123",
        phanquyen: "nhanvien",
        trangthai: "active",
        manv: data.manv
    };
    
    // Xử lý list Bằng cấp đính kèm trong transaction
    let degreesToInsert = [];
    if (data.degrees && Array.isArray(data.degrees)) {
        degreesToInsert = data.degrees.map(deg => ({
            ...deg,
            mabc: "BC" + Math.floor(Math.random() * 100000000).toString().padStart(8, "0"),
            manv: data.manv
        }));
    }
    
    return await employeeRepository.createEmployeeWithAccount(data, userData, degreesToInsert);
};

exports.updateEmployee = async (manv, data) => {
    return await employeeRepository.updateEmployee(manv, data);
};

exports.deleteEmployee = async (manv) => {
    return await employeeRepository.deleteEmployee(manv);
};

exports.softDeleteEmployee = async (manv) => {
    return await employeeRepository.softDeleteEmployee(manv);
};