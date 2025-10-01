// ┌───각 테이블 별로 실행한 SQL문을 별도 파일로 작성───┐

//업체
const co = require("./sqls/co.js");

//생산지시
const instructions = require("./sqls/instruction.js");

//수주
const rcvord = require("./sqls/rcvord.js");

//제품
const prdt = require("./sqls/prdt.js");

// └───각 테이블 별로 실행한 SQL문을 별도 파일로 작성───┘

module.exports = {
  // 펼침연산자(spread operator, ...)을 활용해 객체의 필드를 다른 객체로 쉽게 복사
  ...instructions,
  ...prdt,
  ...co,
  ...rcvord,
};
