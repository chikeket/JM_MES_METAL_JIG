const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const prdtService = require("../services/prdt_service.js");

router.get("/prdts", async (req, res) => {
  let prdtList = await prdtService
    .prdtfindAll()
    .catch((err) => console.log(err));

  res.send(prdtList);
  // res.json(prdtList);
});

module.exports = router;
