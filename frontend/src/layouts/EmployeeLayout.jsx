import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
// Import các icon từ bộ Lucide đồng bộ với Admin
import { 
  LuUser, 
  LuCalendarCheck, 
  LuWallet, 
  LuMenu, 
  LuLogOut 
} from "react-icons/lu";

// pages
import Profile from "../pages/employee/Profile";
import Attendance from "../pages/employee/Attendance";
import Salary from "../pages/employee/Salary";

import "../styles/admin.css";

export default function EmployeeLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Hàm kiểm tra link đang active để đổi màu icon/text
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="admin-container">
      
      {/* SIDEBAR */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">{collapsed ? "E" : "Employee"}</h2>
        </div>

        <div className="sidebar-menu">
          <Link to="/" className={isActive("/")}>
            <LuUser className="icon" />
            <span className="text">Hồ sơ</span>
          </Link>

          <Link to="/attendance" className={isActive("/attendance")}>
            <LuCalendarCheck className="icon" />
            <span className="text">Chấm công</span>
          </Link>

          <Link to="/salary" className={isActive("/salary")}>
            <LuWallet className="icon" />
            <span className="text">Lương bổng</span>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        
        {/* HEADER */}
        <div className="header">
          <div className="header-left">
            <button className="btn-toggle" onClick={() => setCollapsed(!collapsed)}>
              <LuMenu />
            </button>
            <span className="header-title">Trang nhân viên</span>
          </div>

          <div className="header-right">
            <button className="btn-logout" onClick={handleLogout}>
              <LuLogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="main">
          <div className="main-content-box">
            <Routes>
              <Route path="/" element={<Profile />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/salary" element={<Salary />} />
            </Routes>
          </div>
        </div>

      </div>
    </div>
  );
}