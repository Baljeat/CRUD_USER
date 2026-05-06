const salaryRepo = require("../repositories/salaryRepository");

exports.getMySalary = async (manv) => {
  return await salaryRepo.getSalaryByEmployee(manv);
};

exports.getAllSalaries = async (month, year) => {
    return await salaryRepo.getAllSalaries(month, year);
};

exports.generatePayroll = async (month, year) => {
    // Quy định kỳ lương là ngày mùng 1 của tháng
    const kyluong = `${year}-${month.toString().padStart(2, '0')}-01`;

    // 1. Lấy thống kê chấm công trong tháng
    const attendanceStats = await salaryRepo.getAttendanceStats(month, year);

    if (attendanceStats.length === 0) {
        throw new Error("Không có dữ liệu chấm công nào trong tháng này để chốt lương.");
    }

    // 2. Lặp qua từng nhân viên để tính toán logic
    for (let row of attendanceStats) {
        const { manv, songaycong, giotangca, solantre } = row;
        const overtimeHours = parseFloat(giotangca || 0);
        const lateCount = parseInt(solantre || 0);

        const contract = await salaryRepo.getActiveContract(manv);
        if (!contract) continue; 

        const { mahd, luongcoban } = contract;
        const luong1Gio = luongcoban / 22 / 8;

        const thuongTangCa = Math.round(overtimeHours * luong1Gio * 1.5);
        const khauTruTre = lateCount * 50000; 

        // 3. Lưu vào database
        await salaryRepo.upsertSalary({
            manv, kyluong, songaycong, giotangca: overtimeHours, thuong: thuongTangCa, khautru: khauTruTre, mahd
        });
    }
    return { message: "Đã chốt bảng lương tháng thành công!" };
};

exports.updateSalaryStatus = async (manv, kyluong, trangthai) => {
    await salaryRepo.updateSalaryStatus(manv, kyluong, trangthai);
};

exports.updateSalaryDetails = async (manv, kyluong, phucap, thuong, khautru) => {
    const checkRes = await salaryRepo.getSalaryStatus(manv, kyluong);
    if (!checkRes) throw new Error("Không tìm thấy dữ liệu lương.");
    if (checkRes.trangthai === 'Đã trả') throw new Error("Bảng lương này đã được thanh toán. Không thể chỉnh sửa!");

    await salaryRepo.updateSalaryDetails(manv, kyluong, phucap, thuong, khautru);
};
