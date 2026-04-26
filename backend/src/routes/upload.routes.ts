import { Router } from "express";
import upload from "../config/multer";
import { uploadController } from "../controllers/upload.controller";
import { authMiddleWare } from "../middleware/auth.middleware";

const router = Router();

router.post("/upload",authMiddleWare, upload.single("file"), uploadController.upload);

export default router