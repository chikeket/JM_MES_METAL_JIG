const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config({ path: "./dbConfig.env" });

// 미들웨어 등록 영역
// 1. body parser
// content-type : application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// content-type : application/json
app.use(express.json());

// Server 실행
app.listen(3000, () => {
  console.log("Server Start");
  console.log("http://localhost:3000");
});

// 라우팅 등록 영역

const co = require("./routers/co_router.js"); // 업체(테스트 완료 주익이 나중에 쓰면 됨)
const instruction = require("./routers/instruction_router.js");
const rcvord = require("./routers/rcvord_router.js"); // 수주

const prdt = require("./routers/prdt_router.js");

// 기본 라우팅
app.get("/", (req, res) => {
  res.send("Welcome!!");
});

// 라우터 모듈 등록
app.use("/", instruction);
app.use("/", prdt);

app.use("/", co);
app.use("/", rcvord);
