import { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/department.css"; // Dùng tạm style của department vì layout table giống nhau

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // State quản lý Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const initialForm = { macv: "", tencv: "", mota: "" };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await API.get("/chucvu");
      setRoles(res.data);
    } catch (err) {
      console.error("Lỗi tải chức vụ:", err);
    }
  };

  const handleAdd = async () => {
    try {
      await API.post("/chucvu", form);
      alert("Thêm chức vụ thành công!");
      closeModal();
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.error || "Thêm thất bại");
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/chucvu/${form.macv}`, { tencv: form.tencv, mota: form.mota });
      alert("Cập nhật thành công!");
      closeModal();
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.error || "Cập nhật thất bại");
    }
  };

  const handleDelete = async (macv) => {
    if (!window.confirm("Bạn có chắc muốn xoá chức vụ này?")) return;
    try {
      await API.delete(`/chucvu/${macv}`);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.error || "Xoá thất bại");
    }
  };

  const openModal = (role = null) => {
    if (role) {
      setForm(role);
      setEditing(true);
    } else {
      setForm(initialForm);
      setEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(initialForm);
  };

  // Logic cắt mảng dữ liệu cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = roles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(roles.length / itemsPerPage);

  return (
    <div className="department-container">
      <div className="header-actions">
        <h1>Danh mục Chức Vụ</h1>
        <button className="btn-add-new" onClick={() => openModal()}>+ Thêm chức vụ</button>
      </div>

      <div className="table-responsive">
        <table className="department-table">
          <thead>
            <tr><th>Mã CV</th><th>Tên Chức vụ</th><th>Mô tả</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            {currentItems.map((r) => (
              <tr key={r.macv}>
                <td><strong>{r.macv}</strong></td><td>{r.tencv}</td><td>{r.mota}</td>
                <td className="action-btns">
                  <button className="btn-edit" onClick={() => openModal(r)}>Sửa</button>
                  <button className="btn-delete" onClick={() => handleDelete(r.macv)}>Xoá</button>
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Sửa Chức vụ" : "Thêm Chức vụ mới"}</h2>
            <div className="form-group"><label>Mã CV</label><input value={form.macv} disabled={editing} onChange={(e) => setForm({ ...form, macv: e.target.value })} /></div>
            <div className="form-group"><label>Tên Chức vụ</label><input value={form.tencv} onChange={(e) => setForm({ ...form, tencv: e.target.value })} /></div>
            <div className="form-group"><label>Mô tả</label><textarea value={form.mota} onChange={(e) => setForm({ ...form, mota: e.target.value })} /></div>
            <div className="form-actions"><button className="btn-clear" onClick={closeModal}>Huỷ</button><button className="btn-save" onClick={editing ? handleUpdate : handleAdd}>Lưu</button></div>
          </div>
        </div>
      )}
    </div>
  );
}