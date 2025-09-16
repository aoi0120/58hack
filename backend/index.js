const express = require("express");
const app = express();
const cors = require("cors");
const testRoute = require("./routers/test");

require("dotenv").config();

const PORT = 5000;

//corsはフロントのlocalhostとlocalhost:5000間のアクセスを許可する(クロスオリジンポリシー)
app.use(cors());
app.use(express.json());
app.use("/api/test", testRoute);

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
