const departmentRepository = require("../repositories/departmentRepository");
const moment = require('moment-timezone');

exports.getAllDepartments = async () => {
    return await departmentRepository.getAllDepartments();
};

exports.getDepartmentById = async (mapb) => {
    return await departmentRepository.getDepartmentById(mapb);
};

exports.createDepartment = async (data) => {
    if (!data.mapb || !data.tenpban) {
        throw new Error("Mã và tên phòng ban là bắt buộc");
    }
    return await departmentRepository.createDepartment(data);
};

exports.updateDepartment = async (mapb, data) => {
    return await departmentRepository.updateDepartment(mapb, data);
};

exports.deleteDepartment = async (mapb) => {
    return await departmentRepository.deleteDepartment(mapb);
};

exports.assignEmployeesToDepartment = async (mapb, manvList, matp) => {
    // 1. Khai báo biến chuẩn hóa ngay đầu hàm
    const cleanMapb = mapb.trim().toUpperCase();
    const leaderValue = (matp === "" || matp === null || matp === undefined) ? null : matp.trim().toUpperCase();
    
    // 2. Lấy giờ Việt Nam chuẩn GMT+7 (Kèm Z để tạo đuôi +07:00, giúp DB không bị nhầm là giờ UTC)
    const gioVietNam = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ssZ");

    console.log(`--- ĐANG THỰC THI GÁN NHÂN SỰ & LỊCH SỬ (Giờ VN: ${gioVietNam}) ---`);
    
    // 3. Lấy thông tin Trưởng phòng hiện tại
    const oldDeptData = await departmentRepository.getLeaderOfDepartment(cleanMapb);
    
    if (!oldDeptData) {
        throw new Error(`Không tìm thấy phòng ban [${cleanMapb}]`);
    }
    
    const oldLeader = oldDeptData.matp;

    // 4. Kiểm tra trạng thái nhân viên được bổ nhiệm (Chặn người nghỉ việc)
    if (leaderValue) {
        const emp = await departmentRepository.checkEmployeeStatus(leaderValue);

        if (!emp) {
            throw new Error(`Nhân viên mã [${leaderValue}] không tồn tại.`);
        }

        if (emp.trangthai === 'Nghỉ việc' || emp.trangthai === 'nghỉ việc') {
            throw new Error(`Không thể bổ nhiệm [${emp.hotennv}] làm Trưởng phòng vì nhân viên này đã nghỉ việc!`);
        }

        // --- BỔ SUNG LOGIC: RÀNG BUỘC PHÁP LÝ HỢP ĐỒNG LAO ĐỘNG ---
        const hasContract = await departmentRepository.checkActiveContract(leaderValue);
        if (!hasContract) {
            throw new Error(`Rủi ro pháp lý: Không thể bổ nhiệm [${emp.hotennv}] làm Trưởng phòng vì nhân viên này chưa có Hợp đồng lao động (HĐLĐ) đang có hiệu lực! Vui lòng ký hợp đồng trước khi giao chức vụ.`);
        }
    }

    // 5. Uỷ quyền Transaction cho Repository
    return await departmentRepository.executeAssignTransaction(cleanMapb, manvList, leaderValue, oldLeader, gioVietNam);
};

exports.getHistory = async (mapb) => {
    return await departmentRepository.getHistory(mapb);
};