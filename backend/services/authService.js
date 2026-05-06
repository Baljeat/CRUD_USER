const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/authRepository");

// LOGIN
exports.login = async (username, password) => {
    const user = await authRepository.getByUsername(username);

    if (!user) {
        throw new Error("Tài khoản không tồn tại");
    }

    if (user.trangthai !== "active") {
        throw new Error("Tài khoản đã bị khoá");
    }

    if (user.pass !== password) {
        throw new Error("Sai mật khẩu");
    }

    const token = jwt.sign(
        {
            username: user.tentk,
            role: user.phanquyen,
            manv: user.manv
        },
        process.env.JWT_SECRET || "SECRET_KEY",
        { expiresIn: "1d" }
    );

    return {
        token,
        role: user.phanquyen,
        username: user.tentk,
        manv: user.manv
    };
};

// GET ALL
exports.getAllAccounts = async () => {
    return await authRepository.getAllAccounts();
};

// CREATE
exports.createAccount = async (data) => {
    return await authRepository.createAccount(data);
};

// UPDATE
exports.updateAccount = async (tentk, data) => {
    return await authRepository.updateAccount(tentk, data);
};

// DELETE
exports.deleteAccount = async (tentk) => {
    return await authRepository.deleteAccount(tentk);
};
