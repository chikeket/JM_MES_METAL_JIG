const express = require("express");
const router = express.Router();
const prdtManageService = require("../services/prdtManage_service.js");

router.get("/prdt_list_view", async (req, res) => {
  console.log("===== 제품 라우터 도착! =====");
  console.log(req.query);
  
  try {
    let prdtList = await prdtManageService.getPrdtList(req.query);
    console.log("조회 결과:", prdtList.length, "건");
    res.json(prdtList);
  } catch (err) {
    console.error("제품 조회 오류:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

router.get("/prdt_option_list", async (req, res) => {
  try {
    const { prdt_id } = req.query;
    console.log("옵션 조회:", prdt_id);
    let options = await prdtManageService.getPrdtOptions(prdt_id);
    res.json(options);
  } catch (err) {
    console.error("옵션 조회 오류:", err);
    res.status(500).json({ error: "옵션 조회 실패" });
  }
});

router.post("/prdtInsert", async (req, res) => {
  let Info = req.body;
  let result = await prdtManageService
    .insertPrdt(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/prdtUpdate", async (req, res) => {
  let Info = req.body;
  let result = await prdtManageService
    .updatePrdt(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/prdtDelete", async (req, res) => {
  let Info = req.body;
  let result = await prdtManageService
    .deletePrdt(Info.prdt_id)
    .catch((err) => console.log(err));
  res.send(result);
});

module.exports = router;