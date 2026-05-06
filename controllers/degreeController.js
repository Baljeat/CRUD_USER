const degreeService = require("../services/degreeService");

// 1. LẤY DANH SÁCH BẰNG CẤP CỦA 1 NHÂN VIÊN
exports.getDegreesByEmployee = async (req, res) => {
    try {
        const { manv } = req.params;
        const data = await degreeService.getDegreesByEmployee(manv);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy dữ liệu bằng cấp: " + error.message });
    }
};

// 2. THÊM BẰNG CẤP MỚI
exports.addDegree = async (req, res) => {
    try {
        const data = await degreeService.addDegree(req.body);
        res.status(201).json({ message: "Thêm bằng cấp thành công!", data });
    } catch (error) {
        res.status(400).json({ error: "Lỗi khi thêm bằng cấp: " + error.message });
    }
};

// 3. CẬP NHẬT BẰNG CẤP
exports.updateDegree = async (req, res) => {
    try {
        const data = await degreeService.updateDegree(req.params.mabc, req.body);
        res.status(200).json({ message: "Cập nhật bằng cấp thành công!", data });
    } catch (error) {
        res.status(400).json({ error: "Lỗi khi cập nhật bằng cấp: " + error.message });
    }
};

// 4. XÓA BẰNG CẤP
exports.deleteDegree = async (req, res) => {
    try {
        const { mabc } = req.params;
        await degreeService.deleteDegree(mabc);
        res.status(200).json({ message: "Đã xóa bằng cấp thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi xóa bằng cấp: " + error.message });
    }
};