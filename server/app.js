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

const instruction = require("./routers/instruction_router.js"); // 생산지시

const rcvord = require("./routers/rcvord_router.js"); // 수주
const rscOrdr = require("./routers/rscOrdr_router.js"); // 자재 발주

const prdt = require("./routers/prdt_router.js"); // 제품
const rsc = require("./routers/rsc_router.js"); // 자재
const prodPlan = require("./routers/prodPlan_router.js"); // 생산계획
const prodDrct = require("./routers/prodDrct_router.js"); // 생산지시

// 기본 라우팅
app.get("/", (req, res) => {
  res.send("Welcome!!");
});

// 라우터 모듈 등록
app.use("/", instruction);
app.use("/", prdt); // 제품
app.use("/", rscOrdr); // 자재 발주
app.use("/", co); // 업체
app.use("/", rcvord); // 수주
app.use("/", rsc); // 자재
app.use("/", prodPlan); // 생산계획
app.use("/", prodDrct); // 생산지시
