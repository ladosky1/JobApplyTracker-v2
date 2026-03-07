import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken =(id) => {
    return jwt.sign(
        {id},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "error.message" });
    }
}

export const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        };

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }).status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
}

export const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {  
            return res.status(401).json({ message: "invalid email or password" });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "none",
                    maxAge: 7 * 24 * 60 * 60 * 1000
            }).status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const logoutUser = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({message: "logged out succesfully"});
}