// services/rscManage_service.js
const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// console.log('rscUpdate 존재 여부:', !!sqlList.rscUpdate);
// console.log('사용 가능한 쿼리들:', Object.keys(sqlList).filter(k => k.startsWith('rsc')));

const getRscList = async (filters) => {
  try {
    const params = [
      filters.rsc_nm || '',
      filters.rsc_clsf_id || '',
      filters.rsc_clsf_id || ''  // 중복 파라미터 (WHERE 조건에 OR ? = '' 있으면 필요)
    ];
    console.log('📋 서비스 파라미터:', params);
    let list = await mariadb.query("rscManageSelect", params);
    return list || [];
  } catch (err) {
    console.error("getRscList 오류:", err);
    throw err;
  }
};

const insertRsc = async (rscData) => {
  try {
    let data = [
      rscData.rsc_clsf_id || '',
      rscData.rsc_nm,
      rscData.spec || '',
      rscData.unit || '',
      rscData.rm || ''
    ];
    let result = await mariadb.query("rscInsert", data);
    return result;
  } catch (err) {
    console.error("insertRsc 오류:", err);
    throw err;
  }
};

const updateRsc = async (rscData) => {
  try {
    let data = [
      rscData.rsc_clsf_id,
      rscData.rsc_nm,
      rscData.spec,
      rscData.unit,
      rscData.rm || '',
      rscData.original_rsc_id || rscData.rsc_id
    ];
    let result = await mariadb.query("rscUpdate", data);
    return result;
  } catch (err) {
    console.error("updateRsc 오류:", err);
    throw err;
  }
};

const deleteRsc = async (rscId) => {
  try {
    let result = await mariadb.query("rscDelete", [rscId]);
    return result;
  } catch (err) {
    console.error("deleteRsc 오류:", err);
    throw err;
  }
};

module.exports = {
  getRscList,
  insertRsc,
  updateRsc,
  deleteRsc,
};