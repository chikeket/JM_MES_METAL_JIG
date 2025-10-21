const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리 :jhg
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const prodPlanService = require("../services/prodPlan_service.js");

router.get("/prodPlanSearch", async (req, res) => {
  console.log("클라에서온값");
  console.log(req.query);
  // req.query;
  let prdtList = await prodPlanService
    .prodPlanfindAll(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

router.get("/prodPlanDetaSearch", async (req, res) => {
  console.log("클라에서온값");
  console.log(req.query);
  // req.query;
  let prdtList = await prodPlanService
    .prodPlanDetafindAll(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

router.get("/prodPlanRcvordMasterSearch", async (req, res) => {
  console.log("생산계획관리페이지 수주서모달에서 조회할때 쓰는 라우터");
  console.log(req.query);
  // req.query;
  let prdtList = await prodPlanService
    .prodPlanRcvordMasterSearch(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

router.get("/prodPlanRcvordDetaSearch", async (req, res) => {
  console.log(
    "생산계획관리페이지 수주서모달에서 수주서상세 조회할때 쓰는 라우터"
  );
  console.log(req.query);
  // req.query;
  let prdtList = await prodPlanService
    .prodPlanRcvordDetaSearch(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

router.get("/prodPlanRealMasterSearch", async (req, res) => {
  console.log("생산계획관리페이지 생산계획서모달에서 조회할때 쓰는 라우터");
  console.log(req.query);
  // req.query;
  let prdtList = await prodPlanService
    .prodPlanRealMasterSearch(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

router.get("/prodPlanRealDetaSearch", async (req, res) => {
  console.log(
    "생산계획관리페이지 생산계획서모달에서 생산계획서 상세 조회할때 쓰는 라우터"
  );
  console.log(req.query);
  // req.query;
  let prdtList = await prodPlanService
    .prodPlanRealDetaSearch(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});

router.get("/prodPlanBoardListSearch", async (req, res) => {
  console.log("생산계획 조회페이지 다중검색쿼리");
  console.log(req.query);
  // req.query;
  let prdtList = await prodPlanService
    .prodPlanBoardListSearch(req.query)
    .catch((err) => console.log(err));
  // console.log("클라로갈값");
  // console.log(prdtList);
  res.send(prdtList);
  // res.json(prdtList);
});
module.exports = router;
