exports.validateEmployee = (req, res, next) => {
    const { manv, hotennv, email, sdt, ngsinh, ngaybatdaulam, macv } = req.body;
    const isUpdate = req.method === 'PUT';

    // 1. Kiểm tra bắt buộc
    if (!isUpdate && (!manv || manv.trim() === "")) {
        return res.status(400).json({ error: "Mã nhân viên không được để trống." });
    }
    if (!hotennv || hotennv.trim().length < 2) {
        return res.status(400).json({ error: "Họ tên phải có ít nhất 2 ký tự." });
    }
    if (!macv || macv.trim() === "") {
        return res.status(400).json({ error: "Vui lòng chọn hoặc nhập mã chức vụ cho nhân viên." });
    }

    // 2. Định dạng Email & Số điện thoại
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Email không đúng định dạng." });
    }
    if (sdt && !/^(0[3|5|7|8|9])([0-9]{8})$/.test(sdt)) {
        return res.status(400).json({ error: "Số điện thoại không hợp lệ (10 số VN)." });
    }

    // 3. Xử lý ngày tháng
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const safeParseDate = (dateStr) => {
        if (!dateStr || dateStr.trim() === "") return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? "INVALID" : d;
    };

    const birth = safeParseDate(ngsinh);
    const start = safeParseDate(ngaybatdaulam);

    if (birth === "INVALID" || start === "INVALID") {
        return res.status(400).json({ error: "Ngày tháng không hợp lệ (Kiểm tra lại định dạng hoặc những ngày như 30/02)." });
    }

    // Kiểm tra logic Ngày sinh
    if (birth) {
        birth.setHours(0, 0, 0, 0);
        if (birth > today) return res.status(400).json({ error: "Ngày sinh không thể ở tương lai." });

        const ageNow = today.getFullYear() - birth.getFullYear();
        if (ageNow < 18) {
            return res.status(400).json({ error: "Nhân viên hiện tại phải từ 18 tuổi trở lên." });
        }
        if (ageNow > 65) {
            return res.status(400).json({ error: "Nhân viên đã vượt quá độ tuổi lao động (tối đa 65 tuổi)." });
        }
    }

    // Kiểm tra logic Ngày bắt đầu làm việc
    if (start) {
        start.setHours(0, 0, 0, 0);

        if (start > today) {
            return res.status(400).json({ error: "Ngày bắt đầu làm việc không thể vượt quá ngày hiện tại." });
        }

        if (birth) {
            if (start < birth) {
                return res.status(400).json({ error: "Ngày bắt đầu làm không thể trước ngày sinh." });
            }

            // --- LOGIC SỬA ĐỔI: Kiểm tra tuổi tại thời điểm bắt đầu đi làm ---
            let ageAtStart = start.getFullYear() - birth.getFullYear();
            const m = start.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && start.getDate() < birth.getDate())) {
                ageAtStart--;
            }

            if (ageAtStart < 18) {
                return res.status(400).json({ 
                    error: `Cảnh báo: Nhân viên mới ${ageAtStart} tuổi khi bắt đầu làm việc (${start.getFullYear()}). Phải đủ 18 tuổi.` 
                });
            }
        }
    }

    next();
};