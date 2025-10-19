// 제품명으로 제품ID 반환
async function getPrdtIdByName(prdt_nm) {
  const rows = await mariadb.query('SELECT prdt_id FROM prdt WHERE prdt_nm = ? LIMIT 1', [prdt_nm]);
  return rows[0]?.prdt_id || '';
}

// 옵션명으로 옵션ID 반환
async function getOptIdByName(opt_nm) {
  const rows = await mariadb.query('SELECT prdt_opt_id as opt_id FROM prdt_opt WHERE opt_nm = ? LIMIT 1', [opt_nm]);
  return rows[0]?.opt_id || '';
}
const mariadb = require('../database/mapper');

// BOM 마스터 전체/조건 조회 (제품명/옵션명으로 조회)
async function getBomMasterList({ productName = '', optionName = '', status = '' } = {}) {
  // rcvord 스타일: 파라미터 배열화 (이름 그대로)
  const params = [productName, productName, optionName, optionName, status, status];
  const rows = await mariadb.query('bomMasterSelect', params);
  return rows;
}

// BOM 마스터 단건 조회 (필요시)
async function getBomMasterById(bom_id) {
  const rows = await mariadb.query('bomMasterFindById', [bom_id]);
  return rows[0] || null;
}

// BOM 마스터 신규
async function insertBomMaster(data) {
  // 신규 ID 생성
  const idRow = await mariadb.query('bomMasterNewId');
  const bom_id = idRow[0].bom_id;
  const params = [
    bom_id,
    data.prdt_id,
    data.prdt_opt_id || '',
    data.bom_ver || '',
    data.valid_fr_dt || '',
    data.valid_to_dt || '',
    data.st || '',
    data.rm || ''
  ];
  await mariadb.query('bomMasterInsert', params);
  return bom_id;
}

// BOM 마스터 수정
async function updateBomMaster(bom_id, data) {
  const params = [
    data.prdt_id,
    data.prdt_opt_id || '',
    data.bom_ver || '',
    data.valid_fr_dt || '',
    data.valid_to_dt || '',
    data.st || '',
    data.rm || '',
    bom_id
  ];
  return await mariadb.query('bomMasterUpdate', params);
}

// BOM 마스터 삭제
async function deleteBomMaster(bom_id) {
  return await mariadb.query('bomMasterDelete', [bom_id]);
}

// BOM 디테일 전체/조건 조회
async function getBomDetailList({ bom_id = '' } = {}) {
  const params = [bom_id, bom_id];
  const rows = await mariadb.query('bomDetailSelect', params);
  return rows;
}

// BOM 디테일 단건 조회 (필요시)
async function getBomDetailById(bom_deta_id) {
  const rows = await mariadb.query('bomDetailFindById', [bom_deta_id]);
  return rows[0] || null;
}

// BOM 디테일 신규
async function insertBomDetail(data) {
  const idRow = await mariadb.query('bomDetailNewId');
  const bom_deta_id = idRow[0].bom_deta_id;
  const params = [
    bom_deta_id,
    data.bom_id,
    data.rsc_id || '',
    data.rsc_nm || '',
    data.unit || '',
    data.bom_qty || '',
    data.rmrk || ''
  ];
  await mariadb.query('bomDetailInsert', params);
  return bom_deta_id;
}

// BOM 디테일 수정
async function updateBomDetail(bom_deta_id, data) {
  const params = [
    data.bom_id,
    data.rsc_id || '',
    data.rsc_nm || '',
    data.unit || '',
    data.bom_qty || '',
    data.rmrk || '',
    bom_deta_id
  ];
  return await mariadb.query('bomDetailUpdate', params);
}

// BOM 디테일 삭제
async function deleteBomDetail(bom_deta_id) {
  return await mariadb.query('bomDetailDelete', [bom_deta_id]);
}

module.exports = {
  getBomMasterList,
  getBomMasterById,
  insertBomMaster,
  updateBomMaster,
  deleteBomMaster,
  getBomDetailList,
  getBomDetailById,
  insertBomDetail,
  updateBomDetail,
  deleteBomDetail,
  getPrdtIdByName,
  getOptIdByName,
};
