const express = require('express');
const router = express.Router();
const degreeController = require('../controllers/degreeController');
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const { getDegreesByEmployee, addDegree, updateDegree, deleteDegree } = degreeController;

router.get('/:manv', verifyToken, getDegreesByEmployee);
router.post('/', verifyToken, isAdmin, addDegree);
router.put('/:mabc', verifyToken, isAdmin, updateDegree);
router.delete('/:mabc', verifyToken, isAdmin, deleteDegree);

module.exports = router;