const express = require("express");
const router = express.Router();
const controller = require("../controllers/contractController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { validateContract } = require("../middleware/contractValidator");

router.get("/", verifyToken, controller.getAll);
router.post("/", verifyToken, isAdmin, validateContract, controller.create);
router.put("/:id", verifyToken, isAdmin, validateContract, controller.update);

module.exports = router;