const mariadb = require("../database/mapper.js");

async function getRcvordSearchList(filters = {}) {
  const rcvord_id = (filters.rcvord_id ?? "").trim();
  const co_nm = (filters.co_nm ?? "").trim();
  const emp_nm = (filters.emp_nm ?? "").trim();
  const reg_dt_from = (filters.reg_dt_from ?? "").trim();
  const reg_dt_to = (filters.reg_dt_to ?? "").trim();

  const params = [
    rcvord_id,
    rcvord_id,
    co_nm,
    co_nm,
    emp_nm,
    emp_nm,
    reg_dt_from,
    reg_dt_from,
    reg_dt_to,
    reg_dt_to,
  ];
  const rows = await mariadb.query("rcvordSearchList", params);
  return rows;
}

module.exports = { getRcvordSearchList };
