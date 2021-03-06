var express = require('express');
var router = express.Router();
const db = require("../model/helper")


function makeWhereFromFilters(q) {
    let filters = [];

    if (q.status) {
        filters.push(`status = '${q.status}'`);
    }
    if (q.type) {
        filters.push(`type = '${q.type}'`);
    }

    // Return all filters joined by AND
    return filters.join(' AND ');
}

router.get("/", async function (req, res) {
  let sql = 'SELECT * FROM products'; 
  let where = makeWhereFromFilters(req.query); 
   if (where) {
    sql += ` WHERE ${where}`;
    }
 try {
  let result = await db(sql);
 
    let products = result.data;
    res.send(products);
 }
 catch (err) {
  res.status(500).send({ error: err.message });
}
});

// GET one product
router.get("/:id", async function(req, res) {
  let { id } = req.params;
  try {
    let result = await db(`SELECT * FROM products WHERE prodid = ${id}`);
    let products = result.data;
    if (products.length === 0) {
      res.status(404).send({ error: "item not found" });
    } else {
      res.send(products[0]);
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// INSERT a new product into the DB
router.post("/", async function(req, res) {
  let { name, type, description, image, price, status } = req.body;
  let sql = `
  INSERT INTO products (name, type, description, image, price, status)
  VALUES ('${name}', '${type}', '${description}', '${image}', '${price}', '${status}')
  `;

  try {
    await db(sql);
    let result = await db("SELECT * FROM products");
    res.send(result.data);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let result = await db(`SELECT * FROM products WHERE prodid = ${id}`);
    if (result.data.length === 1) {
      await db(`DELETE FROM products WHERE prodid = ${id}`);
      result = await db("SELECT * FROM products");
      res.send(result.data);
    } else {
      res.status(404).send({ error: "Item not found" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});



module.exports = router;
