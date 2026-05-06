import { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/account.css";

export default function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({
        tentk: "",
        password: "",
        phanquyen: "nhanvien",
        manv: "",
        trangthai: "active"
    });

    const [editing, setEditing] = useState(false);

    // State quản lý Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAccounts();
    }, []);

    // 🔥 GET
    const fetchAccounts = async () => {
        try {
            const res = await API.get("/taikhoan");
            console.log("DATA:", res.data); // 🔥 THÊM DÒNG NÀY
            setAccounts(res.data);
        } catch (err) {
            console.error("ERROR:", err);
        }
    };

    // 🔥 ADD
    const handleAdd = async () => {
        try {
            await API.post("/taikhoan", form);
            handleClear(); // Xóa trắng form sau khi thêm thành công
            fetchAccounts();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Thêm thất bại");
        }
    };
    // 🔥 DELETE
    const handleDelete = async (tentk) => {
        const isConfirm = window.confirm("Bạn có chắc muốn xoá tài khoản này?");

        if (!isConfirm) return;

        try {
            await API.delete(`/taikhoan/${tentk}`);
            fetchAccounts();
        } catch (err) {
            console.error(err);
            alert("Xoá thất bại");
        }
    };

    // 🔥 EDIT
    const handleEdit = (acc) => {
        setForm({
            tentk: acc.tentk,
            password: "",
            phanquyen: acc.phanquyen,
            manv: acc.manv,
            trangthai: acc.trangthai || "active"
        });
        setEditing(true);
    };

    // 🔥 UPDATE
    const handleUpdate = async () => {
        try {
            await API.put(`/taikhoan/${form.tentk}`, {
                phanquyen: form.phanquyen,
                trangthai: form.trangthai,
                manv: form.manv || null
            });

            handleClear(); // Reset form và thoát chế độ sửa
            fetchAccounts();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Update thất bại");
        }
    };
    const handleClear = () => {
        setForm({
            tentk: "",
            password: "",
            phanquyen: "nhanvien",
            manv: "",
            trangthai: "active"
        });
        setEditing(false);
    };

    // Logic cắt mảng dữ liệu cho trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = accounts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(accounts.length / itemsPerPage);

    return (
        <div className="account-container">
            <h1>Quản lý tài khoản</h1>

            <div className="account-form">
                {/* FORM */}
                <input
                    placeholder="Tài khoản"
                    value={form.tentk}
                    onChange={(e) => setForm({ ...form, tentk: e.target.value })}
                />

                {!editing && (
                    <input
                        placeholder="Mật khẩu"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                )}

                <select
                    value={form.phanquyen}
                    onChange={(e) => setForm({ ...form, phanquyen: e.target.value })}
                >
                    <option value="admin">Admin</option>
                    <option value="nhanvien">Nhân viên</option>
                </select>

                <select
                    value={form.trangthai}
                    onChange={(e) => setForm({ ...form, trangthai: e.target.value })}
                >
                    <option value="active">Active (Hoạt động)</option>
                    <option value="inactive">Inactive (Khoá)</option>
                </select>

                <input
                    placeholder="Mã NV"
                    value={form.manv}
                    onChange={(e) => setForm({ ...form, manv: e.target.value })}
                />

                {editing ? (
                    <button onClick={handleUpdate}>Cập nhật</button>
                ) : (
                    <>
                        <button onClick={handleAdd}>Thêm</button>
                        <button onClick={handleClear} className="btn-clear">Clear</button>
                    </>
                )}
            </div>

            {/* TABLE */}
            <table className="account-table">
                <thead>
                    <tr>
                        <th>Tài khoản</th>
                        <th>Quyền</th>
                        <th>Trạng thái</th>
                        <th>Mã NV</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {currentItems.map((acc) => (
                        <tr key={acc.tentk}>
                            <td>{acc.tentk}</td>
                            <td>{acc.phanquyen}</td>
                            <td>
                                <span style={{ color: acc.trangthai === 'active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                    {acc.trangthai === 'active' ? 'Active' : 'Khoá'}
                                </span>
                            </td>
                            <td>{acc.manv}</td>
                            <td>
                                <button onClick={() => handleEdit(acc)}>Sửa</button>
                                <button onClick={() => handleDelete(acc.tentk)}>Xoá</button>
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
        </div>
    );
}