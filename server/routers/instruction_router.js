const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const instructionService = require("../services/instruction_service.js");

router.post("/instruction", async (req, res) => {
  let metalInfo = req.body;
  // console.log(metalInfo);
  let result = await instructionService
    .addNewInstruction(metalInfo)
    .catch((err) => console.log(err));
  res.send(result);
});

router.post("/instructionDeta", async (req, res) => {
  let metalInfo = req.body;
  // console.log(metalInfo)
  let result = await instructionService
    .addNewInstructionDeta(metalInfo)
    .catch((err) => console.log(err));
  res.send(result);
});

module.exports = router;
