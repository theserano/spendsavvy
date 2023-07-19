const expenseSchema = require("../models/expenseModel")

exports.addExpense = async (req, res) => {
    const {title, amount, category, description, date} = req.body;
    

    const income = new expenseSchema({
        title: title,
        amount: amount,
        category: category,
        description: description,
        date: date
    })
    try {
        //validations
        if(!title || !category || !description || !date) {
            return res.status(400).json({message: "all fields are required for this"})
        }
        if(amount <= 0 || isNaN(amount)) { 
            return res.status(400).json({message: "amount must be a positive number"});
        }
        await income.save();
        res.status(200).json({message: "expense Added"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Server error"})
    }

    console.log(income);
}

exports.getExpense = async (req, res) => {
    try {
        const incomes = await expenseSchema.find().sort({createdAt: -1})
        res.status(200).json(incomes)
    } catch (error) {
        res.status(500).json({message: "server error"});
    }
}

exports.deleteExpense = async (req, res) => {
    const {id} = req.params;
    expenseSchema.findByIdAndDelete(id)
        .then((income) => {
            res.status(200).json({message: "expense deleted"})
        })
        .catch((err) => {
            res.status(500).json({message: "server error"})
        })
}