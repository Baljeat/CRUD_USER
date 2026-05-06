const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(403).json({ message: "Chưa đăng nhập" });

    jwt.verify(
        token,
        process.env.JWT_SECRET || "SECRET_KEY",
        (err, decoded) => {
            if (err) return res.status(401).json({ message: "Token không hợp lệ" });

            req.user = decoded;
            next();
        }
    );
};

exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Không có quyền admin" });
    }
    next();
};