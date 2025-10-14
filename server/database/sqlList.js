// ┌───각 테이블별 SQL 쿼리들을 모아놓은 중앙 관리 파일───┐

// 업체 관련 쿼리
const co = require("./sqls/co.js");

// 업체관리 관련 쿼리 (추가!)
const companyManage = require("./sqls/companyManage.js");

// 생산지시에서 공정관리로 넘어가는 관련 쿼리들
const instructions = require("./sqls/instruction.js");

// 수주 관련 쿼리
const rcvord = require("./sqls/rcvord.js");
// 납품 관련 쿼리
const deli = require("./sqls/deli.js");
// 계정 관련 쿼리
const acct = require("./sqls/acct.js");

// 사원 관련 쿼리
const emp = require("./sqls/emp.js");

// 제품 관련 쿼리
const prdt = require("./sqls/prdt.js");

// 자재 발주 관련 쿼리
const rscOrdr = require("./sqls/rscOrdr.js");

// 자재 관련 쿼리
const rsc = require("./sqls/rsc.js");

// 생산계획 관련 쿼리
const prodPlan = require("./sqls/prodPlan.js");

// 생산지시 관련 쿼리
const prodDrct = require("./sqls/prodDrct.js");

// 자재품질검수 관련 쿼리
const rscQltyInsp = require("./sqls/rscQltyInsp.js");

// 완제품 품질 검수 관련 쿼리
const endPrdtQltyInsp = require("./sqls/endPrdtQltyInsp.js");

// 품질항목 기준정보 관련 쿼리
const qltyItem = require("./sqls/qltyItem.js");

// 창고 입출고 관련 쿼리
const wrhousdlvr = require("./sqls/wrhousdlvr.js");

// 창고 관리 관련 쿼리
const wrhous = require("./sqls/wrhous.js");

// 입출고용 검사서 조회 관련 쿼리
const inspectionForWarehouse = require("./sqls/inspectionForWarehouse.js");

// └───각 테이블별 SQL 쿼리들을 모아놓은 중앙 관리 파일───┘

module.exports = {
  // 스프레드 연산자(...) 를 사용하여 각 파일의 쿼리들을 하나의 객체로 병합
  // 이렇게 하면 모든 쿼리를 하나의 객체에서 별칭으로 접근 가능
  ...instructions,
  ...prdt,
  ...rscOrdr,
  ...co,
  ...companyManage, // 추가!
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
  ...wrhousdlvr,
  ...wrhous,
  ...inspectionForWarehouse,
};
