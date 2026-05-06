const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Đường dẫn API
router.get("/admin/dashboard-summary", dashboardController.getDashboardStats);

module.exports = router;

