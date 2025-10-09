import mongoose from "mongoose";

const emotionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mood: { type: String, enum: ["happy", "sad", "neutral", "stressed"], required: true },
  intensity: { type: Number, min: 1, max: 10 },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model("Emotion", emotionSchema);
