const express = require("express");
require("dotenv").config({ path: "./config.env" });
const dbo = require("./db/conn");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on port: ${port}`);
});

app.use(express.json());
app.use(cookieParser());

app.use(cors(({ 
  origin: ['http://localhost:3000'], 
  credentials: true 
})));

app.use(require("./routes/user-router.js"));
app.use(require("./routes/products-router.js"));
app.use(require("./routes/cart-router.js"));
app.use(require("./routes/admin-router.js"));
app.use(require("./routes/seller-router.js"));
app.use(require("./routes/courier-router.js"));
