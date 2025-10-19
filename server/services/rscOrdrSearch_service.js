const mariadb = require("../database/mapper.js");

async function getRscOrdrSearchList(filters = {}) {
  const rsc_ordr_id = (filters.rsc_ordr_id ?? '').trim();
  const co_nm = (filters.co_nm ?? '').trim();
  const emp_nm = (filters.emp_nm ?? '').trim();
  const reg_dt_from = (filters.reg_dt_from ?? '').trim();
  const reg_dt_to = (filters.reg_dt_to ?? '').trim();

  // rcvordSearchList와 동일하게 10개 파라미터
  const params = [
    rsc_ordr_id,
    rsc_ordr_id,
    co_nm,
    co_nm,
    emp_nm,
    emp_nm,
    reg_dt_from,
    reg_dt_from,
    reg_dt_to,
    reg_dt_to,
  ];
  const rows = await mariadb.query('selectRscOrdrAllList', params);
  return rows;
}

module.exports = { getRscOrdrSearchList };
