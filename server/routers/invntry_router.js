const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

router.get('/lot-status', async (req, res) => {
  try {
    const {
      item_type, rsc_id, prdt_id, prdt_opt_id,
      whous_id, zone_id, lot_no, only_positive,
      page = 1, pageSize = 20, orderBy = 'last_tr_dt DESC'
    } = req.query;

    const result = await inventoryService.getLotStatus({
      item_type,
      rsc_id,
      prdt_id,
      prdt_opt_id,
      whous_id,
      zone_id,
      lot_no,
      only_positive: only_positive === '1' || only_positive === 1,
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy
    });

    res.json(result);
  } catch (err) {
    console.error('[inventory_router] /lot-status error:', err);
    res.status(500).json({ message: 'failed to load lot status', error: String(err) });
  }
});

router.get('/invntry/wh-transactions', async (req, res) => {
  try {
    const {
      from_dt, to_dt, rcvpay_ty,
      rsc_id, prdt_id, prdt_opt_id,
      whous_id, zone_id, lot_no, keyword,
      page = 1, pageSize = 20, orderBy = 'm.RCVPAY_DT DESC, d.WRHOUS_WRHSDLVR_ID DESC'
    } = req.query;

    const result = await inventoryService.getWarehouseTransactions({
      from_dt,
      to_dt,
      rcvpay_ty,
      rsc_id,
      prdt_id,
      prdt_opt_id,
      whous_id,
      zone_id,
      lot_no,
      keyword,
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy
    });

    res.json(result);
  } catch (err) {
    console.error('[inventory_router] /wh-transactions error:', err);
    res.status(500).json({ message: 'failed to load transactions', error: String(err) });
  }
});

module.exports = router;