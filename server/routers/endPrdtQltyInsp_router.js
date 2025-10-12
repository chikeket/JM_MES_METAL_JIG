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

//제품 품질검사 열람
router.get("/endPrdtQltyInspSearch", async (req, res) => {
    // console.log("클라에서온값");
    // console.log(req.query);
    // req.query;
    let prdtList = await Service
        .endPrdtQltyInspSearch(req.query)
        .catch((err) => console.log(err));
    // console.log("클라로갈값");
    // console.log(prdtList);
    res.send(prdtList);
    // res.json(prdtList);
});

router.post("/endPrdtQltyInspInsert", async (req, res) => {
    let Info = req.body;
    let result = await Service
        .endPrdtQltyInspInsert(Info)
        .catch((err) => console.log(err));
    res.send(result);
});

router.post("/endPrdtQltyInspUpdate", async (req, res) => {
    let Info = req.body;
    let result = await Service
        .endPrdtQltyInspUpdate(Info)
        .catch((err) => console.log(err));
    res.send(result);
});

router.post("/endPrdtQltyInspDelete", async (req, res) => {
    let Info = req.body;
    let result = await Service
        .endPrdtQltyInspDelete(Info)
        .catch((err) => console.log(err));
    res.send(result);
});

module.exports = router;
