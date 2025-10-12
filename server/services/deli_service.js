const mariadb = require("../database/mapper.js");

module.exports = {
  // 모달 목록: 검색어(optional)
  async getDeliList(searchId) {
    const kw = (searchId ?? "").trim();
    // deliModalFind는 (?='', OR LIKE) 패턴으로 전체/검색을 처리
    return await mariadb.query("deliModalFind", [kw, kw]);
  },
  // 단건 헤더 + 라인
  async getDeliDetail(deliId) {
    if (!deliId) throw new Error("deliId 누락");
    const headerRows = await mariadb.query("deliFindHeader", [deliId]);
    if (!headerRows.length) return null;
    const header = headerRows[0];
    const lines = await mariadb.query("deliFindLines", [deliId, deliId]);
    return { header, lines };
  },
};
