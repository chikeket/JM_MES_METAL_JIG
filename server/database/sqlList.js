// ┌───각 테이블 별로 실행한 SQL문을 별도 파일로 작성───┐

//업체
const co = require("./sqls/co.js");

//생산지시에서 공정관리 넘어가는것들 관련
const instructions = require("./sqls/instruction.js");

// 수주
const rcvord = require("./sqls/rcvord.js");
// 납품
const deli = require("./sqls/deli.js");
// 계정
const acct = require("./sqls/acct.js");

// 사원
const emp = require("./sqls/emp.js");

//제품
const prdt = require("./sqls/prdt.js");

// 자재 발주
const rscOrdr = require("./sqls/rscOrdr.js");

// 자재
const rsc = require("./sqls/rsc.js");

// 생산계획
const prodPlan = require("./sqls/prodPlan.js");

// 생산지시
const prodDrct = require("./sqls/prodDrct.js");

// 자재품질검수
const rscQltyInsp = require("./sqls/rscQltyInsp.js");

// 완제품 품질 검수
const endPrdtQltyInsp = require("./sqls/endPrdtQltyInsp.js");

// 품질항목 기준정보
const qltyItem = require("./sqls/qltyItem.js");

// └───각 테이블 별로 실행한 SQL문을 별도 파일로 작성───┘

module.exports = {
  // 펼침연산자(spread operator, ...)을 활용해 객체의 필드를 다른 객체로 쉽게 복사
  ...instructions,
  ...prdt,
  ...rscOrdr,
  ...co,
  ...rcvord,
  ...emp,
  ...acct,
  ...rsc,
  ...prodPlan,
  ...prodDrct,
  ...rscQltyInsp,
  ...endPrdtQltyInsp,
  ...deli,
  ...qltyItem,

};
