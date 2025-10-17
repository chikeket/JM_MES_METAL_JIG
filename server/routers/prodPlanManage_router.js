const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const service = require("../services/prodPlanManage_service.js");

router.post("/insertProdPlanManage", async (req, res) => {
  let Info = req.body;
  // console.log(metalInfo);
  let result = await service
    .addNewProdPlanManage(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/updateProdPlanManage", async (req, res) => {
  let Info = req.body;
  // console.log(metalInfo);
  let result = await service
    .updateProdPlanManage(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/deleteProdPlanManage", async (req, res) => {
  let Info = req.body;
  // console.log(metalInfo);
  let result = await service
    .deleteProdPlanManage(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

module.exports = router;
