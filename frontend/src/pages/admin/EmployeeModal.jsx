import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";

export default function EmployeeModal({ isOpen, onClose, employee, roles, departments, refreshData }) {
  const initialForm = {
    manv: "", hotennv: "", gioitinh: "Nam", ngsinh: "", 
    sdt: "", email: "", diachi: "", ngaybatdaulam: "", 
    macv: "", trangthai: "active", mapb: ""
  };
  
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Autocomplete state
  const [pbSearchText, setPbSearchText] = useState("");
  const [showPbDropdown, setShowPbDropdown] = useState(false);
  const autocompleteRef = useRef(null);

  // --- STATE QUẢN LÝ BẰNG CẤP ---
  const [degrees, setDegrees] = useState([]);
  const [degreeForm, setDegreeForm] = useState({
    tenbc: "", chuyennganh: "", xeploai: "Khá", namtotnghiep: "", truongdaotao: ""
  });
  const [editingDegreeMabc, setEditingDegreeMabc] = useState(null); // Lưu ID bằng cấp đang sửa

  // Khởi tạo data khi mở modal (Thêm hoặc Sửa)
  useEffect(() => {
    if (employee) {
      setForm({
        ...employee,
        ngsinh: employee.ngsinh ? employee.ngsinh.split("T")[0] : "",
        ngaybatdaulam: employee.ngaybatdaulam ? employee.ngaybatdaulam.split("T")[0] : ""
      });
      setEditing(true);
      setActiveTab("info");
    } else {
      setForm(initialForm);
      setEditing(false);
      setActiveTab("info");
      setDegrees([]); // Xóa sạch list bằng cấp tạm khi mở form thêm mới
      setEditingDegreeMabc(null);
    }
  }, [employee, isOpen]);

  // Xử lý hiển thị text của Autocomplete Phòng ban
  useEffect(() => {
    if (form.mapb && departments.length > 0) {
      const dept = departments.find(d => d.mapb === form.mapb);
      setPbSearchText(dept ? `${dept.tenpban} (${dept.mapb})` : form.mapb);
    } else {
      setPbSearchText("");
    }
  }, [form.mapb, departments]);

  // Click ra ngoài dropdown tự đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowPbDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FETCH BẰNG CẤP KHI MỞ TAB DEGREES ---
  useEffect(() => {
    if (activeTab === "degrees" && employee?.manv) {
      fetchDegrees();
    }
  }, [activeTab, employee]);

  const fetchDegrees = async () => {
    try {
      const res = await API.get(`/bangcap/${employee.manv}`);
      setDegrees(res.data);
    } catch (err) {
      console.error("Lỗi fetch bằng cấp:", err);
    }
  };

  const handleAddDegree = async () => {
    if (!degreeForm.tenbc || !degreeForm.chuyennganh || !degreeForm.truongdaotao) {
      return alert("Vui lòng nhập đầy đủ Tên bằng, Chuyên ngành và Trường đào tạo!");
    }
    
    if (editing) {
      // Nếu đang SỬA nhân viên: Gọi API lưu thẳng vào DB
      try {
        if (editingDegreeMabc && !editingDegreeMabc.startsWith("TEMP_")) {
          // Cập nhật bằng cấp đã có trong DB
          await API.put(`/bangcap/${editingDegreeMabc}`, { ...degreeForm });
          alert("Cập nhật bằng cấp thành công!");
        } else {
          // Thêm bằng cấp mới vào DB
          await API.post("/bangcap", { ...degreeForm, manv: employee.manv });
          alert("Đã thêm bằng cấp mới!");
        }
        setDegreeForm({ tenbc: "", chuyennganh: "", xeploai: "Khá", namtotnghiep: "", truongdaotao: "" });
        setEditingDegreeMabc(null);
        fetchDegrees();
      } catch (err) {
        alert(err.response?.data?.error || "Thêm thất bại");
      }
    } else {
      // Nếu đang THÊM MỚI nhân viên: Chỉ lưu tạm vào mảng State
      if (editingDegreeMabc) {
        // Sửa bằng cấp trong mảng tạm
        setDegrees(degrees.map(d => d.mabc === editingDegreeMabc ? { ...degreeForm, mabc: editingDegreeMabc } : d));
        alert("Đã cập nhật bằng cấp tạm!");
      } else {
        // Thêm bằng cấp vào mảng tạm
        const newDegree = { ...degreeForm, mabc: "TEMP_" + Date.now() }; // Sinh id ảo để làm key
        setDegrees([...degrees, newDegree]);
        alert("Đã lưu tạm bằng cấp! Vui lòng bấm 'Thêm nhân viên' / 'Cập nhật' ở dưới để hoàn tất.");
      }
      setDegreeForm({ tenbc: "", chuyennganh: "", xeploai: "Khá", namtotnghiep: "", truongdaotao: "" });
      setEditingDegreeMabc(null);
    }
  };

  // Hàm đưa dữ liệu từ bảng dưới lên Form trên
  const handleEditDegreeClick = (deg) => {
    setDegreeForm({
      tenbc: deg.tenbc, chuyennganh: deg.chuyennganh, xeploai: deg.xeploai || "Khá",
      namtotnghiep: deg.namtotnghiep || "", truongdaotao: deg.truongdaotao
    });
    setEditingDegreeMabc(deg.mabc);
  };

  const handleDeleteDegree = async (mabc) => {
    if (!window.confirm("Bạn có chắc muốn xóa bằng cấp này?")) return;
    if (editing) {
      try { await API.delete(`/bangcap/${mabc}`); fetchDegrees(); } catch (err) { alert("Xóa thất bại"); }
    } else {
      // Lọc bỏ khỏi mảng state tạm
      setDegrees(degrees.filter(d => d.mabc !== mabc));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      // Gói chung cả form thông tin và mảng bằng cấp gửi 1 lần
      const payload = { ...form, degrees: degrees };
      await API.post("/nhanvien", payload);
      alert("Thêm nhân viên thành công!");
      refreshData();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Thêm thất bại");
    }
  };

  const handleUpdate = async () => {
    try {
      const { manv, ...updateData } = form; 
      await API.put(`/nhanvien/${form.manv}`, updateData);
      alert("Cập nhật thành công!");
      refreshData();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Cập nhật thất bại");
    }
  };

  if (!isOpen) return null; // Không render nếu modal đóng

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "1000px", width: "95%", padding: "30px", borderRadius: "16px" }}>
        <div className="modal-header">
          <h2>{editing ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}</h2>
          <button className="btn-close-modal" onClick={onClose}>&times;</button>
        </div>

        {/* THANH NAVIGATION TAB (Hiện cho cả chức năng Thêm và Sửa) */}
        <div className="modal-tabs" style={{ display: 'flex', gap: '25px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0' }}>
          <button 
            style={{ padding: '10px 5px', border: 'none', background: 'transparent', color: activeTab === 'info' ? '#4e73df' : '#64748b', borderBottom: activeTab === 'info' ? '3px solid #4e73df' : '3px solid transparent', borderRadius: '0', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.2s', marginBottom: '-2px' }}
            onClick={() => setActiveTab('info')}
          >
            Thông tin cá nhân
          </button>
          <button 
            style={{ padding: '10px 5px', border: 'none', background: 'transparent', color: activeTab === 'degrees' ? '#4e73df' : '#64748b', borderBottom: activeTab === 'degrees' ? '3px solid #4e73df' : '3px solid transparent', borderRadius: '0', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.2s', marginBottom: '-2px' }}
            onClick={() => setActiveTab('degrees')}
          >
            Hồ sơ Bằng cấp
          </button>
        </div>

        {/* TAB THÔNG TIN CHUNG */}
        {activeTab === 'info' && (
          <div className="employee-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group"><label>Mã NV (*)</label><input name="manv" value={form.manv} onChange={handleChange} disabled={editing} placeholder="VD: NV001" /></div>
              <div className="form-group"><label>Họ Tên (*)</label><input name="hotennv" value={form.hotennv} onChange={handleChange} placeholder="Nguyễn Văn A" /></div>
              <div className="form-group"><label>Giới tính</label><select name="gioitinh" value={form.gioitinh} onChange={handleChange}><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option></select></div>
              <div className="form-group"><label>Ngày sinh</label><input type="date" name="ngsinh" value={form.ngsinh} onChange={handleChange} /></div>
              <div className="form-group"><label>Số điện thoại</label><input name="sdt" value={form.sdt} onChange={handleChange} /></div>
              <div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} /></div>
              <div className="form-group"><label>Địa chỉ</label><input name="diachi" value={form.diachi} onChange={handleChange} /></div>
              <div className="form-group"><label>Ngày bắt đầu làm</label><input type="date" name="ngaybatdaulam" value={form.ngaybatdaulam} onChange={handleChange} /></div>
              <div className="form-group">
                <label>Chức Vụ (*)</label>
                <select name="macv" value={form.macv} onChange={handleChange}><option value="">-- Chọn chức vụ --</option>{roles.map(role => (<option key={role.macv} value={role.macv}>{role.tencv} ({role.macv})</option>))}</select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select name="trangthai" value={form.trangthai} onChange={handleChange}><option value="active">Active</option><option value="inactive">Inactive</option></select>
              </div>

              {/* AUTOCOMPLETE PHÒNG BAN */}
              <div className="form-group autocomplete-wrapper" ref={autocompleteRef}>
                <label>Phòng ban</label>
                <input placeholder="Gõ tên hoặc mã PB..." value={pbSearchText} onChange={(e) => { setPbSearchText(e.target.value); setShowPbDropdown(true); if (form.mapb) setForm({ ...form, mapb: "" }); }} onFocus={() => setShowPbDropdown(true)} />
                {showPbDropdown && (
                  <div className="autocomplete-dropdown">
                    {departments.filter(d => {
                        const searchLower = pbSearchText.toLowerCase();
                        const combinedString = `${d.tenpban} (${d.mapb})`.toLowerCase();
                        return ( d.mapb.toLowerCase().includes(searchLower) || d.tenpban.toLowerCase().includes(searchLower) || combinedString.includes(searchLower) );
                      }).map(d => (
                        <div key={d.mapb} className="autocomplete-item" onClick={() => { setForm({ ...form, mapb: d.mapb }); setPbSearchText(`${d.tenpban} (${d.mapb})`); setShowPbDropdown(false); }}>
                          <strong>{d.mapb}</strong> - {d.tenpban}
                        </div>
                      ))}
                    {departments.filter(d => {
                        const searchLower = pbSearchText.toLowerCase();
                        return ( d.mapb.toLowerCase().includes(searchLower) || d.tenpban.toLowerCase().includes(searchLower) || `${d.tenpban} (${d.mapb})`.toLowerCase().includes(searchLower) );
                      }).length === 0 && ( <div className="autocomplete-item" style={{ color: "red" }}>Không tìm thấy phòng ban nào!</div> )}
                  </div>
                )}
              </div>
            </div>
        )}

        {/* TAB BẰNG CẤP */}
        {activeTab === 'degrees' && (
          <div className="tab-degrees-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '17px' }}>Bằng cấp của: <span style={{ color: '#4e73df' }}>{form.hotennv || "Nhân viên mới"}</span></h3>
            </div>

            {/* FORM THÊM BẰNG CẤP MỚI */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div className="employee-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                <div className="form-group"><label>Tên bằng (*)</label><input value={degreeForm.tenbc} onChange={e => setDegreeForm({...degreeForm, tenbc: e.target.value})} placeholder="VD: Cử nhân" /></div>
                <div className="form-group"><label>Chuyên ngành (*)</label><input value={degreeForm.chuyennganh} onChange={e => setDegreeForm({...degreeForm, chuyennganh: e.target.value})} placeholder="VD: Công nghệ thông tin" /></div>
                <div className="form-group"><label>Xếp loại</label>
                  <select value={degreeForm.xeploai} onChange={e => setDegreeForm({...degreeForm, xeploai: e.target.value})}>
                    <option value="Xuất sắc">Xuất sắc</option><option value="Giỏi">Giỏi</option><option value="Khá">Khá</option><option value="Trung bình">Trung bình</option>
                  </select>
                </div>
                <div className="form-group"><label>Trường đào tạo (*)</label><input value={degreeForm.truongdaotao} onChange={e => setDegreeForm({...degreeForm, truongdaotao: e.target.value})} placeholder="VD: ĐH Bách Khoa" /></div>
                <div className="form-group"><label>Năm tốt nghiệp</label><input type="text" value={degreeForm.namtotnghiep} onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4); // Chỉ lấy số và tối đa 4 ký tự
                  setDegreeForm({...degreeForm, namtotnghiep: val});
                }} placeholder="VD: 2022" /></div>
                
                <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', gridColumn: '1 / -1', marginTop: '10px' }}>
                  {editingDegreeMabc && (
                    <button onClick={() => {
                        setEditingDegreeMabc(null);
                        setDegreeForm({ tenbc: "", chuyennganh: "", xeploai: "Khá", namtotnghiep: "", truongdaotao: "" });
                    }} style={{ padding: '10px 15px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Hủy Sửa</button>
                  )}
                  <button onClick={handleAddDegree} style={{ padding: '10px 25px', background: editingDegreeMabc ? '#f59e0b' : '#4e73df', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                    {editingDegreeMabc ? "Cập nhật bằng cấp" : "Lưu bằng cấp"}
                  </button>
                </div>
              </div>
            </div>

            {/* BẢNG DANH SÁCH BẰNG CẤP ĐÃ LƯU */}
            <div className="table-responsive">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Tên bằng</th><th>Chuyên ngành</th><th>Xếp loại</th><th>Trường đào tạo</th><th>Năm TN</th><th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {degrees.length > 0 ? degrees.map(d => (
                    <tr key={d.mabc} style={{ background: editingDegreeMabc === d.mabc ? '#fef3c7' : 'transparent' }}>
                      <td><strong>{d.tenbc}</strong></td>
                      <td>{d.chuyennganh || '-'}</td>
                      <td>{d.xeploai || '-'}</td>
                      <td>{d.truongdaotao || '-'}</td>
                      <td>{d.namtotnghiep || '-'}</td>
                      <td style={{display: 'flex', gap: '5px'}}>
                        <button onClick={() => handleEditDegreeClick(d)} style={{ background: '#4e73df', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sửa</button>
                        <button onClick={() => handleDeleteDegree(d.mabc)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Xoá</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Chưa có dữ liệu bằng cấp.</td></tr>}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* CỤM NÚT LƯU ĐẶT RA NGOÀI ĐỂ TAB NÀO CŨNG BẤM ĐƯỢC */}
        <div className="form-actions" style={{ marginTop: "25px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
          <button className="btn-clear" onClick={onClose}>{editing ? "Đóng" : "Hủy"}</button>
          {editing ? <button className="btn-update" onClick={handleUpdate}>Cập nhật thông tin NV</button> : <button className="btn-add" onClick={handleAdd}>Thêm nhân viên</button>}
        </div>

      </div>
    </div>
  );
}