const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config({ path: "./dbConfig.env" });

let contextPath = "/";
if (process.argv.length > 2 && process.argv[2] === "prod") {
  // 운영 환경일 때
  contextPath = "/api";
} else {
  console.log(process.argv);
}
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
const eqm = require("./routers/eqm_router.js"); // 설비
const semiPrdtQltyInsp = require("./routers/semiPrdtQltyInsp_router.js"); // 반제품 품질검수
const prodPlanManage = require("./routers/prodPlanManage_router.js"); // 생산계획관리 페이지 rud관련
const bomRouter = require("./routers/bom_router"); // BOM 관리

// 배포 관련 미들웨어
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// 기본 라우팅
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

// 라우터 모듈 등록
app.use(contextPath, instruction);
app.use(contextPath, prdt); // 제품
app.use(contextPath, prdtManage); // 제품관리
app.use(contextPath, rscOrdr); // 자재 발주
app.use(contextPath, rscOrdrSearch); // 자재 발주 조회
app.use(contextPath, co); // 업체
app.use(contextPath, rcvord); // 수주
app.use(contextPath, rcvordSearch); // 수주 조회
app.use(contextPath, deli); // 납품
app.use(contextPath, deliSearch); // 납품 조회
app.use(contextPath, prcsProgPrecon); // 공정 진행 현황
app.use(contextPath, procCtrl); // 공정 제어
app.use(contextPath, rsc); // 자재
app.use(contextPath, rscManage); // 자재관리
app.use(contextPath, prodPlan); // 생산계획
app.use(contextPath, prodDrct); // 생산지시
app.use(contextPath, auth); // 로그인
app.use(contextPath, rscQltyInsp); // 자재품질검수
app.use(contextPath, endPrdtQltyInsp); // 완제품 품질검수
app.use(contextPath, qltyItem); // 품질항목 기준정보
app.use(contextPath, qltyItemManage); // 품질항목관리
app.use(contextPath, companyManage); // 업체관리 추가!
app.use(contextPath, wrhousdlvr); // 창고 입출고
app.use(contextPath, wrhousManage); // 창고 기준정보 관리
app.use(contextPath, wrhousZoneManage); // 창고 로케이션 기준정보 관리
app.use(contextPath, eqm); // 설비
app.use(contextPath, routingInfo); // 공정 라우팅
app.use(contextPath, semiPrdtQltyInsp); // 반제품 품질검수
app.use(contextPath, prodPlanManage); // 생산계획관리 rud관련
app.use(contextPath, bomRouter); // BOM 관리

// 라우팅 아니고 미들웨어 (에러 처리용)
// 위쪽에서 처리가 안되는건 다 이쪽에서 처리되게
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "./public", "index.html"));
});
