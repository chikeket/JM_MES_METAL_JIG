const express = require("express");
const router = express.Router();
const rscManageService = require("../services/rscManage_service.js");

router.get("/rsc_list_view", async (req, res) => {
  console.log("===== 자재 라우터 도착! =====");
  console.log(req.query);
  
  try {
    let rscList = await rscManageService.getRscList(req.query);
    console.log("✅ 조회 결과:", rscList.length, "건");
    res.json(rscList);
  } catch (err) {
    console.error("❌ 자재 조회 오류:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

router.post("/rscInsert", async (req, res) => {
  let Info = req.body;
  let result = await rscManageService
    .insertRsc(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/rscUpdate", async (req, res) => {
  let Info = req.body;
  let result = await rscManageService
    .updateRsc(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/rscDelete", async (req, res) => {
  let Info = req.body;
  let result = await rscManageService
    .deleteRsc(Info.rsc_id)
    .catch((err) => console.log(err));
  res.send(result);
});

module.exports = router;