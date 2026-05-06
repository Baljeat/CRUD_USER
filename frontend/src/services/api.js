import axios from "axios";

const API = axios.create({
  //baseURL: "https://quanlynhansu-be.onrender.com/", // đổi nếu BE khác port
  baseURL: "http://localhost:3000", // dùng khi chạy BE ở local
});

// gắn token (sau này dùng)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API; 
