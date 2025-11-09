import Journal from '../models/Journal.js';

// @desc    Create a new journal entry
// @route   POST /api/journal
// @access  Private
export const createJournalEntry = async (req, res) => {
    try {
        console.log(req.body)
        console.log('Journal create request:', {
            userId: req.user?._id,
            bodyKeys: Object.keys(req.body),
            authHeader: req.headers.authorization ? 'Present' : 'Missing'
        });

        const { entryText, mood, tags } = req.body;

        // Validate input
        if (!entryText || typeof entryText !== 'string') {
            return res.status(400).json({ 
                message: 'entryText is required and must be a string',
                received: typeof entryText
            });
        }

        // Validate mood if provided
        if (mood !== undefined && mood !== null) {
            const moodNum = Number(mood);
            if (isNaN(moodNum) || moodNum < 1 || moodNum > 5) {
                return res.status(400).json({ 
                    message: 'mood must be a number between 1 and 5',
                    received: mood
                });
            }
        }

        // Validate tags if provided
        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({
                message: 'tags must be an array',
                received: typeof tags
            });
        }

        // Create journal entry
        const journalEntry = await Journal.create({
            student: req.user._id,
            entryText: entryText.trim(),
            mood: mood ? Number(mood) : null,
            tags: tags?.map(tag => tag.trim().toLowerCase()) || []
        });

        console.log('Journal entry created:', {
            id: journalEntry._id,
            userId: journalEntry.student,
            date: journalEntry.entryDate
        });

        res.status(201).json(journalEntry);
    } catch (error) {
        console.error('Journal create error:', error);
        res.status(500).json({ 
            message: "Error creating journal entry",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get user's journal entries
// @route   GET /api/journal
// @access  Private
export const getJournalEntries = async (req, res) => {
    try {
        const entries = await Journal.find({ student: req.user._id })
            .sort({ entryDate: -1 })
            .limit(10);
        
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: "Error fetching journal entries" });
    }
};