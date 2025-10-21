const prdtManageSelect = `
SELECT
  a.prdt_id,
  a.prdt_nm,
  a.spec,
  a.unit,
  a.prdt_st,
  sc_pst.sub_code_nm AS prdt_st_nm,
  IFNULL(rm, '') as rm  --
FROM prdt a
LEFT JOIN sub_code sc_pst ON sc_pst.sub_code_id = a.prdt_st
WHERE 1=1
  AND (? = '' OR a.prdt_id LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR a.prdt_nm LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR a.prdt_st = ?)
ORDER BY a.prdt_id DESC`;

const prdtOptionSelect = `
SELECT
  prdt_opt_id as opt_id,
  opt_nm,
  st as use_yn,
  IFNULL(rm, '') as rm  -- ⭐ 이렇게 변경
FROM prdt_opt
WHERE prdt_id = ?`;

const prdtInsert = `
INSERT INTO prdt (prdt_id, prdt_nm, spec, unit, prdt_st, rm)
SELECT 
  CONCAT('PDT', LPAD(IFNULL(MAX(CAST(SUBSTRING(prdt_id, 4) AS UNSIGNED)), 0) + 1, 3, '0')),
  ?, ?, ?, ?, ?
FROM prdt
WHERE prdt_id LIKE 'PDT%'`;

const prdtUpdate = `
UPDATE prdt
SET prdt_nm = ?, spec = ?, unit = ?, prdt_st = ?, rm = ?
WHERE prdt_id = ?`;

const prdtDelete = `
DELETE FROM prdt WHERE prdt_id = ?`;

// ============================================
// ⭐ 옵션 관련 SQL 추가!
// ============================================

const optionInsert = `
INSERT INTO prdt_opt (prdt_opt_id, prdt_id, opt_nm, st, rm)
SELECT 
  CONCAT('OPT', LPAD(IFNULL(MAX(CAST(SUBSTRING(prdt_opt_id, 4) AS UNSIGNED)), 0) + 1, 3, '0')),
  ?, ?, ?, ?
FROM prdt_opt
WHERE prdt_opt_id LIKE 'OPT%'`;

const optionUpdate = `
UPDATE prdt_opt
SET opt_nm = ?, st = ?, rm = ?
WHERE prdt_opt_id = ? AND prdt_id = ?`;

const optionDelete = `
DELETE FROM prdt_opt 
WHERE prdt_opt_id = ? AND prdt_id = ?`;

module.exports = {
  prdtManageSelect,
  prdtOptionSelect,
  prdtInsert,
  prdtUpdate,
  prdtDelete,
  // ⭐ 여기에 추가!
  optionInsert,
  optionUpdate,
  optionDelete,
};