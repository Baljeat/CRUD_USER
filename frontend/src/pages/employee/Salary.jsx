import { useEffect, useState } from "react";
import API from "../../services/api";
// 1. Import thêm thư viện vẽ biểu đồ
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ReferenceLine 
} from "recharts";
// 2. Giữ nguyên đúng file CSS cũ của bạn
import "../../styles/emp.css";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: 0, color: '#2e4396' }}>
          Lương: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function Salary() {
  const [salaries, setSalaries] = useState([]);


  const fetchMySalary = async () => {
    try {
      const res = await API.get("/luong/me");
      setSalaries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchMySalary();
    })();
  }, []);

  const formatMoney = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };


  // Xử lý dữ liệu: lấy tháng/năm từ kyluong, lấy lương thực nhận từ luongcoban hoặc tổng lương
  const mappedSalaries = salaries.map(s => {
    const date = new Date(s.kyluong);
    const thang = date.getMonth() + 1;
    const nam = date.getFullYear();
    // Tính thực nhận: lương cơ bản + phụ cấp + thưởng - khấu trừ
    const thucnhan =
      (Number(s.luongcoban) || 0) +
      (Number(s.phucap) || 0) +
      (Number(s.thuong) || 0) -
      (Number(s.khautru) || 0);
    return { ...s, thang, nam, thucnhan };
  });

  // Sắp xếp lại dữ liệu theo thứ tự thời gian (từ tháng cũ đến tháng mới)
  const sortedSalaries = [...mappedSalaries].sort((a, b) => {
    if (a.nam === b.nam) return a.thang - b.thang;
    return a.nam - b.nam;
  });

  // Format lại dữ liệu để đưa vào biểu đồ
  const chartData = sortedSalaries.map(s => ({
    name: `T${s.thang}/${s.nam}`,
    "Thực nhận": s.thucnhan
  }));

  // Tính lương bình quân
  const totalSalary = chartData.reduce((sum, item) => sum + item["Thực nhận"], 0);
  const averageSalary = chartData.length > 0 ? Math.round(totalSalary / chartData.length) : 0;

  // Custom lại hiển thị tiền tệ khi trỏ chuột vào cột
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: 0, color: '#2e4396' }}>
            Lương: {formatMoney(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  // =============================================================

  return (
    <div className="portal-container">
      <h2>Bảng Lương & Thống Kê Thu Nhập</h2>

      {/* PHẦN BIỂU ĐỒ (Chỉ hiện khi có dữ liệu) */}
      {chartData.length > 0 && (
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "20px", marginTop: "15px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#2c3e50" }}>
            Biểu Đồ Thu Nhập So Với Bình Quân: <span style={{color: '#e74c3c'}}>{formatMoney(averageSalary)}/tháng</span>
          </h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#7f8c8d'}} />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} 
                  tick={{fill: '#7f8c8d'}}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Bar dataKey="Thực nhận" fill="#2e4396" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <ReferenceLine 
                  y={averageSalary} 
                  label={{ position: 'top', value: 'Bình quân', fill: '#e74c3c', fontSize: 12 }} 
                  stroke="#e74c3c" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* PHẦN BẢNG LƯƠNG (Giữ nguyên y hệt code gốc của bạn) */}
      <div className="table-responsive">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Kỳ lương</th>
              <th>Ngày công</th>
              <th>Tăng ca</th>
              <th>Phụ cấp</th>
              <th>Thưởng</th>
              <th>Khấu trừ</th>
              <th>Thực nhận</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {sortedSalaries.length > 0 ? (
              sortedSalaries.map((s) => (
                <tr key={s.ma_luong || `${s.nam}-${s.thang}`}> 
                  <td>
                    <strong>
                      {s.thang}/{s.nam}
                    </strong>
                  </td>
                  <td>{s.songaycong} ngày</td>
                  <td>{s.giotangca} giờ</td>
                  <td>{formatMoney(s.phucap)}</td>
                  <td>{formatMoney(s.thuong)}</td>
                  <td style={{ color: "red" }}>- {formatMoney(s.khautru)}</td>
                  <td
                    style={{
                      fontWeight: "bold",
                      color: "#27ae60",
                      fontSize: "15px",
                    }}
                  >
                    {formatMoney(s.thucnhan)}
                  </td>
                  <td>
                    {s.ngaytraluong ? s.ngaytraluong.split("T")[0] : "--"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${s.trangthai === "đã trả" ? "ontime" : "late"}`}
                    >
                      {s.trangthai}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  Chưa có dữ liệu lương
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}