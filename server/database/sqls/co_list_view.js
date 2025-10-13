// 업체관리 페이지 조회
const co_list = `
SELECT
    co_id,
    co_nm,
    co_ty_id,
    rpstr_nm,
    rpstr_tel,
    bizr_reg_no
    FROM co`;

module.exports = {
  coFindAll,
};