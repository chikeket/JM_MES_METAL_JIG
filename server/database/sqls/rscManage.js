// sqls/rscManage.js
const rscManageSelect = `
SELECT
  a.rsc_id,
  a.rsc_clsf_id,
  a.rsc_nm,
  a.spec,
  a.unit,
  a.rm as rmrk
FROM rsc a
WHERE a.rsc_nm LIKE CONCAT('%', ?, '%')
  AND (a.rsc_clsf_id = ? OR ? = '')
ORDER BY a.rsc_id DESC`;

const rscInsert = `
INSERT INTO rsc (rsc_id, rsc_clsf_id, rsc_nm, spec, unit, rm)
SELECT 
  CONCAT('RSC', LPAD(IFNULL(MAX(CAST(SUBSTRING(rsc_id, 4) AS UNSIGNED)), 0) + 1, 3, '0')),
  ?, ?, ?, ?, ?
FROM rsc
WHERE rsc_id LIKE 'RSC%'`;

const rscUpdate = `
UPDATE rsc
SET rsc_clsf_id = ?, rsc_nm = ?, spec = ?, unit = ?, rm = ?
WHERE rsc_id = ?`;

const rscDelete = `
DELETE FROM rsc WHERE rsc_id = ?`;

module.exports = {
  rscManageSelect,
  rscInsert,
  rscUpdate,
  rscDelete,
};