import { useEffect, useState } from "react";
import API from "../../services/api";

export default function ContractTypes() {
  const [types, setTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ maloaihd: "", tenloai: "" });

  // State quản lý Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchTypes(); }, []);

  const fetchTypes = async () => {
    const res = await API.get("/loaihopdong");
    setTypes(res.data);
  };

  const handleSave = async () => {
    try {
      if (editing) await API.put(`/loaihopdong/${form.maloaihd}`, form);
      else await API.post("/loaihopdong", form);
      alert("Lưu thành công!");
      setIsModalOpen(false);
      fetchTypes();
    } catch (err) { alert(err.response?.data?.error || "Thất bại"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá?")) return;
    try {
      await API.delete(`/loaihopdong/${id}`);
      fetchTypes();
    } catch (err) { alert(err.response?.data?.error || "Xoá thất bại"); }
  };

  const openModal = (type = null) => {
    setForm(type || { maloaihd: "", tenloai: "" });
    setEditing(!!type);
    setIsModalOpen(true);
  };

  // Logic cắt mảng dữ liệu cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = types.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(types.length / itemsPerPage);

  return (
    <div className="department-container">
      <div className="header-actions">
        <h1>Loại Hợp Đồng</h1>
        <button className="btn-add-new" onClick={() => openModal()}>+ Thêm Loại HĐ</button>
      </div>
      <table className="department-table">
        <thead><tr><th>Mã Loại HĐ</th><th>Tên Loại</th><th>Hành động</th></tr></thead>
        <tbody>
          {currentItems.map(t => (
            <tr key={t.maloaihd}>
              <td><strong>{t.maloaihd}</strong></td>
              <td>{t.tenloai}</td>
              <td className="action-btns">
                <button className="btn-edit" onClick={() => openModal(t)}>Sửa</button>
                <button className="btn-delete" onClick={() => handleDelete(t.maloaihd)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editing ? "Sửa" : "Thêm"} Loại Hợp Đồng</h2>
            <div className="form-group"><label>Mã Loại</label><input value={form.maloaihd} disabled={editing} onChange={e => setForm({...form, maloaihd: e.target.value})} /></div>
            <div className="form-group"><label>Tên Loại</label><input value={form.tenloai} onChange={e => setForm({...form, tenloai: e.target.value})} /></div>
            <div className="form-actions">
              <button className="btn-clear" onClick={() => setIsModalOpen(false)}>Huỷ</button>
              <button className="btn-save" onClick={handleSave}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}