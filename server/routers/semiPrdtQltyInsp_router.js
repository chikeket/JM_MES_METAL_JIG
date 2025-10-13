const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리 :jhg
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const Service = require("../services/semiPrdtQltyInsp_service.js");

//반제품 생산실적조회
router.get("/waitingSemiPrdt", async (req, res) => {
  // console.log("클라에서온값");
  // console.log(req.query);
  // req.query;
  let prdtList = await Service.waitingSemiPrdt(req.query).catch((err) =>
    console.log(err)
  );
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

//반제품 품질검사 열람
router.get("/semiPrdtQltyInspSearch", async (req, res) => {
  // console.log("클라에서온값");
  // console.log(req.query);
  // req.query;
  let prdtList = await Service.semiPrdtQltyInspSearch(req.query).catch((err) =>
    console.log(err)
  );
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

router.post("/semiPrdtQltyInspInsert", async (req, res) => {
  let Info = req.body;
  let result = await Service.semiPrdtQltyInspInsert(Info).catch((err) =>
    console.log(err)
  );
  res.send(result);
});

router.post("/semiPrdtQltyInspUpdate", async (req, res) => {
  let Info = req.body;
  let result = await Service.semiPrdtQltyInspUpdate(Info).catch((err) =>
    console.log(err)
  );
  res.send(result);
});

router.post("/semiPrdtQltyInspDelete", async (req, res) => {
  let Info = req.body;
  let result = await Service.semiPrdtQltyInspDelete(Info).catch((err) =>
    console.log(err)
  );
  res.send(result);
});

module.exports = router;
