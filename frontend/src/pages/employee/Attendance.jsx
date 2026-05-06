import { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/emp.css";

export default function Attendance() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      const res = await API.get("/chamcong/me");
      setAttendances(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await API.post("/chamcong/checkin");
      alert("Check-in thành công!");
      fetchMyAttendance();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi check-in");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await API.post("/chamcong/checkout");
      alert("Check-out thành công!");
      fetchMyAttendance();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi check-out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      <h2>Lịch Sử Chấm Công</h2>

      <div className="action-buttons">
        <button
          className="btn-checkin"
          onClick={handleCheckIn}
          disabled={loading}
        >
          👋 Check-in (Vào ca)
        </button>
        <button
          className="btn-checkout"
          onClick={handleCheckOut}
          disabled={loading}
        >
          🏃 Check-out (Tan ca)
        </button>
      </div>

      <div className="table-responsive">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Ngày làm</th>
              <th>Giờ vào</th>
              <th>Giờ ra</th>
              <th>Tổng giờ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {attendances.length > 0 ? (
              attendances.map((item) => (
                <tr key={item.ma_cham_cong}>
                  <td>{item.ngaylam.split("T")[0]}</td>
                  <td>
                    {item.checkin
                      ? new Date(item.checkin).toLocaleTimeString()
                      : "--"}
                  </td>
                  <td>
                    {item.checkout
                      ? new Date(item.checkout).toLocaleTimeString()
                      : "--"}
                  </td>
                  <td>{item.sogiolam ? `${item.sogiolam}h` : "0h"}</td>
                  <td>
                    <span
                      className={`status-badge ${item.trangthai === "đi trễ" ? "late" : "ontime"}`}
                    >
                      {item.trangthai}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Chưa có dữ liệu chấm công
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
