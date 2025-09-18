const express = require("express");
const app = express();
const cors = require("cors");
const authRoute = require("./routers/auth");
const stepsRoute = require("./routers/steps");
const battleRoute = require("./routers/battle");
const rankingRoute = require("./routers/ranking");

require("dotenv").config();

const PORT = 5000;

//corsはフロントのlocalhostとlocalhost:5000間のアクセスを許可する(クロスオリジンポリシー)
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/steps", stepsRoute);
app.use("/api/battle", battleRoute);
app.use("/api/ranking", rankingRoute);

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
