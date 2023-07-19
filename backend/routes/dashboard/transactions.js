const router = require("express").Router();
const {addIncome, getIncomes, deleteIncome, addStatement, getStatement, getStatementInfo, generateBudget, getGeneratedBudget} = require("../../controllers/income");


router.post('/add-income', addIncome)
    .get('/get-incomes', getIncomes)
    .delete('/delete-income/:id', deleteIncome)
    .post('/upload', addStatement)
    .get('/get-statement', getStatement)
    .get('/get-statementInfo', getStatementInfo)
    .post('/generate-budget', generateBudget)
    .get('/get-generated-data', getGeneratedBudget);
module.exports = router;