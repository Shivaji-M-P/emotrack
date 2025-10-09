import express from "express";
import { addEmotion, getEmotions } from "../controllers/emotionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addEmotion);
router.get("/", protect, getEmotions);

export default router;
