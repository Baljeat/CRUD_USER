const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.get("/me", verifyToken, salaryController.getMySalary);
router.get("/", verifyToken, isAdmin, salaryController.getAllSalaries);
router.post("/generate", verifyToken, isAdmin, salaryController.generatePayroll);
router.put("/status", verifyToken, isAdmin, salaryController.updateSalaryStatus);
router.put("/details", verifyToken, isAdmin, salaryController.updateSalaryDetails);

module.exports = router;
