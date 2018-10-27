USE bamazon;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Apples", "Grocery", 1.13, 100),
  ("Ball Point Pen", "Stationery", 0.89, 1000),
  ("Premium Notebook", "Stationery", 10.25, 50),
  ("Oranges", "Grocery", 1.10, 90),
  ("Burgundy Blazer", "Clothing", 169.99, 123),
  ("Navy Blue Trousers", "Clothing", 170.99, 100),
  ("Special Money Growing Crystals", "Nanotech", 10000.00, 10),
  ("Andys Compendium of Fantastical Creatures and How To Capture Them.", "Books", 34.59, 1000)
;

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Grocery", 10000),
  ("Stationery", 30000),
  ("Clothing", 24764),
  ("Nanotech", 1000000),
  ("Books", 20409)
;