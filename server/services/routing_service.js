// mapper에서 mariaDB에 연결 해놨기에 ...
const mariadb = require("../database/mapper.js");

const getRoutingInfo = async (prdt_cd) => {
  try {
    const result = await mariadb.query("selectPrcs", [prdt_cd]);
    return result;
  } catch (error) {
    console.error("라우팅정보가 아니얌", error);
    throw error;
  }
};

module.exports = {
  getRoutingInfo,
};
