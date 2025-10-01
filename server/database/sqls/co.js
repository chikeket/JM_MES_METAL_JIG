// 업체 전체 조회
const coFindAll = `SELECT
      CO_ID,
      CO_NM,
      CO_TY_ID,
      RPSTR_NM,
      RPSTR_TEL,
      BIZR_REG_NO,
      ST,
      RM
    FROM CO
    ORDER BY CO_ID`;

module.exports = {
  coFindAll,
};
