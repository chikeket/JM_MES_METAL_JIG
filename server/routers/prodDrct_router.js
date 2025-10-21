const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리 :jhg
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const prodDrctService = require("../services/prodDrct_service.js");

router.get("/prodDrctSearch", async (req, res) => {
  console.log("클라에서온값");
  console.log(req.query);
  // req.query;
  let prdtList = await prodDrctService
    .prodDrctfindAll(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

router.get("/prodDrctDetaSearch", async (req, res) => {
  console.log("클라에서온값");
  console.log(req.query);
  // req.query;
  let prdtList = await prodDrctService
    .prodDrctDetafindAll(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

router.get("/prodDrctBoardListSearch", async (req, res) => {
  console.log("생산지시 조회페이지 다중검색쿼리");
  console.log(req.query);
  // req.query;
  let prdtList = await prodDrctService
    .prodDrctBoardListSearch(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

module.exports = router;
