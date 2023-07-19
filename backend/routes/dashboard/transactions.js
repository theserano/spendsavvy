const router = require("express").Router();
const { addExpense, getExpense, deleteExpense } = require("../../controllers/expense");
const {addIncome, getIncomes, deleteIncome, addStatement, getStatement, getStatementInfo, generateBudget, getGeneratedBudget} = require("../../controllers/income");


router.post('/add-income', addIncome)
    .get('/get-incomes', getIncomes)
    .delete('/delete-income/:id', deleteIncome)
    .post('/add-expense', addExpense)
    .get('/get-expenses', getExpense)
    .delete('/delete-expense/:id', deleteExpense)
    .post('/upload', addStatement)
    .get('/get-statement', getStatement)
    .get('/get-statementInfo', getStatementInfo)
    .post('/generate-budget', generateBudget)
    .get('/get-generated-data', getGeneratedBudget);
module.exports = router;