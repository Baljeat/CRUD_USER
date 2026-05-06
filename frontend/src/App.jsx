import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

const ProtectedRoute = ({ element, allowedRole }) => {
  const currentRole = localStorage.getItem("role");
  
  if (currentRole === allowedRole) {
    return element;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin/*"
          element={<ProtectedRoute element={<AdminLayout />} allowedRole="admin" />}
        />

        <Route
          path="/*"
          element={<ProtectedRoute element={<EmployeeLayout />} allowedRole="nhanvien" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;