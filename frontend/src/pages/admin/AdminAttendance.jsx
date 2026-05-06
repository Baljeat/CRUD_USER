import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "../../styles/employee.css";
import * as XLSX from "xlsx";

export default function AdminAttendance() {
  const [attendances, setAttendances] = useState([]);

  // Mặc định load theo ngày hiện tại
  const today = new Date().toISOString().split("T")[0];
  const [filters, setFilters] = useState({
    filterType: "date", // 'date' hoặc 'month'
    date: today,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    search: ""
  });

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Sửa giờ chấm công
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ 
    macc: "", hotennv: "", ngaylam: "", checkin: "", checkoutLocal: "", trangthai: "" 
  });

  useEffect(() => {
    fetchAttendances();
  }, [filters.filterType, filters.date, filters.month, filters.year]);

  const fetchAttendances = async () => {
    try {
      let params = {};
      if (filters.filterType === "date") {
        params.date = filters.date;
      } else {
        params.month = filters.month;
        params.year = filters.year;
      }

      // Giả định backend base route cho chấm công là /chamcong
      const res = await API.get("/chamcong/admin/all", { params });
      setAttendances(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách chấm công:", err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  // Helper chuyển đổi Date sang chuẩn local (VN) dùng cho thẻ input type="datetime-local"
  const toLocalISOString = (dateObj) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const openEditModal = (record) => {
    // Xác định giờ Checkout mặc định để hiển thị lên UI
    let defaultCheckout = record.checkout;
    if (!defaultCheckout) {
      // Nếu chưa có checkout, mặc định gợi ý 17:00 của ngày đó
      const d = new Date(record.checkin);
      d.setHours(17, 0, 0, 0);
      defaultCheckout = d;
    }

    setEditForm({
      ...record,
      checkoutLocal: toLocalISOString(defaultCheckout),
      trangthai: record.trangthai || ""
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Chuyển lại từ local input thành chuẩn ISO để gửi xuống Backend
      const checkoutTime = new Date(editForm.checkoutLocal).toISOString();
      
      await API.put(`/chamcong/admin/update/${editForm.macc}`, {
        checkout: checkoutTime,
        trangthai: editForm.trangthai // Nếu để trống, BE sẽ tự tính Tăng ca/Đủ công
      });
      
      setIsEditModalOpen(false);
      fetchAttendances();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi cập nhật giờ chấm công");
    }
  };

  // Format giờ & Ngày hiển thị
  const formatTime = (isoString) => {
    if (!isoString) return "--:--:--";
    return new Date(isoString).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  const formatDate = (isoString) => {
    if (!isoString) return "--/--/----";
    return new Date(isoString).toLocaleDateString("vi-VN");
  };

  // Lọc dữ liệu local bằng Search
  const displayedAttendances = attendances.filter(a => 
    (a.hotennv?.toLowerCase() || "").includes(filters.search.toLowerCase()) ||
    (a.manv?.toLowerCase() || "").includes(filters.search.toLowerCase())
  );

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedAttendances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedAttendances.length / itemsPerPage);

  // Hàm xuất dữ liệu ra file Excel
  const handleExportExcel = () => {
    // 1. Chuẩn bị dữ liệu xuất với các cột tiếng Việt
    const exportData = displayedAttendances.map(a => ({
      "Mã CC": a.macc,
      "Mã NV": a.manv,
      "Họ Tên": a.hotennv,
      "Phòng ban": a.tenpban || "Chưa xếp phòng",
      "Ngày làm": formatDate(a.ngaylam),
      "Check-in": formatTime(a.checkin),
      "Check-out": formatTime(a.checkout),
      "Giờ làm (h)": a.sogiolam || "",
      "Trạng thái": a.trangthai
    }));

    // 2. Tạo WorkSheet và WorkBook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chấm Công");

    // 3. Đặt tên file động theo bộ lọc và tải xuống
    const fileName = filters.filterType === "date" 
      ? `ChamCong_${filters.date}.xlsx` 
      : `ChamCong_Thang${filters.month}_${filters.year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="employee-container">
      <div className="header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Quản lý Chấm Công (Admin)</h1>
        <button onClick={handleExportExcel} style={{ background: "#10b981", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          Xuất Excel
        </button>
      </div>

      <div className="filter-section" style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <input 
          name="search" 
          placeholder="Tìm tên hoặc mã NV..." 
          value={filters.search} 
          onChange={handleFilterChange} 
        />
        
        <select name="filterType" value={filters.filterType} onChange={handleFilterChange} style={{ padding: "8px", borderRadius: "6px" }}>
          <option value="date">Lọc theo Ngày</option>
          <option value="month">Lọc theo Tháng</option>
        </select>

        {filters.filterType === "date" ? (
          <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="table-responsive">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Mã CC</th>
              <th>Mã NV</th>
              <th style={{ minWidth: "160px" }}>Họ Tên</th>
              <th>Phòng ban</th>
              <th>Ngày làm</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Giờ làm</th>
              <th>Trạng thái</th>
              <th style={{ minWidth: "100px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((a, index) => (
                <tr key={`${a.macc}-${index}`}>
                  <td><strong>{a.macc}</strong></td>
                  <td>{a.manv}</td>
                  <td>{a.hotennv}</td>
                  <td>{a.tenpban || "Chưa xếp phòng"}</td>
                  <td>{formatDate(a.ngaylam)}</td>
                  <td style={{ color: "#2563eb", fontWeight: "bold" }}>{formatTime(a.checkin)}</td>
                  <td style={{ color: a.checkout ? "#16a34a" : "#ef4444", fontWeight: "bold" }}>
                    {formatTime(a.checkout)}
                  </td>
                  <td>{a.sogiolam ? `${a.sogiolam}h` : "--"}</td>
                  <td>
                    <span style={{
                      padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold",
                      background: a.trangthai === "Đủ công" || a.trangthai === "Tăng ca" ? "#dcfce7" : "#fee2e2",
                      color: a.trangthai === "Đủ công" || a.trangthai === "Tăng ca" ? "#166534" : "#991b1b"
                    }}>
                      {a.trangthai}
                    </span>
                  </td>
                  <td className="action-btns">
                    <button className="btn-edit" onClick={() => openEditModal(a)} style={{ background: "#4e73df", color: "white" }}>
                      Sửa giờ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>Chưa có dữ liệu chấm công</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', paddingBottom: '20px' }}>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Trước</button>
          <span style={{ fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Sau</button>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2>Điều chỉnh Check-out</h2>
              <button className="btn-close-modal" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            
            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>Giờ Check-out</label>
              <input type="datetime-local" value={editForm.checkoutLocal} onChange={e => setEditForm({ ...editForm, checkoutLocal: e.target.value })} />
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