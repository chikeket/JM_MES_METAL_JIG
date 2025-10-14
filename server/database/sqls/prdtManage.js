const prdtListView = `
  SELECT
    prdt_id,
    prdt_nm,
    spec,
    unit,
    prdt_st,
    rmrk
  FROM prdt
  WHERE 1=1
    AND (? = '' OR prdt_id = ?)
    AND (? = '' OR prdt_nm LIKE CONCAT('%', ?, '%'))
    AND (? = '' OR prdt_st = ?)
  ORDER BY prdt_id DESC
`;

const prdtOptionList = `
  SELECT
    opt_id,
    opt_nm,
    use_yn,
    rmrk,
    prdt_id
  FROM prdt_option
  WHERE prdt_id = ?
  ORDER BY opt_id
`;

const prdtDelete = `
  DELETE FROM prdt
  WHERE prdt_id = ?
`;

module.exports = {
  prdtListView,
  prdtOptionList,
  prdtDelete
};