import jwt from "jsonwebtoken";
import User from "../model/User.js";

const protect = async (req, res, next) => {
      
    try {
        const authBearer = req.headers.authorization;

        if(!authBearer || !authBearer.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not Authorized" });
        }

        const token = authBearer.split(" ")[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        next();
    } catch (error) {
        return res.status(401).json({ message: "Not Authorized"});
    }
};

export default protect;