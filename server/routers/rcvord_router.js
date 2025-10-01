const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const rcvordService = require("../services/rcvord_service.js");

router.get("/rcvords", async (req, res) => {
  let rcvordInfo = req.body;
  let result = await rcvordService
    .rcvordFindAll(rcvordInfo)
    .catch((err) => console.log(err));
  res.send(result);
});

module.exports = router;
