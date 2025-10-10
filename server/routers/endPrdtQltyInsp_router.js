const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리 :jhg
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const Service = require("../services/endPrdtQltyInsp_service.js");

//완제품 생산실적조회
router.get("/waitingFinishedPrdt", async (req, res) => {
    // console.log("클라에서온값");
    // console.log(req.query);
    // req.query;
    let prdtList = await Service
        .waitingFinishedPrdt(req.query)
        .catch((err) => console.log(err));
    // console.log("클라로갈값");
    // console.log(prdtList);
    res.send(prdtList);
    // res.json(prdtList);
});

//완제품 품질상세리스트 열람
router.get("/waitingEndPrdtQltyDeta", async (req, res) => {
    // console.log("클라에서온값");
    // console.log(req.query);
    // req.query;
    let prdtList = await Service
        .waitingEndPrdtQltyDeta(req.query)
        .catch((err) => console.log(err));
    // console.log("클라로갈값");
    // console.log(prdtList);
    res.send(prdtList);
    // res.json(prdtList);
});

module.exports = router;
