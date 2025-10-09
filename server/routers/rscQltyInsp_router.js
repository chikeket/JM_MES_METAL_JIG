const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const rscOrdrService = require("../services/rscQltyInsp_service.js");

router.post("/rscQltyInspInsert", async (req, res) => {
  let Info = req.body;
  let result = await rscOrdrService
    .rscQltyInspInsert(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.get("/rscQltyInspSelect", async (req, res) => {
  let result = await rscOrdrService
    .coFindAll(req.query)
    .catch((err) => console.log(err));
  res.send(result);
});
module.exports = router;
