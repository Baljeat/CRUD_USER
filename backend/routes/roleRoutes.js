const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { validateRole } = require("../middleware/roleValidator");

router.get("/", verifyToken, roleController.getAllRoles);
router.post("/", verifyToken, isAdmin, validateRole, roleController.createRole);
router.put("/:macv", verifyToken, isAdmin, validateRole, roleController.updateRole);
router.delete("/:macv", verifyToken, isAdmin, roleController.deleteRole);

module.exports = router;