const mongoose = require('mongoose');

const fixedSchema = new mongoose.Schema({
    main: {
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
})

const fixed = mongoose.model('fixed', fixedSchema);

module.exports = fixed;