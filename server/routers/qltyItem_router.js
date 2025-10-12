const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const service = require("../services/qltyItem_service.js");

//자재 품질항목리스트 열람
router.get("/rscQltyDeta", async (req, res) => {
    let result = await service
        .rscQltyDetaData(req.query)
        .catch((err) => console.log(err));
    res.send(result);
});

//제품 품질항목리스트 열람
router.get("/waitingPrdtQltyDeta", async (req, res) => {
    // console.log("클라에서온값");
    // console.log(req.query);
    // req.query;
    let prdtList = await service
        .waitingPrdtQltyDeta(req.query)
        .catch((err) => console.log(err));
    // console.log("클라로갈값");
    // console.log(prdtList);
    res.send(prdtList);
    // res.json(prdtList);
});

module.exports = router;