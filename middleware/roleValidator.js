exports.validateRole = (req, res, next) => {
    const { macv, tencv } = req.body;
    const isUpdate = req.method === 'PUT';

    // Khi tạo mới (POST) bắt buộc phải có mã chức vụ
    if (!isUpdate && (!macv || macv.trim().length < 2)) {
        return res.status(400).json({ error: "Mã chức vụ bắt buộc và phải có ít nhất 2 ký tự." });
    }
    // Bắt buộc phải có tên chức vụ
    if (!tencv || tencv.trim().length < 2) {
        return res.status(400).json({ error: "Tên chức vụ bắt buộc và phải có ít nhất 2 ký tự." });
    }
    next();
};