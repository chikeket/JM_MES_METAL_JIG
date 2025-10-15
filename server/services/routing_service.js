// mapper에서 mariaDB에 연결 해놨기에 ...
const mariadb = require("../database/mapper.js");

// 제품조회
const getRoutingInfo = async (prdt_cd) => {
  try {
    const result = await mariadb.query("selectPrcs", [prdt_cd]);
    return result;
  } catch (error) {
    console.error("라우팅정보가 아니얌", error);
    throw error;
  }
};

// 공정 모달 조회
const getPrcsModal = async (prcs_id, prcs_nm, eqm_grp_nm, lead_tm, mold_use_at) => {
  try {
    const result = await mariadb.query("selectPrcsModal", [
      prcs_id,
      prcs_nm,
      eqm_grp_nm,
      lead_tm,
      mold_use_at,
    ]);
    return result;
  } catch (error) {
    console.error("공정 모달 조회 에러", error);
    throw error;
  }
};

module.exports = {
  getRoutingInfo,
  getPrcsModal,
};
