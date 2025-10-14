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
    CONCAT('C', LPAD(IFNULL(MAX(CAST(SUBSTRING(co_id, 2) AS UNSIGNED)), 0) + 1, 3, '0')) AS co_id
  FROM co
  WHERE co_id LIKE 'C%'
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

module.exports = {
  coListView,
  coCreateId,
  coInsert,
  coUpdate,
  coDelete
};

const coCheckDuplicate = `
  SELECT co_id FROM co WHERE co_id = ?
`;

module.exports = {
  coListView,
  coCreateId,
  coInsert,
  coUpdate,
  coDelete,
  coCheckDuplicate  // 이거 추가
};