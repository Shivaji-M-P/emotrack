
const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  entryText: {
    type: String,
    required: true,
  },
  entryDate: {
    type: Date,
    default: Date.now,
  },
  tags: [String]
});

module.exports = mongoose.model('Journal', JournalSchema);

