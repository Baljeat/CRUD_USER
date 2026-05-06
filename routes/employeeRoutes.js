const express = require("express");
const router = express.Router();
const { validateEmployee } = require("../middleware/employeeValidator");
const employeeController = require("../controllers/employeeController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.get("/nhanvien", verifyToken, employeeController.getEmployees);
router.get("/nhanvien/:manv", verifyToken, employeeController.getEmployeeById);
router.delete("/nhanvien/:manv", verifyToken, isAdmin, employeeController.deleteEmployee);



// Áp dụng cho thêm và sửa
router.post("/nhanvien", verifyToken, isAdmin, validateEmployee, employeeController.createEmployee);
router.put("/nhanvien/:manv", verifyToken, isAdmin, validateEmployee, employeeController.updateEmployee);
module.exports = router;