const express = require("express");
const router = express.Router();
const prdtService = require("../services/prdtManage_service.js");

router.get("/api/prdt_list_view", async (req, res) => {
  console.log("===== 제품 조회 라우터 도착! =====");
  console.log(req.query);
  
  let result = await prdtService
    .prdtListView(req.query)
    .catch((err) => console.log(err));
  res.send(result);
});

router.get("/api/prdt_option_list", async (req, res) => {
  console.log("===== 제품 옵션 조회 라우터 도착! =====");
  console.log(req.query);
  
  let result = await prdtService
    .prdtOptionList(req.query)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/api/prdtDelete", async (req, res) => {
  let Info = req.body;
  let result = await prdtService
    .prdtDelete(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

module.exports = router;