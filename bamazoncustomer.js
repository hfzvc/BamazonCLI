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
      var query = "UPDATE products"
        + " SET product_sales=(price*?),"
        + " stock_quantity="
        + "CASE"
        + " WHEN stock_quantity>? THEN stock_quantity-?"
        + " ELSE stock_quantity"
        + " END"
        + " WHERE item_id=?";

      var string = connection.query(query, 
        [
          parseInt(answer.quantityToBuy), 
          parseInt(answer.quantityToBuy), 
          parseInt(answer.quantityToBuy),
          parseInt(answer.idToBuy)
        ], 
        function(err, res) {
          console.log(string.sql);
          if (err) throw err;

          if(res.affectedRows < 0) {
            console.log(
              "Insufficient quantity!\n"
              + "Ending Session, Have a nice day!"
            );
            
            displayAllProducts();
            start();
        } else {
          connection.query("SELECT product_name, price FROM products WHERE item_id=?", 
            parseInt(answer.idToBuy),
            function(err, res) {
              if (err) throw err;

              console.log(
                "Your purchased " 
                + res[0].product_name 
                + " for a total of $" 
                + (parseInt(answer.quantityToBuy)*res[0].price 
                + ".")
              );

              console.log("Thank you for shopping at Bamazon.\nEnding Session...");
              connection.end();
          })
        }
      });
    });
}

function displayAllProducts() {
  console.log("Displaying All Products Available For Sale:\n");
  connection.query(
    "SELECT item_id, product_name, FORMAT(price, 2) as price, stock_quantity FROM products", 
    function(err, res) {
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