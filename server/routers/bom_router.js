const express = require('express');
const router = express.Router();
const bomService = require('../services/bom_service');

// 제품명으로 제품ID 반환 (서비스 계층 분리)
router.get('/product_id_by_name', async (req, res) => {
  try {
    const { prdt_nm } = req.query;
    if (!prdt_nm) return res.json({ prdt_id: '' });
    const prdt_id = await bomService.getPrdtIdByName(prdt_nm);
    res.json({ prdt_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 옵션명으로 옵션ID 반환 (서비스 계층 분리)
router.get('/option_id_by_name', async (req, res) => {
  try {
    const { opt_nm } = req.query;
    if (!opt_nm) return res.json({ opt_id: '' });
    const opt_id = await bomService.getOptIdByName(opt_nm);
    res.json({ opt_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BOM 마스터 전체/조건 조회 (이름 그대로 전달, 파라미터 누락 방지)
router.get('/bom/master', async (req, res) => {
  try {
    const productName = req.query.productName || '';
    const optionName = req.query.optionName || '';
    const status = req.query.status || '';
    const list = await bomService.getBomMasterList({ productName, optionName, status });
    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ message: 'BOM 마스터 조회 오류', error: err.message });
  }
});

// BOM 마스터 단건 조회 (필요시)
router.get('/bom/master/:bom_id', async (req, res) => {
  try {
    const row = await bomService.getBomMasterById(req.params.bom_id);
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ message: 'BOM 마스터 단건 조회 오류', error: err.message });
  }
});

// BOM 마스터 신규
router.post('/bom/master', async (req, res) => {
  try {
    console.log('📦 [BOM 등록] req.body:', JSON.stringify(req.body, null, 2));
    const bom_id = await bomService.insertBomMaster(req.body);
    res.json({ bom_id });
  } catch (err) {
    res.status(500).json({ message: 'BOM 마스터 등록 오류', error: err.message });
  }
});

// BOM 마스터 수정
router.put('/bom/master/:bom_id', async (req, res) => {
  try {
    await bomService.updateBomMaster(req.params.bom_id, req.body);
    res.json({ bom_id: req.params.bom_id });
  } catch (err) {
    res.status(500).json({ message: 'BOM 마스터 수정 오류', error: err.message });
  }
});

// BOM 마스터 삭제
router.delete('/bom/master/:bom_id', async (req, res) => {
  try {
    await bomService.deleteBomMaster(req.params.bom_id);
    res.json({ bom_id: req.params.bom_id });
  } catch (err) {
    res.status(500).json({ message: 'BOM 마스터 삭제 오류', error: err.message });
  }
});

// BOM 디테일 전체/조건 조회
router.get('/bom/detail', async (req, res) => {
  try {
    const { bom_id = '' } = req.query;
    const list = await bomService.getBomDetailList({ bom_id });
    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ message: 'BOM 디테일 조회 오류', error: err.message });
  }
});

// BOM 디테일 단건 조회 (필요시)
router.get('/bom/detail/:bom_comp_id', async (req, res) => {
  try {
    const row = await bomService.getBomDetailById(req.params.bom_comp_id);
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ message: 'BOM 디테일 단건 조회 오류', error: err.message });
  }
});

// BOM 디테일 신규
router.post('/bom/detail', async (req, res) => {
  try {
    const bom_comp_id = await bomService.insertBomDetail(req.body);
    res.json({ bom_comp_id });
  } catch (err) {
    res.status(500).json({ message: 'BOM 디테일 등록 오류', error: err.message });
  }
});

// BOM 디테일 수정
router.put('/bom/detail/:bom_comp_id', async (req, res) => {
  try {
    await bomService.updateBomDetail(req.params.bom_comp_id, req.body);
    res.json({ bom_comp_id: req.params.bom_comp_id });
  } catch (err) {
    res.status(500).json({ message: 'BOM 디테일 수정 오류', error: err.message });
  }
});

// BOM 디테일 삭제
router.delete('/bom/detail/:bom_comp_id', async (req, res) => {
  try {
    await bomService.deleteBomDetail(req.params.bom_comp_id);
    res.json({ bom_comp_id: req.params.bom_comp_id });
  } catch (err) {
    res.status(500).json({ message: 'BOM 디테일 삭제 오류', error: err.message });
  }
});

module.exports = router;
