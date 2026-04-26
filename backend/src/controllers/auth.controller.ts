import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "user with this email already exist" });
            }
            const hashpassword = await bcrypt.hash(password, 10);
            const user = await UserModel.create({
                name,
                email,
                password: hashpassword
            })

            res.status(201).json({
                message: "User registered successfully",
                userId: user._id
            });
        } catch (error) {
            res.status(500).json({ message: "Error registering user" });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
          
            const user = await UserModel.findOne({ email });

            if (!user) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const correctPassword = await bcrypt.compare(password, user.password);
            if (!correctPassword) {
                return res.status(401).json({ message: "invalid email or password" })
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET as string,
                { expiresIn: "1d" }
            )


            const { password: _, ...userData } = user.toObject();
            return res.status(200).json({
                message: "user login succeesfullt",
                user: userData,
                token
            })
        } catch (error) {
            res.status(500).json({ message: "Error login" });
        }
    }
}