/**
 * Flight Reservation System
 * A Node.js application for managing flight reservations using Inquirer.js
 */
import inquirer from "inquirer";
import fs from "node:fs";
const account = [];
const transferDetail = [];
let accountId = 1;

async function createAccount() {
  console.log("-------------------------------------");
  console.log("  CREATE BANK ACOUNT");
  console.log("-------------------------------------\n");

  const { user } = await inquirer.prompt([
    {
      type: "input",
      name: "user",
      message: "Enter user name: ",
      validate: (input) => (input.trim() ? true : "Incorrect account number"),
    },
  ]);
  const { number } = await inquirer.prompt([
    {
      type: "input",
      name: "number",
      message: "Enter account number: ",
      validate: (input) => (input.trim() ? true : "Incorrect account pin"),
    },
  ]);

  const { pin } = await inquirer.prompt([
    {
      type: "password",
      name: "pin",
      message: "Enter PIN: ",
      mask: "*",
      validate: (input) => {
        if (!input.trim()) {
          return "PIN cannot be empty";
        } else if (input.length !== 5) {
          return "PIN must be exactly 5 digits";
        }
        return true;
      },
    },
  ]);

  const { amount } = await inquirer.prompt([
    {
      type: "input",
      name: "amount",
      message: "Enter account balance: ",
      validate: (input) => (input.trim() ? true : "amount must be upto 300"),
    },
  ]);

  let acountPin = Number(pin);
  let balance = Number(amount);
  console.log(`\n HELLO, [ ${user} ]!`);
  console.log("Account created successfully!");
  account.push({
    id: `A00${accountId++}`,
    userName: user,
    accountNumber: number,
    pin: acountPin,
    bankBalace: balance,
  });
  // console.log(account);
  main();
}

async function main() {
  writeToFile();
  console.log("\n" + "=".repeat(40));
  console.log("    WELCOME TO ACCOUNT DASHBOARD ");
  console.log("=".repeat(40));
  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        { name: "🎫    View Balance", value: "view" },
        { name: "📋    Deposit Money", value: "deposit" },
        { name: "✏️    Withdraw Money ", value: "withdraw" },
        { name: "🗑️    Transfer Funds", value: "transfer" },
        { name: "🗑️    Change PIN", value: "pin" },
        { name: "🗑️    View Transaction History", value: "history" },
        { name: "🗑️     Add Account", value: "add" },
        { name: "🗑️    Exit", value: "exit" },
      ],
    },
  ]);

  switch (choice) {
    case "view":
      await viewBalance();
      break;
    case "deposit":
      await depositMony();
      break;
    case "withdraw":
      await withdrawMony();
      break;
    case "transfer":
      await transferMony();
      break;
    case "pin":
      await changePin();
      break;
    case "history":
      await transectionHistory();
      break;
    case "add":
      await createAccount();
      break;
    case "exit":
      console.log("\n👋 Thank you for using my back application!");
      process.exit(0);
  }
}

async function viewBalance() {
  if (account.length === 0) {
    console.log(`Account not found`);
    return main();
  }
  const { selectedAcc } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedAcc",
      message: "Select an account:",
      choices: account.map((acc, index) => ({
        name: `${acc.id}`,
        value: index,
      })),
    },
  ]);
  const acc = account[selectedacc];
  console.log(`
    Account Holder : ${acc.userName}
    Account Number : ${acc.accountNumber}
    Current Balance: Rs. ${acc.bankBalace ?? 0}
  `);
  main();
}

async function depositMony() {
  console.log("--------------------------------------");
  console.log("  DEPOSIT MONEY");
  console.log("--------------------------------------\n");
  const { number } = await inquirer.prompt([
    {
      type: "input",
      name: "number",
      message: "Enter account number to deposit:: ",
      validate: (input) => (input.trim() ? true : "Incorrect account number"),
    },
  ]);
  const { amount } = await inquirer.prompt([
    {
      type: "input",
      name: "amount",
      message: "Enter amount to deposit: ",
      validate: (input) =>
        isNaN(input) || parseFloat(input) <= 0
          ? "Amount must be greater than 0"
          : true,
    },
  ]);
  let found = false;
  account.forEach((acc) => {
    if (acc.accountNumber === number.trim()) {
      acc.bankBalace = (acc.bankBalace || 0) + Number(amount);
      let currentDate = new Date().toLocaleString();
      console.log(`Deposit successful!`);
      console.log(`Deposit date : ${currentDate}`);
      console.log(`New Balance for ${acc.userName}: Rs. ${acc.bankBalace}`);
      found = true;
      transferDetail.push({
        deposit: `deposit Rs. ${amount} on ${currentDate}`,
      });
    }
  });
  if (!found) {
    console.log("\n Account not found.");
  }
  main();
}
async function withdrawMony() {
  console.log("--------------------------------------");
  console.log("         WITHDRAW MONEY");
  console.log("--------------------------------------\n");

  const { accpin } = await inquirer.prompt([
    {
      type: "password",
      name: "accpin",
      message: "Enter your 5-digit PIN: ",
      mask: "*",
      validate: (input) => {
        if (!input.trim()) return "PIN cannot be empty";
        if (input.length !== 5) return "PIN must be exactly 5 digits";
        return true;
      },
    },
  ]);

  const { amount } = await inquirer.prompt([
    {
      type: "input",
      name: "amount",
      message: "Enter amount to withdraw: ",
      validate: (input) =>
        isNaN(input) || parseFloat(input) <= 0
          ? "Amount must be greater than 0"
          : true,
    },
  ]);
  let pass = Number(accpin);
  let found = false;
  const withdrawAmount = parseFloat(amount);

  account.forEach((acc) => {
    if (acc.pin === pass) {
      found = true;

      const currentBalance = acc.bankBalace || 0;

      if (withdrawAmount > currentBalance) {
        console.log("\n Insufficient balance.");
      } else {
        let currentDate = new Date().toLocaleString();
        acc.bankBalace = currentBalance - withdrawAmount;
        console.log(`\nAmount Withdraw : ${withdrawAmount}`);
        console.log(`\nWithdraw date : ${currentDate}`);
        console.log(
          `Remaining Balance : Rs. ${acc.userName}: Rs. ${acc.bankBalace}`
        );

        transferDetail.push({
          withdraw: `withdraw Rs. ${withdrawAmount} on ${currentDate}`,
        });
      }
    }
  });

  if (!found) {
    console.log("\n No account found with that PIN.");
  }

  main();
}

async function transferMony() {
  console.log("--------------------------------------");
  console.log("         TRANSFER MONEY");
  console.log("--------------------------------------\n");
  const { senderPin } = await inquirer.prompt([
    {
      type: "password",
      name: "senderPin",
      message: "Enter your 5-digit PIN: ",
      mask: "*",
      validate: (input) => {
        if (!input.trim()) return "PIN cannot be empty";
        if (input.length !== 5) return "PIN must be exactly 5 digits";
        return true;
      },
    },
  ]);
  const { recipientNumber } = await inquirer.prompt([
    {
      type: "input",
      name: "recipientNumber",
      message: "Enter recipient's account number: ",
      validate: (input) => (input.trim() ? true : "Account number is required"),
    },
  ]);
  const { amount } = await inquirer.prompt([
    {
      type: "input",
      name: "amount",
      message: "Enter amount to transfer: ",
      validate: (input) =>
        isNaN(input) || parseFloat(input) <= 0
          ? "Amount must be greater than 0"
          : true,
    },
  ]);
  const transferAmount = Number(amount);
  const senderAcc = account.find((acc) => String(acc.pin) === senderPin.trim());
  const receiverAcc = account.find(
    (acc) => acc.accountNumber === recipientNumber.trim()
  );
  if (!senderAcc) {
    console.log("\n Sender account not found or PIN incorrect.");
    return main();
  }
  if (!receiverAcc) {
    console.log("\n Recipient account not found.");
    return main();
  }
  if (senderAcc.accountNumber === receiverAcc.accountNumber) {
    console.log("\n You cannot transfer to your own account.");
    return main();
  }
  if ((senderAcc.bankBalace || 0) < transferAmount) {
    console.log("\n Insufficient funds.");
    return main();
  }
  senderAcc.bankBalace = (senderAcc.bankBalace || 0) - transferAmount;
  receiverAcc.bankBalace = (receiverAcc.bankBalace || 0) + transferAmount;
  const now = new Date().toLocaleString();
  console.log(`\n  Rs. ${transferAmount} transferred successfully on ${now}`);
  console.log(
    `Sender: ${senderAcc.userName}, Rs. ${transferAmount} send to ${receiverAcc.userName}`
  );
  console.log(
    `Recipient: ${receiverAcc.userName}, recive Rs. ${transferAmount}`
  );
  transferDetail.push({
    trensfer: `send ${senderAcc.bankBalace} to ${receiverAcc.number} on ${now}`,
  });
  main();
}

async function changePin() {
  console.log("---------------- CHANGE PIN --------------");

  const { updatepin } = await inquirer.prompt([
    {
      type: "password",
      name: "updatepin",
      message: "Enter your current Account PIN: ",
      mask: "*",
      validate: (input) => {
        if (!input.trim()) {
          return "PIN cannot be empty";
        } else if (input.length !== 5) {
          return "PIN must be exactly 5 digits";
        }
        return true;
      },
    },
  ]);

  const userAccount = account.find(
    (acc) => acc.id === updatepin || acc.pin === Number(updatepin)
  );

  if (!userAccount) {
    console.log(" Account not found!");
    return changePin();
  }

  const { newPin } = await inquirer.prompt([
    {
      type: "password",
      name: "newPin",
      message: "Enter NEW PIN: ",
      mask: "*",
      validate: (input) => {
        if (!input.trim()) {
          return "PIN cannot be empty";
        } else if (input.length !== 5) {
          return "PIN must be exactly 5 digits";
        }
        return true;
      },
    },
  ]);

  userAccount.pin = Number(newPin);
  console.log(" PIN updated successfully!");
  main();
}

async function transectionHistory() {
  console.log("------------------------------------");
  console.log(" TRANSECTION HISTORY");
  console.log("------------------------------------");
  transferDetail.forEach((H) => {
    console.log(`
         ${H.deposit}  
         ${H.withdraw} 
         ${H.trensfer}
      `);
  });
  main();
}

function writeToFile() {
  let accountText = "===== ACCOUNT DETAILS =====\n";
  account.forEach((acc, index) => {
    accountText += `
[${index + 1}]
ID: ${acc.id}
Name: ${acc.userName}
Account Number: ${acc.accountNumber}
PIN: ${acc.pin}
Balance: Rs. ${acc.bankBalace}
-----------------------------\n`;
  });
  let historyText = "===== TRANSACTION HISTORY =====\n";
  transferDetail.forEach((t, index) => {
    historyText += `[${index + 1}] `;
    if (t.deposit) historyText += `Deposit: ${t.deposit}\n`;
    if (t.withdraw) historyText += `Withdraw: ${t.withdraw}\n`;
    if (t.trensfer) historyText += `Transfer: ${t.trensfer}\n`;
    historyText += "-----------------------------\n";
  });
  const finalContent = `${accountText}\n${historyText}`;
  fs.writeFileSync("account.txt", finalContent);
  console.log(" Data saved to account.txt");
}

process.on("SIGINT", async () => {
  console.log("\n\n👋 Goodbye!");
  process.exit(0);
});

// Start the application
// main().catch(console.error);
createAccount().catch(console.error);
