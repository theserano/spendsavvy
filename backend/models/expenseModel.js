const mongoose = require("mongoose");


const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        maxLength: 50
    },
    amount: {
        type: Number,
        maxLength: 20,
        trim: true
    },
    type: {
        type: String,
        default: "income"
    },
    date: {
        type: Date,
        trim: true 
    },
    category: {
        type: String,
        maxLength: 20,
        trim: 20
    }, 
    description: {
        type: String,
        maxLength: 20,
        trim: true
    },
}, {timestamps: true})

module.exports = mongoose.model('expense', expenseSchema)
