const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const PdfParse = require("pdf-parse");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const file = require("../models/fileModel");

const upload = multer({ dest: "uploads/" });
const incomeSchema = require("../models/incomeModel");
const fixed = require("../models/fixedIncome");
const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
  console.log("Connected to MongoDB");
});

const createWriteStream = (filename) => {
  const writeStream = gfs.createWriteStream({
    filename,
    mode: "w",
  });
  return writeStream;
};

exports.addIncome = async (req, res) => {
  const { main, mainVal, userId } = req.body;
  console.log(req.body);
  console.log(main, mainVal);

  try {
    // Validate main and mainVal
    if (!main || !mainVal) {
      return res.status(400).json({ message: "Invalid income data" });
    }

    // Create new income document
    const incomeData = new incomeSchema({
      main: {
        monthly: main.monthly,
        approach: main.approach,
        savings: main.save,
        value: {
          percent: main.value.percent,
          selected: main.value.selected,
        },
      },
      mainVal: {
        monthly: mainVal.monthly,
        approach: mainVal.approach,
        savings: mainVal.savings,
        value2: {
          percent2: mainVal.value2.percent2,
          selected2: mainVal.value2.selected2,
        },
      },
      userId: userId,
    });

    // Save income document to the database
    await incomeData.save();

    res.status(200).json({ message: "Income added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getIncomes = async (req, res) => {
  // console.log(req.query);
  try {
    const userId = req.query.userId; // Extract the userId from the request body

    const incomes = await incomeSchema
      .findOne({ userId: userId }) // Query the income data based on the userId
      .sort({ createdAt: -1 })
      .limit(1);

    if (incomes) {
      res.status(200).json(incomes);
    } else {
      res.status(404).json({ message: "No income data found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteIncome = async (req, res) => {
  const { id } = req.params;
  incomeSchema
    .findByIdAndDelete(id)
    .then((income) => {
      res.status(200).json({ message: "income deleted" });
    })
    .catch((err) => {
      res.status(500).json({ message: "server error" });
    });
};

exports.addStatement = async (req, res) => {
  // console.log(req.files);
  // console.log(req.query.userId);
  // console.log(req.query);
  // console.log(req.query.fName, req.query.lName);

  const userId = req.query.userId;
  const fName = req.query.fName;
  const lName = req.query.lName;
  const fullName = fName.concat(" ",lName);
  // console.log(fullName);
  // console.log(userId);
  if (!req.files && !req.files.pdf) {
    res.status(400);
    res.send();
  }
  try {
    PdfParse(req.files.pdf).then((result) => {
      const extractedText = result.text;
      const accInfo = getAccountInformation(extractedText);
      const balance = extractDateAndBalance(extractedText);

      const fileName = req.files.pdf.name;
      const fileData = req.files.pdf.data;

      // function to compare names
      function isFullNameContained(fullName, accountName) {
        // Convert both the full name and account name to lowercase for case insensitivity
        const fullNameLower = fullName.toLowerCase();
        const accountNameLower = accountName.toLowerCase();
      
        // Split the full name into individual words
        const fullNameWords = fullNameLower.split(' ');
      
        // Check if each word of the full name is contained within the account name
        for (const word of fullNameWords) {
          if (!accountNameLower.includes(word)) {
            return false;
          }
        }
      
        return true;
      }
       
      
      const data = {
        accInfo: accInfo,
        balance: balance,
        extractedText: extractedText,
      };
      const isContained = isFullNameContained(fullName, data.accInfo.accountName);
      console.log(data.accInfo.accountName);
      if(isContained){
        // call to save file to mongoDB
        saveFileToDB(fileName, fileData, userId, data);
        console.log("right file");
        res.status(200).json(data);
      }
      else{
        console.log('wrong file')
        res.status(400).json("This is not your file");
      }

    });
  } catch (error) {
    console.log(error);
  }

  // console.log(req.files);
};

//file to save the file to mongoDB
async function saveFileToDB(filename, data, userId, contentType) {
  const File = new file({
    filename,
    data,
    userId,
    contentType,
  });
  await File.save();
  console.log("File saved to MongoDB");
}


exports.getStatement = async (req, res) => {
  // console.log(req.query);
  try {
    const Id = req.query.userId;
    // console.log(Id);
    const File = await file
      .findOne({ userId: Id }) // Query the income data based on the userId
      .sort({ createdAt: -1 })
    
    // console.log(File);

    if (File) {
      res.status(200).json(File);
    } else {
      res.status(404).json({ message: "No income data found" });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getStatementInfo = async (req, res) => {
  // console.log(req.query);
  try {
    const Id = req.query.userId;
    // console.log(Id);
    const File = await file
      .findOne({ userId: Id }) // Query the income data based on the userId
      .sort({ createdAt: -1 })
      .limit(1);

    if (File) {
      res.status(200).json(File); 
    } else {
      res.status(404).json({ message: "No income data found" });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.generateBudget = async (req, res) => {
  const { main } = req.body;
  // console.log(main);

  try {
    if (!main) {
      return res.status(400).json("No data found");
    }

    const File = await file
      .findOne({ userId: main.userId }) // Query the income data based on the userId
      .sort({ createdAt: -1 })
      .limit(1); 
      // console.log(File);

    if (File) {
      const file_monthly = File.contentType.accInfo.totalWithdrawals;
      // console.log(File);

      const generateData = new fixed({
        main: {
          monthly: file_monthly,
          approach: main.main.approach,
          savings: main.main.savings,
          value: {
            percent2: main.main.value3.percent3,
            selected2: main.main.value3.selected3,
          },
        },
        userId: main.userId,
      });

      await generateData.save();
      console.log(generateData);
    }

    res.status(200).json("Data saved successfully");
  } catch (error) {
    console.log(error);
  }
};


exports.getGeneratedBudget = async (req, res) => {
  try {
    const Id = req.query.userId;
    console.log(Id);
    const data = await fixed
      .findOne({ userId: Id }) // Query the income data based on the userId
      .sort({ createdAt: -1 })
      .limit(1);

    console.log(data);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "No income data found" });
    }
  } catch (error) {
    console.log(error);
  }
};

// function to calculate the daily spending
// function calculateDailySpending(data) {
//     const lines = data.split('\n');
//     const dailySpending = [];
//     let previousBalance = 0;

//     for (let line of lines) {
//       if (
//         line.includes('AIRTIME TOPUP FOR') ||
//         line.includes('TRF/') ||
//         line.includes('/WEB PMT') ||
//         line.includes('POS') ||
//         line.includes('via') ||
//         /\b\d{2}-[A-Z]{3}-\d{2}\b/.test(line)
//       ) {
//         const columns = line.split(/-+/);
//         const date = columns[0].trim();
//         const amountMatch = columns[columns.length - 2].match(/(\d+\.\d+)/);
//         const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

//         if ( amount < previousBalance) {
//           const formattedAmount = amount.toFixed(2); // Format amount to 2 decimal places

//           const dailyRecord = {
//             date: date,
//             amount: formattedAmount,
//           };

//           dailySpending.push(dailyRecord);
//         }

//         previousBalance = amount;
//       }
//     }

//     return dailySpending;
//   }

// function to get the users account information
function getAccountInformation(statementData) {
  const accountInfo = {};

  // Extract account name
  const accountNameMatch = statementData.match(/Account Name(.+)/);
  if (accountNameMatch) {
    accountInfo.accountName = accountNameMatch[1].trim();
  }

  // Extract account number
  const accountNumberMatch = statementData.match(/Account Number(.+)/);
  if (accountNumberMatch) {
    accountInfo.accountNumber = accountNumberMatch[1].trim();
  }

  // Extract opening balance
  const openingBalanceMatch = statementData.match(/Opening Balance([0-9.,]+)/);
  if (openingBalanceMatch) {
    accountInfo.openingBalance = parseFloat(
      openingBalanceMatch[1].replace(/,/g, "") 
    ); 
  }

  // Extract closing balance
  const closingBalanceMatch = statementData.match(/Closing Balance([0-9.,]+)/);
  if (closingBalanceMatch) {
    accountInfo.closingBalance = parseFloat(
      closingBalanceMatch[1].replace(/,/g, "")
    );
  }

  // Extract total withdrawals
  const totalWithdrawalsMatch = statementData.match(
    /Total Withdrawals([0-9.,]+)/
  );
  if (totalWithdrawalsMatch) {
    accountInfo.totalWithdrawals = parseFloat(
      totalWithdrawalsMatch[1].replace(/,/g, "")
    );
  }

  return accountInfo;
}

//   function to get the balance of every day
function extractDateAndBalance(data) {
  const lines = data.split("\n");
  const records = [];

  for (let line of lines) {
    const match = line.match(/^(\d{2}-[A-Z]{3}-\d{2}).*?(\d+,\d+\.\d+)$/);
    if (match) {
      const date = match[1];
      const balance = parseFloat(match[2].replace(/,/g, ""));
      if (/\.\d{2}$/.test(match[2])) {
        // Check if balance has two decimal places
        records.push({ date, balance });
      }
    }
  }

  return records;
}
