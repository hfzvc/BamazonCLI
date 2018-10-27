var mysql = require("mysql");
var Table = require("cli-table3");
var inquirer = require("inquirer");

var table = new Table({
  head: [
    "ID",
    "Name",
    "Price",
    "In Stock",
    "Product Sales"
  ]
  , colWidths: [5,40,15,10, 10]
});

function clearTable() {
  table = new Table({
    head: [
      "ID",
      "Name",
      "Price",
      "In Stock",
      "Product Sales"
    ]
    , colWidths: [5,40,15,10]
  });
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
      message: "Choose from an option below:",
      choices: [
        "View Products for Sale",
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product"
      ]
    })
    .then(function(answer) {
      switch(answer.action) {
        case "View Products for Sale":
          clearTable();
          displayAllProducts();
          break;
        case "View Low Inventory":
          clearTable();
          viewLowInventory();
          break;
        case "Add to Inventory":
          clearTable();  
          addMoreInventory();
          break;
        case "Add New Product":
          clearTable();
          addNewProduct();
          break;
      }
    });
}

function displayAllProducts() {
  console.log("Displaying All Products Available For Sale:\n");
  connection.query("SELECT item_id, product_name, FORMAT(price, 2) as price, stock_quantity, FORMAT(product_sales, 2) as product_sales FROM products", function(err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {
      table.push([
        res[i].item_id,
        res[i].product_name,
        "$" + res[i].price,
        res[i].stock_quantity,
        res[i].product_sales
      ]);
      }
      console.log(table.toString());
      start();
  });
}

function viewLowInventory() {
  console.log("Displaying All Products with less than 5 items in stock:\n");
  connection.query("SELECT item_id, product_name, FORMAT(price, 2) as price, stock_quantity FROM products WHERE stock_quantity<5", function(err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {
      table.push([
        res[i].item_id,
        res[i].product_name,
        "$" + res[i].price,
        res[i].stock_quantity,
        "$" + res[i].product_sales
      ]);
      }
      console.log(table.toString());
      start();
  });
}

function addMoreInventory() {
  connection.query("SELECT * FROM products", function(err, originalRes) {
    if (err) throw err;
    inquirer
      .prompt([{
        name: "id",
        type: "input",
        message: "Enter item's ID number to add more stock inventory:",
        validate: function(value) {
          return (isNaN(value) === true || value === "") ? false : true;
        }
      },
      {
        name: "amount",
        type: "input",
        message: "How much to add?",
        validate: function(value) {
          return (isNaN(value) === true || value === "") ? false : true;
        }
      }])
      .then(function(change) {
        connection.query("UPDATE products SET stock_quantity = (? + stock_quantity) WHERE item_id=?",
        [parseInt(change.amount), parseInt(change.id)],
        function(err, res) {
          if (err) throw err;

          start();
        });
      });
  })
}

function addNewProduct() {
  inquirer
    .prompt([{
      name: "itemName",
      type: "input",
      message: "Enter a name: "
    },
    {
      name: "itemPrice",
      type: "input",
      message: "Enter a price: $"
    },
    {
      name: "itemStock",
      type: "input",
      message: "Enter initial inventory amount: "
    },
    {
      name: "category",
      type: "input",
      message: "Enter department name: "
    }])
    .then(function(newItem) {
      connection.query("INSERT INTO products (product_name, price, stock_quantity, department_name) VALUES (?,?,?,?)",
        [newItem.itemName, newItem.itemPrice, newItem.itemStock, newItem.category],
        function(err, res) {
          if (err) throw err;

          console.log(newItem.itemStock + " eaches of " 
            + newItem.itemName + " has been added at price of $" 
            + newItem.itemPrice + " each.");

          displayAllProducts();
        });
    });
}