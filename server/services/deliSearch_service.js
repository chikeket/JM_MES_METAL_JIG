const mariadb = require("../database/mapper.js");

async function getDeliSearchList(filters = {}) {
  const deli_id = (filters.deli_id ?? "").trim();
  const emp_nm = (filters.emp_nm ?? "").trim();
  const deli_dt_from = (filters.deli_dt_from ?? "").trim();
  const deli_dt_to = (filters.deli_dt_to ?? "").trim();

  // sql alias: deliSearchList (defined in database/sqls/deli.js)
  // placeholders order follows rcvordSearchList style with guard params for empty filters
  const params = [
    deli_id,
    deli_id,
    emp_nm,
    emp_nm,
    deli_dt_from,
    deli_dt_from,
    deli_dt_to,
    deli_dt_to,
  ];
  const rows = await mariadb.query("deliSearchList", params);
  return rows;
}

module.exports = { getDeliSearchList };
