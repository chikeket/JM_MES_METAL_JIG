const express = require("express");
const app = express();
const session = require("express-session");

const dotenv = require("dotenv");
dotenv.config({ path: "./dbConfig.env" });

// 미들웨어 등록 영역
// 1. body parser
// content-type : application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// content-type : application/json
app.use(express.json());

// 세션 미들웨어
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mes-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1시간
  })
);

// Server 실행
app.listen(3000, () => {
  console.log("Server Start");
  console.log("http://localhost:3000");
});

// 라우팅 등록 영역

const wrhsdlvr = require("./routers/wrhsdlvr_router.js");


const co = require("./routers/co_router.js"); // 업체(테스트 완료 주익이 나중에 쓰면 됨)
const companyManage = require("./routers/companyManage_router.js"); // 업체관리 추가!

const prdtManage = require("./routers/prdtManage_router.js"); // 제품관리
const rscManage = require("./routers/rscManage_router.js"); // 자재관리
const qltyItemManage = require("./routers/qltyItemManage_router.js"); // 품질항목관리

const instruction = require("./routers/instruction_router.js"); // 생산지시
const rcvord = require("./routers/rcvord_router.js"); // 수주
const rcvordSearch = require("./routers/rcvordSearch_router.js"); // 수주 조회
const deli = require("./routers/deli_router.js"); // 납품
const deliSearch = require("./routers/deliSearch_router.js"); // 납품 조회
const prcsProgPrecon = require("./routers/prcsProgPrecon.js"); // 공정 진행 현황
const procCtrl = require("./routers/procCtrl.js"); // 공정 제어
const rscOrdr = require("./routers/rscOrdr_router.js"); // 자재 발주
const rscOrdrSearch = require("./routers/rscOrdrSearch_router.js"); // 자재 발주 조회
const prdt = require("./routers/prdt_router.js"); // 제품
const rsc = require("./routers/rsc_router.js"); // 자재
const prodPlan = require("./routers/prodPlan_router.js"); // 생산계획모달관련
const prodDrct = require("./routers/prodDrct_router.js"); // 생산지시모달관련
const auth = require("./routers/auth_router.js"); // 로그인
const rscQltyInsp = require("./routers/rscQltyInsp_router.js"); // 자재품질검수
const endPrdtQltyInsp = require("./routers/endPrdtQltyInsp_router.js"); // 완제품 품질검수
const qltyItem = require("./routers/qltyItem_router.js"); // 품질항목 기준정보
const wrhousdlvr = require("./routers/wrhousdlvr_router.js"); // 창고 입출고
const wrhousManage = require("./routers/wrhousManage_router.js"); // 창고 기준정보 관리
const wrhousZoneManage = require("./routers/wrhousZoneManage_router.js"); // 창고 로케이션 기준정보 관리

const routingInfo = require("./routers/routing_router.js"); // 공정 라우팅
const prcs_Router = require("./routers/prcs_router.js"); // 공정목록 조회
const eqm = require("./routers/eqm_router.js"); // 설비
const semiPrdtQltyInsp = require("./routers/semiPrdtQltyInsp_router.js"); // 반제품 품질검수
const prodPlanManage = require("./routers/prodPlanManage_router.js"); // 생산계획관리 페이지 rud관련
const bomRouter = require('./routers/bom_router');



// 기본 라우팅
app.get("/", (req, res) => {
  res.send("Welcome!!");
});

// 라우터 모듈 등록
app.use("/", instruction);
app.use("/", prdt); // 제품
app.use("/", prdtManage); // 제품관리
app.use("/", rscOrdr); // 자재 발주
app.use("/", rscOrdrSearch); // 자재 발주 조회
app.use("/", co); // 업체
app.use("/", rcvord); // 수주
app.use("/", rcvordSearch); // 수주 조회
app.use("/", deli); // 납품
app.use("/", deliSearch); // 납품 조회
app.use("/", prcsProgPrecon); // 공정 진행 현황
app.use("/", procCtrl); // 공정 제어
app.use("/", rsc); // 자재
app.use("/", rscManage); // 자재관리
app.use("/", prodPlan); // 생산계획
app.use("/", prodDrct); // 생산지시
app.use("/", auth); // 로그인
app.use("/", rscQltyInsp); // 자재품질검수
app.use("/", endPrdtQltyInsp); // 완제품 품질검수
app.use("/", qltyItem); // 품질항목 기준정보
app.use("/", qltyItemManage); // 품질항목관리
app.use("/", companyManage); // 업체관리 추가!
app.use("/", wrhousdlvr); // 창고 입출고

app.use("/", wrhousManage); // 창고 기준정보 관리
app.use("/", wrhousZoneManage); // 창고 로케이션 기준정보 관리

app.use("/", eqm); // 설비
app.use("/", routingInfo); // 공정 라우팅
app.use("/api", prcs_Router); // 공정목록 조회
app.use("/", semiPrdtQltyInsp); // 반제품 품질검수
app.use("/", prodPlanManage); // 생산계획관리 rud관련
app.use('/', bomRouter); // BOM 관리
app.use("/", wrhsdlvr);