const express = require("express");
const app = express();
const cors = require("cors");
const testRoute = require("./routers/test");
const authRoute = require("./routers/auth");
const stepsRoute = require("./routers/steps");
const userRoute = require("./routers/user");

require("dotenv").config();

const PORT = 5000;

//corsはフロントのlocalhostとlocalhost:5000間のアクセスを許可する(クロスオリジンポリシー)
app.use(cors());
app.use(express.json());
app.use("/api/test", testRoute);
app.use("/api/auth", authRoute);
app.use("/api/steps", stepsRoute);
app.use("/api/user", userRoute);

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
