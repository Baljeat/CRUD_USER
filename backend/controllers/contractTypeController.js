const contractTypeService = require("../services/contractTypeService");

exports.getAll = async (req, res) => {
    try { res.json(await contractTypeService.getAll()); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try { res.status(201).json(await contractTypeService.create(req.body)); } 
    catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
    try { res.json(await contractTypeService.update(req.params.id, req.body)); } 
    catch (err) { res.status(400).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
    try { 
        await contractTypeService.delete(req.params.id); 
        res.json({ message: "Xóa thành công" }); 
    } catch (err) { res.status(400).json({ error: "Không thể xóa vì đang có hợp đồng dùng loại này." }); }
};