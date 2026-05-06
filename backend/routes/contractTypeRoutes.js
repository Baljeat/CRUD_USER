const express = require("express");
const router = express.Router();
const controller = require("../controllers/contractTypeController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { validateContractType } = require("../middleware/contractTypeValidator");

router.get("/", verifyToken, controller.getAll);
router.post("/", verifyToken, isAdmin, validateContractType, controller.create);
router.put("/:id", verifyToken, isAdmin, validateContractType, controller.update);
router.delete("/:id", verifyToken, isAdmin, controller.delete);

module.exports = router;