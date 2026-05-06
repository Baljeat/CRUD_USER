import { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/department.css";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // State quản lý Modal Thêm/Sửa phòng ban
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const initialForm = { mapb: "", tenpban: "", mota: "", matp: "" };
  const [form, setForm] = useState(initialForm);

  // State quản lý Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State quản lý Modal Quản lý Nhân sự & Trưởng phòng
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentDeptAssign, setCurrentDeptAssign] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState("");

  // State quản lý Modal Xem chi tiết quân số & Lịch sử
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewDeptName, setViewDeptName] = useState("");
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [deptHistory, setDeptHistory] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/phongban");
      setDepartments(res.data);
    } catch (err) { console.error("Lỗi fetch phòng ban:", err); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/nhanvien");
      setEmployees(res.data);
    } catch (err) { console.error("Lỗi fetch nhân viên:", err); }
  };

  // --- BỔ SUNG HÀM FETCH HISTORY RIÊNG ---
  const fetchHistory = async (mapb) => {
    try {
      const res = await API.get(`/phongban/${mapb}/history`);
      setDeptHistory(res.data);
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
      setDeptHistory([]);
    }
  };

  /* ---------------- XỬ LÝ PHÒNG BAN ---------------- */

  const handleAddDept = async () => {
    try {
      await API.post("/phongban", form);
      alert("Thêm phòng ban thành công!");
      closeDeptModal();
      fetchDepartments();
    } catch (err) { alert(err.response?.data?.error || "Thêm thất bại"); }
  };

  const handleUpdateDept = async () => {
    try {
      const { mapb, ...updateData } = form;
      await API.put(`/phongban/${form.mapb}`, updateData);
      alert("Cập nhật phòng ban thành công!");
      closeDeptModal();
      fetchDepartments();
    } catch (err) { alert(err.response?.data?.error || "Cập nhật thất bại"); }
  };

  const handleDeleteDept = async (mapb) => {
    if (!window.confirm("Bạn có chắc muốn xoá phòng ban này?")) return;
    try {
      await API.delete(`/phongban/${mapb}`);
      fetchDepartments();
    } catch (err) { alert(err.response?.data?.error || "Xóa thất bại"); }
  };

  const openAddDeptModal = () => {
    setForm(initialForm);
    setEditing(false);
    setIsDeptModalOpen(true);
  };

  const handleEditDept = (dept) => {
    setForm({ mapb: dept.mapb, tenpban: dept.tenpban, mota: dept.mota || "", matp: dept.matp || "" });
    setEditing(true);
    setIsDeptModalOpen(true);
  };

  const closeDeptModal = () => {
    setIsDeptModalOpen(false);
    setForm(initialForm);
  };

  const handleFormChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  /* ---------------- XỬ LÝ QUẢN LÝ NHÂN SỰ & TRƯỞNG PHÒNG ---------------- */

  const openAssignModal = (dept) => {
    setCurrentDeptAssign(dept);
    setSelectedLeader(dept.matp || "");
    
    const currentAssigned = employees
      .filter(emp => emp.mapb === dept.mapb)
      .map(emp => emp.manv);
      
    setSelectedEmployees(currentAssigned);
    setIsAssignModalOpen(true);
  };

  const handleCheckboxChange = (manv) => {
    setSelectedEmployees(prev => 
      prev.includes(manv) ? prev.filter(id => id !== manv) : [...prev, manv]
    );
  };

  const handleAssignSubmit = async () => {
    try {
      const res = await API.post(`/phongban/${currentDeptAssign.mapb}/assign`, {
        manvList: selectedEmployees,
        matp: selectedLeader 
      });

      console.log("Kết quả từ Server:", res.data);
      alert(res.data.message);
      
      setIsAssignModalOpen(false);
      
      // Load lại dữ liệu mới nhất sau khi gán
      await fetchDepartments(); 
      await fetchEmployees(); 
      await fetchHistory(currentDeptAssign.mapb); // Cập nhật lại lịch sử chức vụ mới
    } catch (err) {
      console.error("Lỗi khi gán:", err);
      alert(err.response?.data?.error || "Không thể kết nối đến máy chủ");
    }
  };

  /* ---------------- XỬ LÝ XEM CHI TIẾT & LỊCH SỬ ---------------- */

  const handleViewEmployees = async (dept) => {
    setViewDeptName(dept.tenpban);
    const list = employees.filter(emp => emp.mapb === dept.mapb);
    setDeptEmployees(list);

    // GỌI HÀM LẤY LỊCH SỬ KHI BẤM NÚT XEM
    await fetchHistory(dept.mapb);
    
    setIsViewModalOpen(true);
  };

  // Logic cắt mảng dữ liệu cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = departments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(departments.length / itemsPerPage);

  return (
    <div className="department-container">
      <div className="header-actions">
        <h1>Quản lý phòng ban</h1>
        <button className="btn-add-new" onClick={openAddDeptModal}>+ Thêm phòng ban</button>
      </div>

      <div className="table-responsive">
        <table className="department-table">
          <thead>
            <tr>
              <th>Mã PB</th>
              <th>Tên phòng ban</th>
              <th>Mô tả</th>
              <th>Mã Trưởng Phòng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((dept) => (
              <tr key={dept.mapb}>
                <td>{dept.mapb}</td>
                <td>{dept.tenpban}</td>
                <td>{dept.mota}</td>
                <td>{dept.matp || "Chưa có"}</td>
                <td className="action-btns">
                  <button className="btn-view" onClick={() => handleViewEmployees(dept)}>Xem</button>
                  <button className="btn-assign" onClick={() => openAssignModal(dept)}>Nhân sự</button>
                  <button className="btn-edit" onClick={() => handleEditDept(dept)}>Sửa</button>
                  <button className="btn-delete" onClick={() => handleDeleteDept(dept.mapb)}>Xoá</button>
                </td>
              </tr>
            ))}
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

      {/* Modal Thêm/Sửa Phòng Ban (Giữ nguyên cũ) */}
      {isDeptModalOpen && (
        <div className="modal-overlay" onClick={closeDeptModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "Sửa phòng ban" : "Thêm phòng ban mới"}</h2>
              <button className="btn-close-modal" onClick={closeDeptModal}>&times;</button>
            </div>
            <div className="form-group"><label>Mã PB</label><input name="mapb" value={form.mapb} onChange={handleFormChange} disabled={editing} /></div>
            <div className="form-group"><label>Tên phòng ban</label><input name="tenpban" value={form.tenpban} onChange={handleFormChange} /></div>
            <div className="form-group"><label>Mô tả</label><textarea name="mota" value={form.mota} onChange={handleFormChange} /></div>
            <div className="form-actions">
              <button className="btn-clear" onClick={closeDeptModal}>Hủy</button>
              <button className="btn-save" onClick={editing ? handleUpdateDept : handleAddDept}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý Nhân sự & Bổ nhiệm (Giữ nguyên cũ) */}
      {isAssignModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quản lý Nhân sự & Trưởng phòng - {currentDeptAssign?.tenpban}</h2>
              <button className="btn-close-modal" onClick={() => setIsAssignModalOpen(false)}>&times;</button>
            </div>
            <p style={{fontSize: "14px", marginBottom: "10px"}}><strong>Bước 1:</strong> Chọn quân số thuộc phòng ban này:</p>
            <div className="employee-list" style={{maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", padding: "10px", borderRadius: "6px"}}>
              {employees
                .filter(emp => !emp.mapb || emp.mapb === currentDeptAssign.mapb) 
                .map(emp => (
                <label key={emp.manv} className="employee-item" style={{display: "flex", gap: "10px", padding: "5px 0"}}>
                  <input type="checkbox" checked={selectedEmployees.includes(emp.manv)} onChange={() => handleCheckboxChange(emp.manv)} />
                  <span>{emp.hotennv} ({emp.manv})</span>
                </label>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: "20px", borderTop: "2px solid #eee", paddingTop: "15px" }}>
              <p style={{fontSize: "14px", marginBottom: "10px"}}><strong>Bước 2:</strong> Bổ nhiệm Trưởng phòng (chỉ chọn người đã tick ở trên):</p>
              <select value={selectedLeader} onChange={(e) => setSelectedLeader(e.target.value)} style={{ width: "100%", padding: "10px", marginTop: "5px" }}>
                <option value="">-- Trống (Chưa có sếp) --</option>
                {employees
                  .filter(emp => selectedEmployees.includes(emp.manv)) 
                  .map(emp => {
                    const isLeaderElsewhere = departments.some(d => d.matp === emp.manv && d.mapb !== currentDeptAssign.mapb);
                    return (
                      <option key={emp.manv} value={emp.manv} disabled={isLeaderElsewhere}>
                        {emp.hotennv} ({emp.manv}) {isLeaderElsewhere ? " - [Đã làm TP phòng khác]" : ""}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div className="form-actions" style={{marginTop: "20px"}}>
              <button className="btn-clear" onClick={() => setIsAssignModalOpen(false)}>Hủy</button>
              <button className="btn-save" onClick={handleAssignSubmit}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết quân số & Lịch sử (Giữ nguyên cũ + Hiển thị History) */}
      {isViewModalOpen && (
        <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "850px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin phòng: {viewDeptName}</h2>
              <button className="btn-close-modal" onClick={() => setIsViewModalOpen(false)}>&times;</button>
            </div>

            <h3 style={{fontSize: "16px", marginBottom: "10px", color: "#455a79"}}>● Danh sách nhân viên hiện tại</h3>
            <div className="table-responsive" style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "25px" }}>
              <table className="department-table">
                <thead>
                    <tr>
                        <th>Mã NV</th>
                        <th>Họ Tên</th>
                        <th>Mã CV</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                  {deptEmployees.length > 0 ? deptEmployees.map(emp => (
                    <tr key={emp.manv}>
                      <td>{emp.manv}</td>
                      <td><strong>{emp.hotennv}</strong></td>
                        <td>{emp.macv}</td>
                      <td>
                        <span style={{color: emp.trangthai === 'Đang làm việc' ? 'green' : '#e67e22', fontWeight: 'bold'}}>
                            {emp.trangthai}
                        </span>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="4" style={{ textAlign: "center" }}>Phòng này đang trống nhân sự.</td></tr>}
                </tbody>
              </table>
            </div>

            <h3 style={{fontSize: "16px", marginBottom: "10px", color: "#455a79"}}>● Lịch sử bổ nhiệm Trưởng phòng</h3>
            <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
              <table className="department-table" style={{backgroundColor: "#f9f9f9"}}>
                <thead>
                    <tr>
                        <th>Họ Tên</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                  {deptHistory.length > 0 ? deptHistory.map(history => (
                    <tr key={history.mact || history.ngaybd}>
                      <td><strong>{history.hotennv}</strong> ({history.manv})</td>
                      <td>
                        {new Date(history.ngaybd).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                      </td>
                      <td>
                        {history.ngaykt 
                          ? new Date(history.ngaykt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) 
                          : "---"}
                      </td>
                      <td>
                        {history.ngaykt ? 
                          <span style={{color: "gray"}}>Mãn nhiệm</span> : 
                          <span style={{color: "green", fontWeight: "bold"}}>Đang tại vị</span>
                        }
                      </td>
                    </tr>
                  )) : <tr><td colSpan="4" style={{ textAlign: "center" }}>Chưa có dữ liệu lịch sử bổ nhiệm.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="form-actions" style={{ marginTop: "20px" }}>
              <button className="btn-clear" onClick={() => setIsViewModalOpen(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}