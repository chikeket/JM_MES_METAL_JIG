// 수주 전체 조회
const rcvordFindAll = `SELECT
      RCVODR_ID,
      CO_ID,
      EMP_ID,
      REG_DT,
      RM
    FROM RCVORD
    ORDER BY RCVODR_ID`;

module.exports = {
  rcvordFindAll,
};
