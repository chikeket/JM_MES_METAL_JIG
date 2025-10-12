// 업체 테이블 관련 SQL 쿼리들

// 업체 전체 목록 조회 (ID 순으로 정렬)
const coFindAll = `SELECT
      co_id,
      co_nm,
      co_ty_id,
      rpstr_nm,
      rpstr_tel,
      bizr_reg_no,
      st,
      rm
    FROM co
    ORDER BY co_id`;

module.exports = {
  coFindAll,
};
