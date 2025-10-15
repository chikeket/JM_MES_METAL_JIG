const express = require("express");
const router = express.Router();
const companyService = require("../services/companyManage_service.js");

router.get("/co_list_view", async (req, res) => {
  console.log("===== 라우터 도착! =====");
  console.log(req.query);
  
  let result = await companyService
    .coListView(req.query)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/coInsert", async (req, res) => {
  let Info = req.body;
  let result = await companyService
    .coInsert(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/coUpdate", async (req, res) => {
  let Info = req.body;
  let result = await companyService
    .coUpdate(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/coDelete", async (req, res) => {
  let Info = req.body;
  let result = await companyService
    .coDelete(Info)
    .catch((err) => console.log(err));
  res.send(result);
});

module.exports = router;