import { useEffect, useState } from "react";
import API from "../../services/api";
import EmployeeModal from "./EmployeeModal";
import "../../styles/employee.css";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Nhân viên đang được chọn để Sửa
  const [isViewMode, setIsViewMode] = useState(false);


  // State quản lý Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    search: "", macv: "", mapb: "", trangthai: ""
  });

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]); 

  useEffect(() => {
    fetchEmployees();
    fetchDepartments(); // Lấy danh sách phòng ban 1 lần khi load trang
    fetchRoles(); // Lấy danh sách chức vụ
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/phongban");
      setDepartments(res.data);
    } catch (err) {
      console.error("Lỗi fetch phòng ban:", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await API.get("/chucvu");
      setRoles(res.data);
    } catch (err) {
      console.error("Lỗi fetch chức vụ:", err);
    }
  };
  // 🔥 KẾT THÚC KHAI BÁO AUTOCOMPLETE

  const fetchEmployees = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await API.get(`/nhanvien?${queryParams}`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Lỗi fetch data:", err);
    }
  };

  const handleDelete = async (manv) => {
    // Thay đổi câu thông báo để người dùng hiểu đây là cho nghỉ chứ không phải xóa vĩnh viễn
    if (!window.confirm("Xác nhận cho nhân viên này nghỉ việc? Tài khoản liên kết sẽ bị tự động khoá.")) return;
    
    try {
      const res = await API.delete(`/nhanvien/${manv}`);
      alert(res.data.message || "Đã cập nhật trạng thái nghỉ việc thành công!");
      fetchEmployees(); // Load lại danh sách để cập nhật màu sắc/trạng thái mới
    } catch (err) {
      console.error("Lỗi khi cho nghỉ việc:", err);
      alert(err.response?.data?.error || "Thao tác thất bại");
    }
  };

  const handleViewEmployee = (emp) => {
    setIsViewMode(true);
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedEmployee(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (emp) => {
    setSelectedEmployee(emp);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1); // Quay về trang 1 khi lọc
  };

  // Logic cắt mảng dữ liệu cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  return (
    <div className="employee-container">
      <div className="header-actions">
        <h1>Quản lý nhân viên</h1>
        <button className="btn-add-new" onClick={openAddModal}>+ Thêm nhân viên</button>
      </div>

      <div className="filter-section" style={{ marginBottom: "20px" }}>
        <input name="search" placeholder="Tìm tên hoặc mã NV..." value={filters.search} onChange={handleFilterChange} />
        <select name="trangthai" value={filters.trangthai} onChange={handleFilterChange}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select name="macv" value={filters.macv} onChange={handleFilterChange}>
          <option value="">Tất cả chức vụ</option>
          {roles.map((role) => (
            <option key={role.macv} value={role.macv}>{role.tencv}</option>
          ))}
        </select>
        <input name="mapb" placeholder="Lọc mã PB..." value={filters.mapb} onChange={handleFilterChange} />
      </div>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        employee={selectedEmployee} 
        roles={roles} 
        departments={departments} 
        refreshData={fetchEmployees} 
        isView={isViewMode}
      />

      <div className="table-responsive">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ Tên</th>
              <th>Giới tính</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Chức vụ</th>
              <th>Phòng Ban</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((emp) => (
                <tr key={emp.manv}>
                  <td>{emp.manv}</td>
                  <td>{emp.hotennv}</td>
                  <td>{emp.gioitinh}</td>
                  <td>{emp.sdt}</td>
                  <td>{emp.email}</td>
                  <td>{roles.find(r => r.macv === emp.macv)?.tencv || emp.macv}</td>
                  <td>{emp.mapb}</td>
                  
                  <td>
                    <span style={{
                      // Dùng màu cam cho Đình chỉ, đỏ cho Nghỉ việc và xanh cho Đang làm việc
                      color: emp.trangthai === 'Nghỉ việc' ? '#ff5768' : 
                            emp.trangthai === 'inactive' ? '#e67e22' : '#27ae60',
                      fontWeight: 'bold'
                    }}>
                      {emp.trangthai === 'active' ? 'Active' : emp.trangthai === 'inactive' ? 'Inactive' : emp.trangthai}
                    </span>
                  </td>
                  <td className="action-btns">
                    <button className="btn-view" onClick={() => handleViewEmployee(emp)} style={{ background: "#3b82f6", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px", fontWeight: "bold" }}>Xem</button>
                    <button className="btn-edit" onClick={() => handleEdit(emp)}>Sửa</button>
                    {/* Chỉ hiện nút "Cho nghỉ" nếu nhân viên đó chưa nghỉ việc */}
                    {emp.trangthai !== 'Nghỉ việc' && (
                      <button className="btn-delete" onClick={() => handleDelete(emp.manv)}>Cho nghỉ</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>Không có dữ liệu</td>
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
    </div>
  );
}