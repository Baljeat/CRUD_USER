const employeeService = require("../services/employeeService");
const db= require("../config/db");

exports.getEmployees = async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            macv: req.query.macv,
            mapb: req.query.mapb,
            trangthai: req.query.trangthai
        };
        
        const data = await employeeService.getEmployees(filters);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const data = await employeeService.getEmployeeById(req.params.manv);
        if (!data) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const data = await employeeService.createEmployee(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const data = await employeeService.updateEmployee(req.params.manv, req.body);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    const { manv } = req.params;
    try {
        // GỌI HÀM NÀY: Để nó chạy logic kiểm tra xem có phải Trưởng phòng không
        const result = await employeeService.softDeleteEmployee(manv);
        
        res.json({ 
            message: "Nhân viên đã nghỉ việc và tài khoản đã bị khoá thành công",
            data: result 
        });
    } catch (err) {
        console.error("Lỗi khi cho nhân viên nghỉ việc:", err.message);
        // Trả về lỗi 400 và nội dung lỗi từ Service (để hiện alert ở Frontend)
        res.status(400).json({ error: err.message });
    }
};