var mysql = require("mysql");
var Table = require("cli-table3");
var inquirer = require("inquirer");
var head = {
  head: [
    "department_id",
    "department_name",
    "over_head_costs",
    "product_sales",
    "total_profit"
  ],
  colWidths: [20,20,20,20,20]
}

var table = new Table(head);

function clearTable() {
  table = new Table(head);
}

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connection establish as id " + connection.threadId + "\n");
  start();
});

function start() {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View Product Sales by Department",
        "Create New Department"
      ]
    })
    .then(function(answer) {
      
      switch(answer.action) {
        case "View Product Sales by Department":
          clearTable();
          viewProductSales();
          break;
        case "Create New Department":
          createDepartment();
          break;
      }
    });
}

function viewProductSales() {
  connection.query(
    "SELECT d.department_id, d.department_name, FORMAT(d.over_head_costs, 2) as overhead, FORMAT(SUM(p.product_sales), 2) as sales,"
    + " FORMAT(SUM(p.product_sales) - d.over_head_costs, 2) as total_profit"
    + " FROM departments as d"
    + " INNER JOIN products as p"
    + " ON d.department_name = p.department_name"
    + " GROUP BY d.department_id",
    function(err, res) {
      if (err) throw err;

      for (var i = 0; i < res.length; i++) {
        table.push([
          res[i].department_id,
          res[i].department_name,
          "$" + res[i].overhead,
          "$" + res[i].sales,
          "$" + res[i].total_profit
        ]);
      }

      console.log(table.toString());
      start();
    }
  )
}

function createDepartment() {
  inquirer
    .prompt([{
      name: "deptName",
      type: "input",
      message: "What is the department name?",
      validate: function(value) {
        return (typeof value !== "string" || value === "") ? false : true;
      }
    },
    {
      name: "overheadCosts",
      type: "input",
      message: "What is the department costs?",
      validate: function(value) {
        return (isNaN(value) === true || value === "") ? false : true;
      }
    }
  ])
  .then(function(newDept) {
    connection.query(
      "INSERT INTO departments SET ?",
      {
        department_name: newDept.deptName,
        over_head_costs: parseInt(newDept.overheadCosts)
      },
      function(err, res) {
        if (err) throw err;
  
        console.log("Added " + newDept.deptName + " to the departments records.");
        start();
      }
    );
  });
}