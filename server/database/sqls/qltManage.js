module.exports = {
  qltListView: `
    SELECT q.insp_id, q.prdt_id, p.prdt_nm, q.insp_dt, q.insp_rslt, q.insp_st, q.insptr_nm, q.rmrk
    FROM QLT_INSP q
    LEFT JOIN PRDT_MST p ON q.prdt_id = p.prdt_id
    WHERE 1=1
      AND (? IS NULL OR ? = '' OR q.insp_id LIKE CONCAT('%', ?, '%'))
      AND (? IS NULL OR ? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
      AND (? IS NULL OR ? = '' OR q.insp_st = ?)
    ORDER BY q.insp_id DESC
  `,

  qltDetailList: `
    SELECT dtl_id, insp_id, insp_item, insp_val, pass_yn, rmrk
    FROM QLT_INSP_DTL
    WHERE insp_id = ?
    ORDER BY dtl_id
  `,

  qltCreateId: `
    SELECT CONCAT('Q', LPAD(IFNULL(MAX(CAST(SUBSTRING(insp_id, 2) AS UNSIGNED)), 0) + 1, 4, '0')) AS insp_id
    FROM QLT_INSP
  `,

  qltCheckDuplicate: `
    SELECT insp_id FROM QLT_INSP WHERE insp_id = ?
  `,

  qltInsert: `
    INSERT INTO QLT_INSP (insp_id, prdt_id, insp_dt, insp_rslt, insp_st, insptr_nm, rmrk)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  qltUpdate: `
    UPDATE QLT_INSP
    SET insp_id = ?, prdt_id = ?, insp_dt = ?, insp_rslt = ?, insp_st = ?, insptr_nm = ?, rmrk = ?
    WHERE insp_id = ?
  `,

  qltDelete: `
    DELETE FROM QLT_INSP WHERE insp_id = ?
  `,

  qltDetailDelete: `
    DELETE FROM QLT_INSP_DTL WHERE insp_id = ?
  `
}