const mongoose = require('mongoose');

const mainSchema = new mongoose.Schema({
  monthly: {
    type: Number,
  },
  approach: {
    type: String,
  },
  savings: {
    type: Number,
  },
  value: {
    percent: {
      type: Object
    },
    selected: {
      type: [String],
    },
  },
});

const incomeSchema = new mongoose.Schema({
  main: mainSchema,
  mainVal: {
    monthly: {
      type: Number,
    },
    approach: {
      type: String,
    },
    savings: {
      type: Number,
    },
    value2: {
      percent2: {
        type: Object,
      },
      selected2: {
        type: [String],
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const income = mongoose.model('income', incomeSchema);

module.exports = income;
