// 납품 전체 조회
const deliFindAll = `SELECT
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
  deliFindAll,
};
