const coListView = `
  SELECT
    co_id AS id,
    co_nm AS name,
    co_ty_id AS type,
    rpstr_nm AS ceo,
    rpstr_tel AS ceoPhone,
    bizr_reg_no AS businessNo,
    st AS status
  FROM co
  WHERE 1=1
    AND (? = '' OR co_ty_id = ?)
    AND (? = '' OR co_nm LIKE CONCAT('%', ?, '%'))
    AND (? = '' OR st = ?)
  ORDER BY co_id DESC
`;

const coCreateId = `
  SELECT 
    CONCAT('CO', DATE_FORMAT(NOW(), '%y%m'), LPAD(IFNULL(MAX(CAST(SUBSTRING(co_id, 9, 3) AS UNSIGNED)), 0) + 1, 3, '0')) AS co_id
  FROM co
  WHERE SUBSTRING(co_id, 3, 4) = DATE_FORMAT(NOW(), '%y%m')
  FOR UPDATE
`;


const coInsert = `
  INSERT INTO co (
    co_id,
    bizr_reg_no,
    co_nm,
    rpstr_nm,
    rpstr_tel,
    co_ty_id,
    st
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`;

const coUpdate = `
  UPDATE co SET
    co_id = ?,
    bizr_reg_no = ?,
    co_nm = ?,
    rpstr_nm = ?,
    rpstr_tel = ?,
    co_ty_id = ?,
    st = ?
  WHERE co_id = ?
`;

const coDelete = `
  DELETE FROM co
  WHERE co_id = ?
`;

const coCheckDuplicate = `
  SELECT co_id FROM co WHERE co_id = ?
`;


module.exports = {
  coListView,
  coCreateId,
  coInsert,
  coUpdate,
  coDelete,
  coCheckDuplicate,
};
