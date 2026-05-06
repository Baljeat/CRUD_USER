const departmentService = require("../services/departmentService");

exports.getAllDepartments = async (req, res) => {
    try {
        const data = await departmentService.getAllDepartments();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const data = await departmentService.createDepartment(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const data = await departmentService.updateDepartment(req.params.mapb, req.body);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        await departmentService.deleteDepartment(req.params.mapb);
        res.json({ message: "Xóa phòng ban thành công" });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ error: "Không thể xóa phòng ban đang có nhân viên." });
        }
        res.status(400).json({ error: err.message });
    }
};

exports.assignEmployees = async (req, res) => {
    try {
        // 1. Lấy ĐỦ cả manvList và matp từ body
        const { manvList, matp } = req.body; 
        
        // 2. Truyền ĐỦ 3 tham số vào Service
        const data = await departmentService.assignEmployeesToDepartment(
            req.params.mapb, 
            manvList, 
            matp
        );
        
        // 3. Trả về message chuẩn để Frontend nhận alert
        res.json({ 
            message: "Cập nhật nhân sự và trưởng phòng thành công", 
            data: data 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { mapb } = req.params;
        const history = await departmentService.getHistory(mapb);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};