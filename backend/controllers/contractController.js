const contractService = require("../services/contractService");

exports.getAll = async (req, res) => {
    try { res.json(await contractService.getAll()); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try { 
        const newContract = await contractService.create(req.body);
        res.status(201).json(newContract); 
    } 
    catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
    try { 
        const updatedContract = await contractService.update(req.params.id, req.body); 
        res.json(updatedContract); 
    } 
    catch (err) { res.status(400).json({ error: err.message }); }
};