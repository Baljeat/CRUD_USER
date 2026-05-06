import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
// Import các icon từ thư viện (dùng bộ Lucide cho hiện đại)
import { LuLayoutDashboard, LuBuilding2, LuUsers, LuUserCog, LuMenu, LuLogOut, LuBriefcase, LuFileText, LuFiles, LuWallet, LuCalendarCheck } from "react-icons/lu";

// pages
import Dashboard from "../pages/admin/Dashboard";
import AdminEmployeeManager from "../pages/admin/Employee";
import Accounts from "../pages/admin/Account";
import Departments from "../pages/admin/Department";
import Roles from "../pages/admin/Role";
import ContractTypes from "../pages/admin/ContractType";
import Contracts from "../pages/admin/Contract";
import Payroll from "../pages/admin/Payroll";
import AdminAttendance from "../pages/admin/AdminAttendance";
import "../styles/admin.css";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Hàm kiểm tra link đang active để đổi màu nền/chữ
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">{collapsed ? "A" : "Admin"}</h2>
        </div>

        <div className="sidebar-menu">
          <Link to="/admin" className={isActive("/admin")}>
            <LuLayoutDashboard className="icon" />
            <span className="text">Dashboard</span>
          </Link>
          <Link to="/admin/departments" className={isActive("/admin/departments")}>
            <LuBuilding2 className="icon" />
            <span className="text">Phòng ban</span>
          </Link>
          <Link to="/admin/employees" className={isActive("/admin/employees")}>
            <LuUsers className="icon" />
            <span className="text">Nhân viên</span>
          </Link>
          <Link to="/admin/chucvu" className={isActive("/admin/chucvu")}>
            <LuBriefcase className="icon" />
            <span className="text">Chức vụ</span>
          </Link>
          <Link to="/admin/loaihopdong" className={isActive("/admin/loaihopdong")}>
            <LuFiles className="icon" />
            <span className="text">Loại hợp đồng</span>
          </Link>
          <Link to="/admin/hopdong" className={isActive("/admin/hopdong")}>
            <LuFileText className="icon" />
            <span className="text">Hợp đồng LĐ</span>
          </Link>
          <Link to="/admin/luong" className={isActive("/admin/luong")}>
            <LuWallet className="icon" />
            <span className="text">Bảng lương</span>
          </Link>
          <Link to="/admin/attendance" className={isActive("/admin/attendance")}>
            <LuCalendarCheck className="icon" />
            <span className="text">Chấm công</span>
          </Link>
          <Link to="/admin/accounts" className={isActive("/admin/accounts")}>
            <LuUserCog className="icon" />
            <span className="text">Tài khoản</span>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {/* HEADER */}
        <div className="header">
          <button className="btn-toggle" onClick={() => setCollapsed(!collapsed)}>
            <LuMenu />
          </button>

          <button className="btn btn-logout" onClick={handleLogout}>
            <LuLogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="main-content-box">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="departments" element={<Departments />} />
              <Route path="employees" element={<AdminEmployeeManager />} />
              <Route path="chucvu" element={<Roles />} />
              <Route path="loaihopdong" element={<ContractTypes />} />
              <Route path="hopdong" element={<Contracts />} />
              <Route path="luong" element={<Payroll />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="accounts" element={<Accounts />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
