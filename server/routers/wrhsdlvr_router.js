const express = require('express');
const router = express.Router();
const wrhsdlvrService = require('../services/wrhsdlvr_service');

// 창고 입출고(수불서) 마스터+디테일 검색 (모달용)
router.get('/wrhsdlvr/search', async (req, res) => {
  try {
    const { rsc_ordr_nm, rcvpay_ty, emp_nm, reg_dt } = req.query;
    const result = await wrhsdlvrService.searchWrhsdlvrMasterDetail({ rsc_ordr_nm, rcvpay_ty, emp_nm, reg_dt });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 창고 입출고 단건 마스터+디테일 조회 (ID 기준)
router.get('/wrhsdlvr/:wrhsdlvr_mas_id', async (req, res) => {
  try {
    const masId = req.params.wrhsdlvr_mas_id;
    const result = await wrhsdlvrService.getWrhsdlvrMasterDetailById(masId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
