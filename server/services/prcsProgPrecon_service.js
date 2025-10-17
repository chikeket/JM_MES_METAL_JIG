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

async function getPrcsById(prcsId) {
  if (!prcsId) return null;
  const rows = await mariadb.query("prcsProgPreconPrcsById", [prcsId]);
  return rows && rows[0] ? rows[0] : null;
}

async function getMoldList(keyword = "") {
  const kw = (keyword || "").trim();
  const rows = await mariadb.query("prcsProgPreconMoldList", [kw, kw, kw]);
  return rows;
}

async function getRunTargetQtyByDetaId(prodDrctDetaId) {
  if (!prodDrctDetaId) return 0;
  const rows = await mariadb.query("prcsProgPreconRunTargetByDeta", [
    prodDrctDetaId,
  ]);
  const v = rows && rows[0] ? rows[0].prod_expc_qy : 0;
  return Number(v) || 0;
}

async function getRunTargetQtyListByDetaId(prodDrctDetaId) {
  if (!prodDrctDetaId) return [];
  const rows = await mariadb.query("prcsProgPreconRunTargetListByDeta", [
    prodDrctDetaId,
  ]);
  // 반환값은 숫자 배열로 변환
  return (rows || []).map((r) => Number(r.prod_expc_qy) || 0);
}

module.exports = {
  searchProdDrct,
  getMainList,
  getEmpList,
  getEqmList,
  getPrcsById,
  getMoldList,
  getRunTargetQtyByDetaId,
  getRunTargetQtyListByDetaId,
};
