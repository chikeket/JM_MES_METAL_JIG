// 자재 불출 대상 테이블 관련 SQL
const  insertRwmatrRtunTrget = `
    INSERT INTO RWMATR_RTUN_TRGET (
      RSC_RTUN_TRGET_ID,
      PROD_DRCT_DETA_ID,
      PRDT_ID,
      PRDT_OPT_ID,
      PROD_EXPC_QY,
      inpt_st,
      RM
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const updateRwmatrRtunTrgetQty = `
    UPDATE RWMATR_RTUN_TRGET
    SET PROD_EXPC_QY = ?
    WHERE RSC_RTUN_TRGET_ID = ?
  `;

  const selectRwmatrRtunTrgetSumQtyByProdDrctDetaId = `
    SELECT SUM(PROD_EXPC_QY) AS total_qty
    FROM RWMATR_RTUN_TRGET
    WHERE PROD_DRCT_DETA_ID = ?
  `;

  const selectRwmatrRtunTrgetById = `
    SELECT * FROM RWMATR_RTUN_TRGET WHERE RSC_RTUN_TRGET_ID = ?
  `;

  const createRwmatrRtunTrgetId = `
    SELECT CONCAT('RSC_RTUN_', DATE_FORMAT(NOW(), '%y%m'),
      LPAD(IFNULL(MAX(SUBSTR(RSC_RTUN_TRGET_ID, -4)), 0) + 1, 4, '0')) "txn_id"
    FROM RWMATR_RTUN_TRGET
    WHERE RSC_RTUN_TRGET_ID LIKE CONCAT('RSC_RTUN_', DATE_FORMAT(NOW(), '%y%m'), '%')
    `;

module.exports = {
  insertRwmatrRtunTrget,
  updateRwmatrRtunTrgetQty,
  selectRwmatrRtunTrgetSumQtyByProdDrctDetaId,
  selectRwmatrRtunTrgetById,
  createRwmatrRtunTrgetId,
};
