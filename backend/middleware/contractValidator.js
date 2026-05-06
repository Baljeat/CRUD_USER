const contractRepo = require("../repositories/contractRepository");

exports.validateContract = async (req, res, next) => {
    const { mahd, manv, maloaihd, luongcoban, ngayky, ngaybd, ngaykt } = req.body;
    const isUpdate = req.method === 'PUT';

    // Helper an toàn để tránh lỗi undefined.trim()
    const safeString = (val) => (val && typeof val === 'string' ? val.trim() : "");
    const maHD = safeString(mahd);
    const maNV = safeString(manv);
    const maLoai = safeString(maloaihd);

    // 1. Validate Mã Hợp Đồng (Chỉ check khi thêm mới)
    if (!isUpdate) {
        if (!maHD) {
            return res.status(400).json({ error: "Mã hợp đồng không được để trống." });
        }
        // Regex bắt buộc bắt đầu bằng HD, theo sau là ít nhất 2 chữ số (VD: HD01, HD02)
        if (!/^HD\d{2,}$/.test(maHD)) {
            return res.status(400).json({ error: "Mã hợp đồng phải bắt đầu bằng 'HD' và theo sau là các chữ số (VD: HD01, HD123)." });
        }
    }

    // 2. Validate ràng buộc khoá ngoại cơ bản
    if (!maNV) {
        return res.status(400).json({ error: "Vui lòng chọn nhân viên." });
    }
    if (!maLoai) {
        return res.status(400).json({ error: "Vui lòng chọn loại hợp đồng." });
    }

    // 3. Validate Lương cơ bản & Ràng buộc theo Loại Hợp đồng
    const luong = Number(luongcoban);
    if (luongcoban === undefined || luongcoban === null || isNaN(luong) || luong < 0) {
        return res.status(400).json({ error: "Lương cơ bản phải là số hợp lệ và lớn hơn hoặc bằng 0." });
    }
    if (luong > 500000000) {
        return res.status(400).json({ error: "Lương cơ bản nhập vào quá lớn (vượt quá 500 triệu), vui lòng kiểm tra lại số liệu." });
    }

    // Theo DB mẫu: LHD01 (Thử việc), LHD02 (Chính thức), LHD03 (Thời vụ)
    if (maLoai === 'LHD02' && luong < 4000000) {
        return res.status(400).json({ error: "Hợp đồng Chính thức: Lương cơ bản không được thấp hơn mức tối thiểu vùng (4.000.000 VNĐ)." });
    }
    if (maLoai === 'LHD01' && luong < 3000000) {
        return res.status(400).json({ error: "Hợp đồng Thử việc: Lương cơ bản không được thấp hơn 3.000.000 VNĐ." });
    }

    // 4. Validate Logic Ngày tháng
    const safeParseDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === "") return null;
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0); // Đưa về 0h để so sánh ngày cho chuẩn
        return isNaN(d.getTime()) ? null : d;
    };

    const ky = safeParseDate(ngayky);
    const bd = safeParseDate(ngaybd);
    const kt = safeParseDate(ngaykt);

    if (!ky || !bd) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ Ngày ký và Ngày bắt đầu." });
    }
    
    // Bỏ điều kiện "ky > bd" để HR có thể in và ký hợp đồng sau khi NV đã đi làm
    // Nếu có Ngày kết thúc thì bắt buộc phải sau Ngày bắt đầu
    if (kt && kt <= bd) {
        return res.status(400).json({ error: "Ngày kết thúc hợp đồng bắt buộc phải sau ngày bắt đầu." });
    }

    // Giới hạn thời gian Thử việc (LHD01) tối đa 60 ngày theo Luật LĐ & Bắt buộc phải có ngày kết thúc
    if (maLoai === 'LHD01') {
        if (!kt) {
            return res.status(400).json({ error: "Hợp đồng Thử việc bắt buộc phải có Ngày kết thúc." });
        }
        const diffDays = Math.round((kt - bd) / (1000 * 60 * 60 * 24));
        if (diffDays > 60) {
            return res.status(400).json({ error: "Hợp đồng Thử việc không được có thời hạn vượt quá 60 ngày theo Luật Lao động." });
        }
    }

    // 5. Validate Hợp đồng xác định thời hạn (Không phải thử việc và có ngày kết thúc)
    if (maLoai !== 'LHD01' && kt) {
        // 5.1. Thời hạn tối đa không quá 36 tháng
        const maxEndDate = new Date(bd);
        maxEndDate.setFullYear(maxEndDate.getFullYear() + 3);
        if (kt > maxEndDate) {
            return res.status(400).json({ error: "Hợp đồng xác định thời hạn không được vượt quá 36 tháng (3 năm) theo Luật Lao động." });
        }

        // 5.2. Chỉ được ký tối đa 2 lần HĐ xác định thời hạn
        try {
            const excludeMahd = isUpdate ? maHD : null;
            const count = await contractRepo.countFixedTermContracts(maNV, excludeMahd);
            
            if (count >= 2) {
                return res.status(400).json({ error: "Theo Luật Lao động, chỉ được ký tối đa 2 lần HĐ xác định thời hạn. Hợp đồng tiếp theo bắt buộc phải là Không xác định thời hạn (Vui lòng bỏ trống Ngày kết thúc)." });
            }
        } catch (err) {
            return res.status(500).json({ error: "Lỗi kiểm tra lịch sử hợp đồng: " + err.message });
        }
    }

    next();
};