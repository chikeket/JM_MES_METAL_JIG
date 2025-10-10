const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const rscOrdrService = require("../services/rscQltyInsp_service.js");

router.get("/rscOrdrDeta", async (req, res) => {
  let result = await rscOrdrService
    .rscQltyDetaData(req.query)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/rscQltyInspInsert", async (req, res) => {
  let Info = req.body;
  let result = await rscOrdrService
    .rscQltyInspInsert(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.get("/rscQltyInspSelect", async (req, res) => {
  let result = await rscOrdrService
    .rscQltyInspSelect(req.query)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/rscQltyInspUpdate", async (req, res) => {
  let Info = req.body;
  let result = await rscOrdrService
    .rscQltyInspUpdate(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/rscQltyInspDelete", async (req, res) => {
  let Info = req.body;
  let result = await rscOrdrService
    .rscQltyInspDelete(Info)
    .catch((err) => console.log(err));
  res.send(result);
});
module.exports = router;
