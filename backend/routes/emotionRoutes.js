import express from "express";

import { addEmotion, getEmotions } from "../controlletrs/emotionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addEmotion);
router.get("/", protect, getEmotions);

export default router;
