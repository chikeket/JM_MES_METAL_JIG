const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const rscService = require("../services/rsc_service.js");

router.get("/rscs", async (req, res) => {
  let rscList = await rscService
    .rscfindAll(req.query)
    .catch((err) => console.log(err));

  res.send(rscList);
});

module.exports = router;
