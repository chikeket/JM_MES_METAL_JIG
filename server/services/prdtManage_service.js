const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require("../utils/converts.js");
const sqlList = require("../database/sqlList.js");
// console.log('prdtupdate 존재 여부:', !!sqlList.prdtUpdate);
// console.log('사용 가능한 쿼리들:', Object.keys(sqlList).filter(k => k.startsWith('prdt')));


const getPrdtList = async (filters) => {
  try {
    const params = [
      filters.prdt_id || '', filters.prdt_id || '',
      filters.prdt_nm || '', filters.prdt_nm || '',
      filters.prdt_st || '', filters.prdt_st || ''
    ];
    console.log('📋 서비스 파라미터:', params);
    let list = await mariadb.query("prdtManageSelect", params);
    return list || [];
  } catch (err) {
    console.error("getPrdtList 오류:", err);
    throw err;
  }
};

const getPrdtOptions = async (prdtId) => {
  try {
    let list = await mariadb.query("prdtOptionSelect", [prdtId]);
    return list || [];
  } catch (err) {
    console.error("getPrdtOptions 오류:", err);
    throw err;
  }
};

const insertPrdt = async (prdtData) => {
  try {
    let data = [
      prdtData.prdt_nm,
      prdtData.spec,
      prdtData.unit,
      prdtData.prdt_st || 'K1',
      prdtData.rmrk || ''
    ];
    let result = await mariadb.query("prdtInsert", data);
    return result;
  } catch (err) {
    console.error("insertPrdt 오류:", err);
    throw err;
  }
};

const updatePrdt = async (prdtData) => {
  try {
    console.log("===== ✅ updatePrdt 받은 데이터 =====");
    console.log(prdtData);

    let data = [
      prdtData.prdt_nm,
      prdtData.spec,
      prdtData.unit,
      prdtData.prdt_st,
      prdtData.rm || '',
      prdtData.original_prdt_id || prdtData.prdt_id
    ];

    console.log("===== 📝 SQL에 전달할 배열 =====");
    console.log(data);
    console.log("순서: [prdt_nm, spec, unit, prdt_st, rm, prdt_id]");

    let result = await mariadb.query("prdtUpdate", data);

    console.log("===== 💾 UPDATE 실행 결과 =====");
    console.log(result);

    return result;
  } catch (err) {
    console.error("❌ updatePrdt 오류:", err);
    throw err;
  }
};

const deletePrdt = async (prdtId) => {
  try {
    let result = await mariadb.query("prdtDelete", [prdtId]);
    return result;
  } catch (err) {
    console.error("deletePrdt 오류:", err);
    throw err;
  }
};

module.exports = {
  getPrdtList,
  getPrdtOptions,
  insertPrdt,
  updatePrdt,
  deletePrdt,
};