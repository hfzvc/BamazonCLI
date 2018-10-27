var mysql = require("mysql");
var Table = require("cli-table3");
var inquirer = require("inquirer");

var table = new Table({
  head: ["ID",
    "Name",
    "Price",
    "In Stock"]
  , colWidths: [5,40,15,10]
});

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
  displayAllProducts();
});

function start() {
  inquirer
    .prompt([{
      name: "idToBuy",
      type: "input",
      message: "Type in the 'ID' of the product you would like to buy: ",
      validate: function(value) {
        return (isNaN(value) === true || value === "") ? false : true;
      }
    },
    {
      name: "quantityToBuy",
      type: "input",
      message: "How much would you like to buy: ",
      validate: function(value) {
        return (isNaN(value) === true || value === "") ? false : true;
      }
    }])
    .then(function(answer) {
      connection.query(
        "SELECT price, stock_quantity FROM products WHERE item_id=?",
        answer.idToBuy,
        function(err, res) {
          if(err) console.log(err.message);

          if(res[0].stock_quantity < answer.quantityToBuy) {
            console.log("Insufficient quantity!\n"
              + "Ending Session, Have a nice day!");
            
            connection.end();
          } else {
            
            var newStock = res[0].stock_quantity - answer.quantityToBuy;
            var totalCost = res[0].price * answer.quantityToBuy;
            
            connection.query(
              "UPDATE products SET stock_quantity=? WHERE item_id=?",
              [newStock, parseInt(answer.idToBuy)],
              function(err, res) {
                if(err) throw err;

                console.log(res.affectedRows)
                console.log("Thank you shopping at Bamazon.\n"
                  + "Your total for today is: $" + totalCost
                  + "\nGood Bye!");
                connection.end();
              }
            );
          }
        }
      );
    });
}

function displayAllProducts() {
  console.log("Displaying All Products Available For Sale:\n");
  connection.query("SELECT item_id, product_name, FORMAT(price, 2) as price, stock_quantity FROM products", function(err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {
      table.push([
        res[i].item_id
        ,res[i].product_name
        ,"$" + res[i].price
        ,res[i].stock_quantity
      ]);
      }
      console.log(table.toString());
      start();
  });
}