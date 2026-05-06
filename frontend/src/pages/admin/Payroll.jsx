import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { LuWallet } from "react-icons/lu";
import "../../styles/employee.css";
import { exportToExcel } from "../../utils/excelHelper";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);

  // Mặc định load tháng/năm hiện tại (Hoặc tháng 4/2026 theo data mẫu của bạn)
  const [filters, setFilters] = useState({
    month: 4, // Để mặc định là 4 vì DB mẫu đang ở tháng 4/2026
    year: 2026,
    search: ""
  });

  // State quản lý Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số dòng tối đa hiển thị trên 1 trang

  // State quản lý Modal Sửa lương
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ manv: "", hotennv: "", kyluong: "", phucap: 0, thuong: 0, khautru: 0 });

  useEffect(() => {
    fetchPayrolls();
  }, [filters.month, filters.year]); // Gọi lại API mỗi khi đổi tháng/năm

  const fetchPayrolls = async () => {
    try {
      // Gọi API lấy danh sách lương theo tháng năm
      const res = await API.get("/luong", {
        params: { month: filters.month, year: filters.year }
      });
      setPayrolls(res.data);
    } catch (err) {
      console.error("Lỗi khi tải bảng lương:", err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1); // Tự động quay về trang 1 khi người dùng gõ tìm kiếm hoặc đổi tháng
  };

  const handleChotLuong = async () => {
    if (!window.confirm(`Hệ thống sẽ tự động tổng hợp công và tính lương cho tháng ${filters.month}/${filters.year}. Bạn có chắc chắn muốn chốt lương?`)) {
      return;
    }
    try {
      const res = await API.post("/luong/generate", { month: filters.month, year: filters.year });
      alert(res.data.message);
      fetchPayrolls(); // Tải lại bảng sau khi chốt thành công
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Có lỗi xảy ra khi chốt lương");
    }
  };

  const handleUpdateStatus = async (manv) => {
    if (!window.confirm("Xác nhận đã thanh toán lương cho nhân viên này?")) return;
    try {
      // Định dạng lại kỳ lương chuẩn YYYY-MM-01 để tránh lỗi chênh lệch múi giờ (Timezone)
      const kyluongStr = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
      await API.put("/luong/status", { manv, kyluong: kyluongStr, trangthai: "Đã trả" });
      fetchPayrolls(); // Tải lại bảng sau khi cập nhật
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Cập nhật thất bại");
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // MỞ MODAL SỬA
  const openEditModal = (payroll) => {
    const kyluongStr = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
    setEditForm({
      ...payroll,
      kyluong: kyluongStr
    });
    setIsEditModalOpen(true);
  };

  // HÀM XỬ LÝ NHẬP TIỀN TỆ (CHỈ CHO NHẬP SỐ & FORMAT CÓ DẤU CHẤM)
  const handleMoneyChange = (e, field) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Loại bỏ toàn bộ chữ và ký tự đặc biệt
    setEditForm({ ...editForm, [field]: rawValue ? Number(rawValue) : '' });
  };

  // LƯU CẬP NHẬT
  const handleSaveEdit = async () => {
    try {
      await API.put("/luong/details", editForm);
      setIsEditModalOpen(false);
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi lưu chi tiết lương");
    }
  };

  // Lọc dữ liệu theo tên hoặc mã NV (Tìm kiếm local)
  const displayedPayrolls = payrolls.filter(p => 
    (p.hotennv?.toLowerCase() || "").includes(filters.search.toLowerCase()) ||
    (p.manv?.toLowerCase() || "").includes(filters.search.toLowerCase())
  );

  // Logic cắt mảng dữ liệu cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedPayrolls.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedPayrolls.length / itemsPerPage);

  // Hàm xuất dữ liệu ra file Excel
  const handleExportExcel = () => {
    const exportData = displayedPayrolls.map(p => {
      // Tính toán lại thực nhận để xuất ra Excel cho khớp với UI
      const soNgayCongChuan = 22;
      const luongThucTe = ((Number(p.luongcoban) || 0) / soNgayCongChuan) * (Number(p.songaycong) || 0);
      const thucnhan = luongThucTe + (Number(p.phucap) || 0) + (Number(p.thuong) || 0) - (Number(p.khautru) || 0);

      const date = new Date(p.kyluong);
      const kyLuongFormat = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      return {
        "Mã NV": p.manv,
        "Họ Tên": p.hotennv,
        "Kỳ lương": kyLuongFormat,
        "Ngày công": p.songaycong,
        "Giờ Tăng ca": p.giotangca,
        "Lương Cơ bản": p.luongcoban,
        "Lương Theo công": Math.round(luongThucTe),
        "Phụ cấp": p.phucap,
        "Thưởng": p.thuong,
        "Khấu trừ": p.khautru,
        "Thực nhận": Math.round(thucnhan),
        "Trạng thái": p.trangthai
      };
    });

    // Gọi hàm Helper dùng chung chỉ với 1 dòng code
    const fileName = `BangLuong_Thang${filters.month}_${filters.year}.xlsx`;
    exportToExcel(exportData, "Bảng Lương", fileName);
  };

  return (
    <div className="employee-container">
      <div className="header-actions">
        <h1>Quản lý Bảng Lương</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleExportExcel} style={{ background: "#4e73df", color: "white", padding: "12px 24px", fontSize: "15px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            Xuất Excel
          </button>
          <button className="btn-add-new" onClick={handleChotLuong} style={{ background: "#10b981", padding: "12px 24px", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <LuWallet size={20} /> Chốt lương tháng {filters.month}/{filters.year}
          </button>
        </div>
      </div>

      <div className="filter-section" style={{ marginBottom: "20px" }}>
        <input 
          name="search" 
          placeholder="Tìm tên hoặc mã NV..." 
          value={filters.search} 
          onChange={handleFilterChange} 
        />
        <select name="month" value={filters.month} onChange={handleFilterChange}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
          ))}
        </select>
        <select name="year" value={filters.year} onChange={handleFilterChange}>
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="employee-table" style={{ minWidth: "1500px" }}>
          <thead>
            <tr>
              <th>Mã NV</th>
              <th style={{ minWidth: "160px" }}>Họ Tên</th>
              <th>Kỳ lương</th>
              <th style={{ minWidth: "140px" }}>Lương CB</th>
              <th>Ngày công</th>
              <th>Tăng ca</th>
              <th style={{ minWidth: "120px" }}>Phụ cấp</th>
              <th style={{ minWidth: "120px" }}>Thưởng</th>
              <th style={{ minWidth: "120px" }}>Khấu trừ</th>
              <th style={{ minWidth: "140px" }}>Thực nhận</th>
              <th>Trạng thái</th>
              <th style={{ minWidth: "150px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((p, index) => {
                // Tính toán tiền lương thực tế dựa trên ngày công (Quy định 22 ngày công chuẩn/tháng)
                const soNgayCongChuan = 22;
                const luongThucTe = ((Number(p.luongcoban) || 0) / soNgayCongChuan) * (Number(p.songaycong) || 0);
                
                const thucnhan = luongThucTe + (Number(p.phucap) || 0) + (Number(p.thuong) || 0) - (Number(p.khautru) || 0);
                
                // Format lại kỳ lương từ yyyy-mm-dd sang mm/yyyy
                const date = new Date(p.kyluong);
                const kyLuongFormat = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

                return (
                <tr key={`${p.manv}-${index}`}>
                  <td><strong>{p.manv}</strong></td>
                  <td>{p.hotennv}</td>
                  <td>{kyLuongFormat}</td>
                  {/* Hiển thị lương cơ bản (Hợp đồng) và Mức lương tính theo ngày công thực tế */}
                  <td>
                    <div>{formatMoney(p.luongcoban || 0)}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Theo công: {formatMoney(luongThucTe)}</div>
                  </td>
                  <td>{p.songaycong}</td>
                  <td>{p.giotangca}h</td>
                  <td>{formatMoney(p.phucap)}</td>
                  <td>{formatMoney(p.thuong)}</td>
                  <td style={{ color: "#ef4444" }}>-{formatMoney(p.khautru)}</td>
                  <td style={{ fontWeight: "bold", color: "#27ae60", fontSize: "15px" }}>
                    {formatMoney(thucnhan)}
                  </td>
                  <td>
                    <span style={{
                      padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold",
                      background: p.trangthai === "Đã trả" ? "#dcfce7" : "#fee2e2",
                      color: p.trangthai === "Đã trả" ? "#166534" : "#991b1b",
                      border: p.trangthai === "Đã trả" ? "1px solid #bbf7d0" : "1px solid #fecaca"
                    }}>
                      {p.trangthai}
                    </span>
                  </td>
                  <td className="action-btns">
                    {p.trangthai === "Chưa trả" && (
                      <>
                        <button className="btn-edit" onClick={() => openEditModal(p)} style={{ background: "#4e73df", color: "white" }}>Sửa</button>
                        <button 
                          className="btn-add-new" 
                          onClick={() => handleUpdateStatus(p.manv)} 
                          style={{ padding: "5px 10px", marginLeft: "5px", background: "#f59e0b" }}
                        >
                          Đã trả
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" style={{ textAlign: "center", padding: "20px" }}>Chưa có dữ liệu bảng lương tháng này</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', paddingBottom: '20px' }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155', fontWeight: 'bold' }}
          >
            Trước
          </button>
          <span style={{ fontWeight: 'bold', color: '#475569' }}>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: currentPage === totalPages ? '#f8fafc' : 'white', color: currentPage === totalPages ? '#94a3b8' : '#334155', fontWeight: 'bold' }}
          >
            Sau
          </button>
        </div>
      )}

      {/* MODAL SỬA CHI TIẾT LƯƠNG */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>Điều chỉnh lương thủ công</h2>
              <button className="btn-close-modal" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            
            <div style={{ marginBottom: "15px", padding: "10px", background: "#f1f5f9", borderRadius: "6px", color: "#334155", fontSize: "14px" }}>
              <strong>Nhân viên:</strong> {editForm.hotennv} ({editForm.manv}) <br/>
              <em>* Lưu ý: Không thể sửa Ngày công/Giờ làm tại đây. Hãy sửa trong bảng Chấm công.</em>
            </div>

            <div className="form-group">
              <label>Tiền Phụ cấp (VNĐ)</label>
              <input type="text" value={editForm.phucap !== '' && editForm.phucap !== null ? Number(editForm.phucap).toLocaleString('vi-VN') : ''} onChange={e => handleMoneyChange(e, 'phucap')} />
            </div>
            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>Tiền Thưởng (VNĐ)</label>
              <input type="text" value={editForm.thuong !== '' && editForm.thuong !== null ? Number(editForm.thuong).toLocaleString('vi-VN') : ''} onChange={e => handleMoneyChange(e, 'thuong')} />
            </div>
            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>Khấu trừ / Phạt (VNĐ)</label>
              <input type="text" value={editForm.khautru !== '' && editForm.khautru !== null ? Number(editForm.khautru).toLocaleString('vi-VN') : ''} onChange={e => handleMoneyChange(e, 'khautru')} />
            </div>
            
            <div className="form-actions" style={{ marginTop: "25px" }}>
              <button className="btn-clear" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
              <button className="btn-save" onClick={handleSaveEdit}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}