// LOT 재고 현황 테이블 관련 SQL
const insertLotStcPrecon = `
    INSERT INTO LOT_STC_PRECON (
      LOT_INVNTRY_PRECON_ID,
      WRHSDLVR_MAS_ID,
      IST_QY,
      OUST_QY,
      NOW_STC_QY,
      RM
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

const selectMasByLotNo = `
SELECT DISTINCT l.wrhsdlvr_mas_id
FROM lot_stc_precon l JOIN wrhous_wrhsdlvr_mas w ON l.WRHSDLVR_MAS_ID = w.WRHSDLVR_MAS_ID
WHERE w.lot_no = ?
ORDER BY SUBSTR(l.WRHSDLVR_MAS_ID,-7) DESC
`;

const updateLotStcPreconOnOut = `
    UPDATE LOT_STC_PRECON
  SET OUST_QY = OUST_QY + ?, NOW_STC_QY = IST_QY - OUST_QY
  WHERE wrhsdlvr_mas_id = ?;
`;

const selectLotStcPreconById = `
    SELECT * FROM LOT_STC_PRECON WHERE LOT_INVNTRY_PRECON_ID = ?
`;

const createLotId = `
SELECT CONCAT('LOT_STC_', DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(LOT_INVNTRY_PRECON_ID, -3)), 0) + 1, 3, '0')) "txn_id"
FROM LOT_STC_PRECON
WHERE LOT_INVNTRY_PRECON_ID LIKE CONCAT('LOT_STC_', DATE_FORMAT(NOW(), '%y%m'), '%')
`;


// LOT별 자재 재고 현황 조회 쿼리
const selectLotRscStockByMasId = `
SELECT 
  wm.LOT_NO AS lot_no,
  lsp.NOW_STC_QY AS now_stock,
  lsp.WRHSDLVR_MAS_ID,
  wm.RSC_ID,
  r.RSC_NM AS item_name,
  wm.WRHOUS_ID,
  wm.ZONE_ID
FROM LOT_STC_PRECON lsp
JOIN WRHOUS_WRHSDLVR_MAS wm ON lsp.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID
LEFT JOIN RSC r ON wm.RSC_ID = r.RSC_ID
WHERE lsp.WRHSDLVR_MAS_ID = ?
ORDER BY wm.LOT_NO ASC
`;

module.exports = {
  selectMasByLotNo,
  insertLotStcPrecon,
  updateLotStcPreconOnOut,
  selectLotStcPreconById,
  createLotId,
  selectLotRscStockByMasId,
};

