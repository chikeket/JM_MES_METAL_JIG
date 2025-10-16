const express = require("express");
const router = express.Router();
const qltyItemService = require("../services/qltyItemManage_service.js");

router.get("/qlty_item_list_view", async (req, res) => {
  console.log("===== 품질항목 라우터 도착! =====");
  console.log(req.query);
  
  try {
    let list = await qltyItemService.getQltyItemList(req.query);
    console.log("✅ 조회 결과:", list.length, "건");
    res.json(list);
  } catch (err) {
    console.error("❌ 품질항목 조회 오류:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

router.post("/qltyItemInsert", async (req, res) => {
  let Info = req.body;
  let result = await qltyItemService
    .insertQltyItem(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/qltyItemUpdate", async (req, res) => {
  let Info = req.body;
  let result = await qltyItemService
    .updateQltyItem(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/qltyItemDelete", async (req, res) => {
  let Info = req.body;
  let result = await qltyItemService
    .deleteQltyItem(Info.qlty_item_id)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/qltyItemUpdate", async (req, res) => {
  let Info = req.body;
  console.log("🔍 UPDATE 요청 데이터:", JSON.stringify(Info, null, 2));
  console.log("ID 값:", Info.qlty_item_mng_id);
  console.log("original ID:", Info.original_qlty_item_mng_id);
  let result = await qltyItemService
    .updateQltyItem(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

module.exports = router;