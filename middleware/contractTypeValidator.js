exports.validateContractType = (req, res, next) => {
    const { maloaihd, tenloai } = req.body;
    const isUpdate = req.method === 'PUT';

    if (!isUpdate && (!maloaihd || maloaihd.trim().length < 2)) {
        return res.status(400).json({ error: "Mã loại hợp đồng bắt buộc và phải có ít nhất 2 ký tự." });
    }
    if (!tenloai || tenloai.trim().length < 2) {
        return res.status(400).json({ error: "Tên loại hợp đồng bắt buộc và phải có ít nhất 2 ký tự." });
    }
    
    next();
};