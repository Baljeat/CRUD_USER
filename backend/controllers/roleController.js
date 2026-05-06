const roleService = require("../services/roleService");

exports.getAllRoles = async (req, res) => {
    try {
        const data = await roleService.getAllRoles();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const data = await roleService.createRole(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const data = await roleService.updateRole(req.params.macv, req.body);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        await roleService.deleteRole(req.params.macv);
        res.json({ message: "Xóa chức vụ thành công" });
    } catch (err) {
        // Lỗi 23503 là lỗi xung đột khóa ngoại trong PostgreSQL
        res.status(400).json({ error: "Không thể xóa chức vụ đang có nhân viên đảm nhận." });
    }
};