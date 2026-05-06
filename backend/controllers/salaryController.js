const salaryService = require("../services/salaryService");

exports.getMySalary = async (req, res) => {
  try {
    const data = await salaryService.getMySalary(req.user.manv);
    res.json(data);
  } catch (err) {
    console.error("Lỗi lấy lương:", err); // Thêm log chi tiết
    res.status(500).json({ error: err.message });
  }
};

exports.getAllSalaries = async (req, res) => {
    try {
        const { month, year } = req.query;
        const data = await salaryService.getAllSalaries(month, year);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách lương: " + error.message });
    }
};

exports.generatePayroll = async (req, res) => {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ error: "Thiếu thông tin tháng/năm." });

    try {
        const result = await salaryService.generatePayroll(month, year);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes("Không có dữ liệu")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Lỗi chốt lương: " + error.message });
    }
};

exports.updateSalaryStatus = async (req, res) => {
    const { manv, kyluong, trangthai } = req.body;
    if (!manv || !kyluong || !trangthai) return res.status(400).json({ error: "Thiếu thông tin cập nhật." });

    try {
        await salaryService.updateSalaryStatus(manv, kyluong, trangthai);
        res.status(200).json({ message: "Cập nhật trạng thái thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi cập nhật trạng thái: " + error.message });
    }
};

exports.updateSalaryDetails = async (req, res) => {
    const { manv, kyluong, phucap, thuong, khautru } = req.body;
    if (!manv || !kyluong) return res.status(400).json({ error: "Thiếu thông tin nhận diện bảng lương." });

    try {
        await salaryService.updateSalaryDetails(manv, kyluong, phucap, thuong, khautru);
        res.status(200).json({ message: "Cập nhật chi tiết lương thành công!" });
    } catch (error) {
        if (error.message.includes("Không tìm thấy") || error.message.includes("Không thể chỉnh sửa")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Lỗi cập nhật chi tiết lương: " + error.message });
    }
};
