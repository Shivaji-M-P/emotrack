import express from 'express';
import { createJournalEntry, getJournalEntries } from '../controllers/journalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);
    
router.route('/')
    .post(createJournalEntry)
    .get(getJournalEntries);

export default router;