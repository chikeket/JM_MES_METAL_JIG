const qltyItemManageSelect = `
SELECT
  a.qlty_item_mng_id,
  a.insp_item_nm,
  a.ty,
  a.ver,
  a.st,
  a.basi_val,
  a.spec,
  a.unit,
  a.eror_scope_min,
  a.eror_scope_max,
  a.reg_dt,
  a.rm as rmrk
FROM qlty_item a
WHERE a.qlty_item_mng_id LIKE CONCAT('%', ?, '%')
  AND a.insp_item_nm LIKE CONCAT('%', ?, '%')
  AND (a.ty = ? OR ? = '')
ORDER BY a.qlty_item_mng_id DESC`;

// ✅ 수정: ID 자동 생성 추가
const qltyItemInsert = `
INSERT INTO qlty_item (qlty_item_mng_id, insp_item_nm, ty, ver, st, basi_val, spec, unit, eror_scope_min, eror_scope_max, reg_dt, rm)
SELECT 
  CONCAT('QLTY', LPAD(IFNULL(MAX(CAST(SUBSTRING(qlty_item_mng_id, 5) AS UNSIGNED)), 0) + 1, 3, '0')),
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
FROM qlty_item
WHERE qlty_item_mng_id LIKE 'QLTY%'`;

const qltyItemUpdate = `
UPDATE qlty_item
SET insp_item_nm = ?, ty = ?, ver = ?, st = ?, basi_val = ?, spec = ?, unit = ?, eror_scope_min = ?, eror_scope_max = ?, reg_dt = ?, rm = ?
WHERE qlty_item_mng_id = ?`;

const qltyItemDelete = `
DELETE FROM qlty_item WHERE qlty_item_mng_id = ?`;

module.exports = {
  qltyItemManageSelect,
  qltyItemInsert,
  qltyItemUpdate,
  qltyItemDelete,
};