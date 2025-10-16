const mariadb = require("../database/mapper.js");

async function searchProdDrct(keyword = "") {
  // 두 번 전달하여 (? IS NULL OR ? = '') 체크와 LIKE 바인딩을 모두 처리
  const kw = (keyword || "").trim();
  const rows = await mariadb.query("prcsProgPreconProdDrctSearch", [
    kw,
    kw,
    kw,
  ]);
  return rows;
}

async function getMainList(prodDrctId) {
  if (!prodDrctId) return [];
  const rows = await mariadb.query("prcsProgPreconMainList", [prodDrctId]);
  return rows;
}

async function getEmpList() {
  const rows = await mariadb.query("prcsProgPreconEmpList");
  return rows;
}

async function getEqmList() {
  const rows = await mariadb.query("prcsProgPreconEqmList");
  return rows;
}

module.exports = {
  searchProdDrct,
  getMainList,
  getEmpList,
  getEqmList,
};
