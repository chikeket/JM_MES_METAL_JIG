const mariadb = require('../database/mapper');

// 모달용: 마스터+디테일 JOIN 검색
async function searchWrhsdlvrMasterDetail({ rsc_ordr_nm, rcvpay_ty, emp_nm, reg_dt }) {
  const params = [
    rsc_ordr_nm || '', rsc_ordr_nm || '',
    rcvpay_ty || '', rcvpay_ty || '',
    emp_nm || '', emp_nm || '',
    reg_dt || '', reg_dt || ''
  ];
  const rows = await mariadb.query('wrhsdlvrModalSearch', params);
  return rows;
}

// 단건: 마스터+디테일
async function getWrhsdlvrMasterDetailById(masId) {
  const [master] = await mariadb.query('wrhsdlvrMasterById', [masId]);
  const details = await mariadb.query('wrhsdlvrDetailByMasId', [masId]);
  return { master, details };
}

module.exports = { 
    searchWrhsdlvrMasterDetail,
    getWrhsdlvrMasterDetailById,
};
