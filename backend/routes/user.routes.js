const express = require("express");
const { getProfile, updateProfile } = require("../controllers/user.controller");
const upload = require("../config/upload");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to verify token and attach user ID to body (simple version)
// ideally this should be a separate middleware file
const protect = (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
            req.user = decoded; // attach user payload (id) to req.user
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("image"), updateProfile);

module.exports = router;
