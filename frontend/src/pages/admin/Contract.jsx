import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [types, setTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formattedLuongCoban, setFormattedLuongCoban] = useState(""); // State mới cho lương cơ bản đã format

  // State quản lý Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const initForm = { mahd: "", ngayky: "", ngaybd: "", ngaykt: "", luongcoban: 0, trangthai: "active", manv: "", maloaihd: "" };
  const [form, setForm] = useState(initForm);

  useEffect(() => {
    fetchData();
  }, []);

  // Effect để cập nhật formattedLuongCoban khi form.luongcoban thay đổi (ví dụ khi mở modal sửa)
  useEffect(() => {
    if (form.luongcoban !== undefined && form.luongcoban !== null && !isNaN(form.luongcoban)) {
      setFormattedLuongCoban(Number(form.luongcoban).toLocaleString('vi-VN'));
    } else {
      setFormattedLuongCoban("");
    }
  }, [form.luongcoban]);



  const fetchData = async () => {
    const [resHD, resNV, resLoai] = await Promise.all([
      API.get("/hopdong"), API.get("/nhanvien"), API.get("/loaihopdong")
    ]);
    setContracts(resHD.data);
    setEmployees(resNV.data);
    setTypes(resLoai.data);
  };

  const handleSave = async () => {
    try {
      if (editing) await API.put(`/hopdong/${form.mahd}`, form);
      else await API.post("/hopdong", form);
      alert("Lưu hợp đồng thành công!");
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || "Lưu thất bại"); }
  };

  const openModal = (hd = null) => {
    if (hd) {
      setForm({
        ...hd, 
        ngayky: hd.ngayky?.split("T")[0] || "",
        ngaybd: hd.ngaybd?.split("T")[0] || "",
        ngaykt: hd.ngaykt?.split("T")[0] || ""
      });
      // Cập nhật formattedLuongCoban khi mở modal sửa
      setFormattedLuongCoban(Number(hd.luongcoban).toLocaleString('vi-VN'));
    } else setForm(initForm);
    setEditing(!!hd);
    setIsModalOpen(true);
  };

  // Hàm xử lý thay đổi cho input lương cơ bản
  const handleLuongCobanChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Loại bỏ ký tự không phải số
    const numValue = Number(rawValue);

    // Cập nhật giá trị số vào form state
    setForm(prevForm => ({ ...prevForm, luongcoban: numValue }));

    // Cập nhật giá trị đã format để hiển thị
    if (rawValue) {
      setFormattedLuongCoban(numValue.toLocaleString('vi-VN'));
    } else {
      setFormattedLuongCoban("");
    }
  };

  // Logic cắt mảng dữ liệu cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = contracts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(contracts.length / itemsPerPage);

  return (
    <div className="department-container">
      <div className="header-actions">
        <h1>Quản lý Hợp Đồng</h1>
        <button className="btn-add-new" onClick={() => openModal()}>+ Ký hợp đồng mới</button>
      </div>

      <table className="department-table">
        <thead><tr><th>Mã HĐ</th><th>Nhân viên</th><th>Loại HĐ</th><th>Thời hạn (Ký - KT)</th><th>Lương Cơ Bản</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
        <tbody>
          {currentItems.map(hd => (
            <tr key={hd.mahd}>
              <td><strong>{hd.mahd}</strong></td>
              <td>{hd.hotennv} ({hd.manv})</td>
              <td>{hd.tenloai}</td>
              <td>{new Date(hd.ngayky).toLocaleDateString()} -{">"} {hd.ngaykt ? new Date(hd.ngaykt).toLocaleDateString() : "Vô thời hạn"}</td>
              <td style={{ color: "#27ae60", fontWeight: "bold" }}>{Number(hd.luongcoban).toLocaleString()} đ</td>
              <td>
                 <span style={{ color: hd.trangthai === 'active' ? 'green' : 'red', fontWeight: 'bold' }}>
                    {hd.trangthai === 'active' ? 'Active' : 'Inactive'}
                 </span>
              </td>
              <td className="action-btns"><button className="btn-edit" onClick={() => openModal(hd)}>Sửa / Gia hạn</button></td>
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
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: "700px"}}>
            <h2>{editing ? "Cập nhật Hợp Đồng" : "Ký Hợp Đồng Mới"}</h2>
            <div className="employee-form-grid" style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px"}}>
              <div className="form-group"><label>Mã HĐ</label><input value={form.mahd} disabled={editing} onChange={e => setForm({...form, mahd: e.target.value})} /></div>
              <div className="form-group">
                <label>Nhân viên</label>
                <select value={form.manv} disabled={editing} onChange={e => setForm({...form, manv: e.target.value})}>
                  <option value="">-- Chọn --</option>
                  {employees.map(nv => <option key={nv.manv} value={nv.manv}>{nv.hotennv} ({nv.manv})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Loại Hợp đồng</label>
                <select value={form.maloaihd} onChange={e => setForm({...form, maloaihd: e.target.value})}>
                  <option value="">-- Chọn --</option>
                  {types.map(t => <option key={t.maloaihd} value={t.maloaihd}>{t.tenloai}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Lương cơ bản (VNĐ)</label><input type="text" value={formattedLuongCoban} onChange={handleLuongCobanChange} /></div>
              <div className="form-group"><label>Ngày ký</label><input type="date" value={form.ngayky} onChange={e => setForm({...form, ngayky: e.target.value})} /></div>
              <div className="form-group"><label>Ngày bắt đầu</label><input type="date" value={form.ngaybd} onChange={e => setForm({...form, ngaybd: e.target.value})} /></div>
              <div className="form-group">
                <label>Ngày kết thúc</label>
                <input type="date" value={form.ngaykt} onChange={e => {
                  const newDate = e.target.value;
                  let newStatus = form.trangthai;
                  if (!newDate) {
                    newStatus = "active"; // Vô thời hạn -> Tự động Active
                  } else {
                    const kt = new Date(newDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    newStatus = (kt >= today) ? "active" : "inactive";
                  }
                  setForm({...form, ngaykt: newDate, trangthai: newStatus});
                }} />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select value={form.trangthai} onChange={e => setForm({...form, trangthai: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="active">Còn hạn</option>
                  <option value="inactive">Hết hạn</option>
                </select>
              </div>
            </div>
            <div className="form-actions" style={{marginTop: "20px"}}>
              <button className="btn-clear" onClick={() => setIsModalOpen(false)}>Huỷ</button>
              <button className="btn-save" onClick={handleSave}>Lưu Hợp Đồng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}