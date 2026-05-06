
exports.validateDepartment = (req, res, next) => {
    const { mapb, tenpban } = req.body;
    const isUpdate = req.method === 'PUT';

    // 1. Kiểm tra Mã phòng ban (Chỉ bắt buộc khi POST/Thêm mới)
    if (!isUpdate) {
        if (!mapb || mapb.trim().length < 2) {
            return res.status(400).json({ error: "Mã phòng ban là bắt buộc và phải có ít nhất 2 ký tự." });
        }
        if (/[^a-zA-Z0-9]/.test(mapb)) {
            return res.status(400).json({ error: "Mã phòng ban không được chứa ký tự đặc biệt." });
        }
    }

    // 2. Kiểm tra Tên phòng ban
    if (!tenpban || tenpban.trim().length < 2) {
        return res.status(400).json({ error: "Tên phòng ban phải từ 3 ký tự trở lên." });
    }

    next();
};

exports.validateAssign = (req, res, next) => {
    const { manvList } = req.body;
    
    // Kiểm tra nếu danh sách nhân viên gán vào phòng ban bị trống
    if (req.method === 'POST' && (!manvList || !Array.isArray(manvList))) {
        return res.status(400).json({ error: "Danh sách nhân viên (manvList) không hợp lệ." });
    }
    
    next();
};