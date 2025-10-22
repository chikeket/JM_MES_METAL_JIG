const wrh_ext_available_fg_stock = `
    SELECT SUM(l.NOW_STC_QY) AS stock_qty
    FROM LOT_STC_PRECON l
    JOIN WRHOUS_WRHSDLVR_MAS m ON m.WRHSDLVR_MAS_ID = l.WRHSDLVR_MAS_ID
    WHERE m.PRDT_ID = ?
      AND ( (? IS NULL AND m.PRDT_OPT_ID IS NULL) OR m.PRDT_OPT_ID = ? )
  `;

  // 유효 BOM 1건
  const wrh_ext_select_active_bom_id = `
    SELECT b.BOM_ID
    FROM BOM b
    WHERE b.PRDT_ID = ?
      AND ( (? IS NULL AND b.PRDT_OPT_ID IS NULL) OR b.PRDT_OPT_ID = ? )
      AND CURRENT_DATE() BETWEEN b.VALID_FR_DT AND COALESCE(b.VALID_TO_DT, '9999-12-31')
      AND b.ST = 'P1'
    ORDER BY b.VALID_FR_DT DESC
    LIMIT 1
  `;

  // 1개 생산 시 자재 요구량
  const wrh_ext_required_per_unit_by_bom = `
    SELECT bd.RSC_ID, SUM(bd.REC_QY) AS REC_QY_PER_UNIT
    FROM BOM_DETA bd
    WHERE bd.BOM_ID = ?
    GROUP BY bd.RSC_ID
  `;

  // BOM에 포함된 자재만 대상으로 현재 재고(LOT 합계)
  const wrh_ext_stock_by_bom_rscs = `
    SELECT bd.RSC_ID, COALESCE(SUM(l.NOW_STC_QY),0) AS STOCK_QY
    FROM BOM_DETA bd
    LEFT JOIN WRHOUS_WRHSDLVR_MAS m ON m.RSC_ID = bd.RSC_ID
    LEFT JOIN LOT_STC_PRECON l ON l.WRHSDLVR_MAS_ID = m.WRHSDLVR_MAS_ID
    WHERE bd.BOM_ID = ?
    GROUP BY bd.RSC_ID
  `;

  // 자재별 LOT 목록 잠금(FIFO 정렬)
  const wrh_ext_lots_for_rsc_for_update = `
    SELECT m.RSC_ID, l.LOT_INVNTRY_PRECON_ID, l.NOW_STC_QY, m.LOT_NO
    FROM LOT_STC_PRECON l
    JOIN WRHOUS_WRHSDLVR_MAS m ON m.WRHSDLVR_MAS_ID = l.WRHSDLVR_MAS_ID
    WHERE m.RSC_ID = ?
    ORDER BY m.RCVPAY_DT, l.LOT_INVNTRY_PRECON_ID
    FOR UPDATE
  `;

  // 출고 마스터 생성(자재 단위 1:1)
  const wrh_ext_insert_mas_outbound = `
    INSERT INTO WRHOUS_WRHSDLVR_MAS
      (WRHSDLVR_MAS_ID, RCVPAY_TY, EMP_ID, RSC_ID, WHOUS_ID, ZONE_ID, LOT_NO, ALL_RCVPAY_QY, RCVPAY_DT, RM)
    VALUES (?,?,?,?,?,?,?, ?, CURRENT_DATE(), '')
  `;

  // 출고 디테일 생성(1:1)
  const wrh_ext_insert_deta_outbound = `
    INSERT INTO WRHOUS_WRHSDLVR
      (WRHOUS_WRHSDLVR_ID, WRHSDLVR_MAS_ID, RCVPAY_QY, RM)
    VALUES (?,?,?, '')
  `;

  // LOT 차감(출고)
  const wrh_ext_update_lot_oust = `
    UPDATE LOT_STC_PRECON
    SET OUST_QY = COALESCE(OUST_QY,0) + ?, NOW_STC_QY = GREATEST(NOW_STC_QY - ?, 0)
    WHERE LOT_INVNTRY_PRECON_ID = ?
  `;

module.exports = {
  wrh_ext_available_fg_stock,
  wrh_ext_select_active_bom_id,
  wrh_ext_required_per_unit_by_bom,
  wrh_ext_stock_by_bom_rscs,
  wrh_ext_lots_for_rsc_for_update,
  wrh_ext_insert_mas_outbound,
  wrh_ext_insert_deta_outbound,
  wrh_ext_update_lot_oust,
};
