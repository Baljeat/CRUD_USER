import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api"; 
import { LuUsers, LuBuilding2, LuWallet, LuCalendarCheck, LuBell } from "react-icons/lu";
import "../../styles/dashboard.css";

export default function Dashboard() {

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Tạo một bộ đếm chạy mỗi giây
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Xóa bộ đếm khi đóng trang để tránh rò rỉ bộ nhớ
    return () => clearInterval(timer);
  }, []);

  // Hàm định dạng ngày giờ tiếng Việt
  const formatDateTime = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleDateString('vi-VN', options);
  };

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSalary: 0,
    attendanceToday: 0,
    expiringContracts: 0
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Thêm timestamp để tránh cache, đảm bảo số liệu luôn mới nhất
        const res = await API.get(`admin/dashboard-summary?t=${new Date().getTime()}`);
        
        setStats({
          totalEmployees: res.data.totalEmployees || 0,
          totalDepartments: res.data.totalDepartments || 0,
          totalSalary: res.data.totalSalary || 0,
          attendanceToday: res.data.attendanceToday || 0,
          expiringContracts: res.data.expiringContracts || 0
        });

        setRecentEmployees(res.data.recentEmployees || []);
      } catch (err) {
        console.error("Lỗi fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header"> <h2 className="page-title">Báo cáo quản trị nhân sự</h2>
    
    <div className="current-time-display"> {formatDateTime(currentTime)}
    </div>
    </div>

    {/* CẢNH BÁO HỢP ĐỒNG SẮP HẾT HẠN */}
    {stats.expiringContracts > 0 && (
      <div style={{ 
        background: "#fff3cd", borderLeft: "5px solid #ffc107", 
        padding: "15px 20px", marginBottom: "20px", borderRadius: "4px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#856404" }}>
          <LuBell size={24} color="#ffc107" />
          <span style={{ fontSize: "15px" }}>
            Có <strong>{stats.expiringContracts}</strong> hợp đồng lao động sắp hết hạn trong 30 ngày tới. Vui lòng kiểm tra và làm thủ tục gia hạn!
          </span>
        </div>
        <Link to="/admin/hopdong" style={{ background: "#ffc107", color: "#000", padding: "8px 15px", borderRadius: "5px", textDecoration: "none", fontWeight: "bold", fontSize: "13px" }}>
          Xử lý ngay
        </Link>
      </div>
    )}

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><LuUsers size={24} /></div>
          <div className="stat-info">
            <p>Tổng nhân viên</p>
            <h3>{stats.totalEmployees.toLocaleString()}</h3>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon"><LuBuilding2 size={24} /></div>
          <div className="stat-info">
            <p>Phòng ban</p>
            <h3>{stats.totalDepartments}</h3>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon"><LuCalendarCheck size={24} /></div>
          <div className="stat-info">
            <p>Đi làm hôm nay</p>
            <h3>{stats.attendanceToday}</h3>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon"><LuWallet size={24} /></div>
          <div className="stat-info">
            <p>Quỹ lương cơ bản</p>
            <h3>
              {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(stats.totalSalary)}
            </h3>
          </div>
        </div>
      </div>

      <div className="table-section">
        <div className="table-header">
          <h3>Nhân viên mới gia nhập</h3>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Chức vụ</th>
              <th>Ngày bắt đầu</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentEmployees.length > 0 ? (
              recentEmployees.map((nv) => (
                <tr key={nv.manv}>
                  <td>{nv.manv}</td>
                  <td><strong>{nv.hotennv}</strong></td>
                  <td>{nv.tencv || 'Chưa có chức vụ'}</td>
                  <td>{new Date(nv.ngaybatdaulam).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`status-badge ${nv.trangthai === 'active' ? 'active' : 'inactive'}`}>
                      {nv.trangthai === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-row">Chưa có dữ liệu nhân viên mới.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
