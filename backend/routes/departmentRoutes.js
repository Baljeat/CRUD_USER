const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { validateDepartment, validateAssign } = require("../middleware/departmentValidator");

router.get("/phongban", verifyToken, departmentController.getAllDepartments);
router.get("/phongban/:mapb/history", verifyToken, departmentController.getHistory);router.post("/phongban", verifyToken, isAdmin, departmentController.createDepartment);

router.delete("/phongban/:mapb", verifyToken, isAdmin, departmentController.deleteDepartment);


// Áp dụng cho thêm, sửa và gán nhân sự
router.post("/phongban", verifyToken, isAdmin, validateDepartment, departmentController.createDepartment);
router.put("/phongban/:mapb", verifyToken, isAdmin, validateDepartment, departmentController.updateDepartment);
router.post("/phongban/:mapb/assign", verifyToken, isAdmin, validateAssign, departmentController.assignEmployees);
module.exports = router;