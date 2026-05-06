const authService = require("../services/authService");

// LOGIN
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const data = await authService.login(username, password);
        res.json(data);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

// GET ALL
exports.getAccounts = async (req, res) => {
    try {
        const data = await authService.getAllAccounts();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE
exports.createAccount = async (req, res) => {
    try {
        const data = await authService.createAccount(req.body);
        res.json(data);
    } catch (err) {
        console.error("LỖI:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
exports.updateAccount = async (req, res) => {
    try {
        const data = await authService.updateAccount(
            req.params.tentk,
            req.body
        );
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE
exports.deleteAccount = async (req, res) => {
    try {
        await authService.deleteAccount(req.params.tentk);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};