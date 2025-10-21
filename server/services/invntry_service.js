const mariadb = require("../database/mapper.js");

function buildWhere(base, parts, params) {
  let where = base;
  for (const p of parts) {
    if (p && p.sql) {
      where += `\n  AND ${p.sql}`;
      if (p.params && p.params.length) params.push(...p.params);
    }
  }
  return where;
}

async function getLotStatus({
  item_type, rsc_id, prdt_id, prdt_opt_id,
  whous_id, zone_id, lot_no, only_positive,
  page = 1, pageSize = 20, orderBy = 'last_tr_dt DESC'
}) {
  const params = [];
  let where = 'WHERE 1=1';

  // 필터
  if (item_type === 'E1') {
    where = buildWhere(where, [
      { sql: 'l.RSC_ID IS NOT NULL' }
    ], params);
  } else if (item_type === 'E2' || item_type === 'E3') {
    where = buildWhere(where, [
      { sql: 'l.PRDT_ID IS NOT NULL' }
    ], params);
  }
  where = buildWhere(where, [
    rsc_id ? { sql: 'l.RSC_ID = ?', params: [rsc_id] } : null,
    prdt_id ? { sql: 'l.PRDT_ID = ?', params: [prdt_id] } : null,
    prdt_opt_id ? { sql: 'l.PRDT_OPT_ID = ?', params: [prdt_opt_id] } : null,
    whous_id ? { sql: 'COALESCE(lat.WHOUS_ID, l.WHOUS_ID) = ?', params: [whous_id] } : null,
    zone_id ? { sql: 'COALESCE(lat.ZONE_ID, l.ZONE_ID) = ?', params: [zone_id] } : null,
    lot_no ? { sql: 'l.LOT_NO LIKE ?', params: [`%${lot_no}%`] } : null,
    only_positive ? { sql: 'l.NOW_STC_QY > 0' } : null
  ], params);

const countSql = `
    ${sql.LOT_STATUS_BASE_SELECT_COUNT}
    ${where}
  `;
  const [{ total }] = await mariadb.query(countSql, params);

  // 페이지네이션
  const offset = (page - 1) * pageSize;
  const listSql = `
    ${sql.LOT_STATUS_BASE_SELECT_LIST}
    ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  const listParams = params.slice();
  listParams.push(Number(pageSize), Number(offset));

  const rows = await mariadb.query(listSql, listParams);

  return {
    page, pageSize, total,
    list: rows
  };
}

async function getWarehouseTransactions({
  from_dt, to_dt, rcvpay_ty,
  rsc_id, prdt_id, prdt_opt_id,
  whous_id, zone_id, lot_no, keyword,
  page = 1, pageSize = 20, orderBy = 'm.RCVPAY_DT DESC, d.WRHOUS_WRHSDLVR_ID DESC'
}) {
  const params = [];
  let where = 'WHERE 1=1';

  where = buildWhere(where, [
    from_dt ? { sql: 'DATE(m.RCVPAY_DT) >= ?', params: [from_dt] } : null,
    to_dt ?   { sql: 'DATE(m.RCVPAY_DT) <= ?', params: [to_dt] }   : null,
    rcvpay_ty ? { sql: 'm.RCVPAY_TY = ?', params: [rcvpay_ty] } : null,
    rsc_id ? { sql: 'm.RSC_ID = ?', params: [rsc_id] } : null,
    prdt_id ? { sql: 'm.PRDT_ID = ?', params: [prdt_id] } : null,
    prdt_opt_id ? { sql: 'm.PRDT_OPT_ID = ?', params: [prdt_opt_id] } : null,
    whous_id ? { sql: 'm.WHOUS_ID = ?', params: [whous_id] } : null,
    zone_id ? { sql: 'm.ZONE_ID = ?', params: [zone_id] } : null,
    lot_no ? { sql: 'm.LOT_NO LIKE ?', params: [`%${lot_no}%`] } : null,
    keyword ? { sql: '(COALESCE(r.RSC_NM, p.PRDT_NM, \'\') LIKE ? OR m.LOT_NO LIKE ? OR COALESCE(d.RM, m.RM, \'\') LIKE ?)',
                params: [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`] } : null
  ], params);

  // 카운트
  const countSql = `
    ${sql.WH_TXN_BASE_SELECT_COUNT}
    ${where}
  `;
  const [{ total }] = await mariadb.query(countSql, params);

  // 페이지네이션
  const offset = (page - 1) * pageSize;
  const listSql = `
    ${sql.WH_TXN_BASE_SELECT_LIST}
    ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  const listParams = params.slice();
  listParams.push(Number(pageSize), Number(offset));

  const rows = await mariadb.query(listSql, listParams);

  return {
    page, pageSize, total,
    list: rows
  };
}
  
module.exports = {
  getLotStatus,
  getWarehouseTransactions
};
