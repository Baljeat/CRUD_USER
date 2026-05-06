import { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/emp.css";


export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [degrees, setDegrees] = useState([]);
  const [contract, setContract] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  const manv = localStorage.getItem("manv");
  console.log("manv in Profile.jsx", manv);


  const fetchMyProfile = async () => {
    try {
      // 1. Lấy thông tin cá nhân
      const res = await API.get(`/nhanvien/${manv}`);
      setProfile(res.data);

      // 2. Lấy hồ sơ bằng cấp
      const resDegrees = await API.get(`/bangcap/${manv}`);
      setDegrees(resDegrees.data);

      // 3. Lấy hợp đồng đang có hiệu lực (Lọc từ danh sách hợp đồng chung)
      const resContracts = await API.get("/hopdong");
      const myActiveContract = resContracts.data.find(h => h.manv === manv && h.trangthai === 'active');
      setContract(myActiveContract || null);
    } catch (err) {
      console.error("Lỗi lấy thông tin:", err);
    }
  };

  useEffect(() => {
    // Nếu có mã nhân viên trong LocalStorage thì mới gọi API
    if (manv) {
      fetchMyProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manv]);

  if (!profile)
    return (
      <div style={{ padding: "20px" }}>
        Đang tải dữ liệu... (Nếu màn hình này đứng im, vui lòng ấn Đăng Xuất và
        Đăng Nhập lại)
      </div>
    );

  // Lấy đúng tên cột từ Database (PostgreSQL trả về ma_nhan_vien, ma_phong_ban)
  const employeeId = profile.manv;

  return (
    <div className="portal-container">
      <h2>Hồ Sơ Cá Nhân</h2>
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {profile.hotennv ? profile.hotennv.charAt(0) : "U"}
          </div>
          <div>
            <h3>{profile.hotennv}</h3>
            <p className="badge" style={{ background: '#4e73df', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', display: 'inline-block', marginTop: '5px' }}>
              {profile.macv}
            </p>
          </div>
        </div>

        {/* THANH ĐIỀU HƯỚNG TAB */}
        <div className="modal-tabs" style={{ display: 'flex', gap: '25px', margin: '20px 30px 0', borderBottom: '2px solid #e2e8f0' }}>
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
            Hồ sơ Bằng cấp ({degrees.length})
          </button>
          <button 
            style={{ padding: '10px 5px', border: 'none', background: 'transparent', color: activeTab === 'contract' ? '#4e73df' : '#64748b', borderBottom: activeTab === 'contract' ? '3px solid #4e73df' : '3px solid transparent', borderRadius: '0', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.2s', marginBottom: '-2px' }}
            onClick={() => setActiveTab('contract')}
          >
            Hợp đồng Lao động
          </button>
        </div>

        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
        {activeTab === "info" && (
          <div className="profile-body">
            <div className="info-group">
              <label>Mã Nhân Viên:</label>
              <span>{employeeId}</span>
            </div>
            <div className="info-group">
              <label>Phòng Ban:</label>
              <span>{profile.mapb || "Chưa xếp phòng"}</span>
            </div>
            <div className="info-group">
              <label>Giới tính:</label>
              <span>{profile.gioitinh}</span>
            </div>
            <div className="info-group">
              <label>Ngày sinh:</label>
              <span>{profile.ngsinh ? new Date(profile.ngsinh).toLocaleDateString('vi-VN') : "---"}</span>
            </div>
            <div className="info-group">
              <label>Số điện thoại:</label>
              <span>{profile.sdt}</span>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <span>{profile.email}</span>
            </div>
            <div className="info-group">
              <label>Địa chỉ:</label>
              <span>{profile.diachi}</span>
            </div>
            <div className="info-group">
              <label>Ngày vào làm:</label>
              <span>{profile.ngaybatdaulam ? new Date(profile.ngaybatdaulam).toLocaleDateString('vi-VN') : "---"}</span>
            </div>
            <div className="info-group">
              <label>Trạng thái:</label>
              <span style={{ color: profile.trangthai === "active" ? "green" : "red", fontWeight: "bold" }}>
                {profile.trangthai === "active" ? "Đang làm việc" : profile.trangthai}
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: HỒ SƠ BẰNG CẤP */}
        {activeTab === "degrees" && (
          <div className="profile-body" style={{ display: 'block' }}>
            <div className="table-responsive">
              <table className="portal-table">
                <thead>
                  <tr><th>Tên bằng</th><th>Chuyên ngành</th><th>Trường đào tạo</th><th>Xếp loại</th><th>Năm TN</th></tr>
                </thead>
                <tbody>
                  {degrees.length > 0 ? degrees.map(d => (
                    <tr key={d.mabc}>
                      <td><strong>{d.tenbc}</strong></td><td>{d.chuyennganh}</td><td>{d.truongdaotao}</td><td>{d.xeploai}</td><td>{d.namtotnghiep || '--'}</td>
                    </tr>
                  )) : <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>Bạn chưa có dữ liệu bằng cấp.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: HỢP ĐỒNG LAO ĐỘNG */}
        {activeTab === "contract" && (
          <div className="profile-body" style={{ display: 'block' }}>
            {contract ? (
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                  Hợp đồng: <span style={{ color: '#4e73df' }}>{contract.mahd}</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div><p style={{ margin: '0 0 5px', color: '#64748b' }}>Loại hợp đồng</p><strong>{contract.tenloai || contract.maloaihd}</strong></div>
                  <div><p style={{ margin: '0 0 5px', color: '#64748b' }}>Trạng thái</p><strong style={{ color: '#10b981' }}>Đang hiệu lực (Active)</strong></div>
                  <div><p style={{ margin: '0 0 5px', color: '#64748b' }}>Ngày ký</p><strong>{new Date(contract.ngayky).toLocaleDateString('vi-VN')}</strong></div>
                  <div><p style={{ margin: '0 0 5px', color: '#64748b' }}>Mức lương cơ bản</p><strong style={{ color: '#e74c3c', fontSize: '16px' }}>{Number(contract.luongcoban).toLocaleString('vi-VN')} VNĐ</strong></div>
                  <div><p style={{ margin: '0 0 5px', color: '#64748b' }}>Ngày bắt đầu làm</p><strong>{new Date(contract.ngaybd).toLocaleDateString('vi-VN')}</strong></div>
                  <div><p style={{ margin: '0 0 5px', color: '#64748b' }}>Ngày kết thúc</p><strong>{contract.ngaykt ? new Date(contract.ngaykt).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</strong></div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <p style={{ margin: 0, color: '#64748b' }}>Bạn hiện chưa có hợp đồng lao động nào đang có hiệu lực.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
