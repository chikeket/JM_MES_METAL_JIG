// 수주 단건 헤더 (업체명) - 원본 컬럼만
const rcvordFindHeader = `SELECT
    r.rcvord_id,
    r.co_id,
    c.co_nm,
    r.emp_id,
    e.emp_nm,
    r.reg_dt,
    r.rm,
    r.st
  FROM rcvord r
    LEFT JOIN co c ON c.co_id = r.co_id
    LEFT JOIN emp e ON e.emp_id = r.emp_id
  WHERE r.rcvord_id = ?`;

// 수주 목록 (집계 포함) - total_qty, due_date 계산 (원본 컬럼 + 파생컬럼)
const rcvordFindAllWithAgg = `SELECT
    r.rcvord_id,
    r.co_id,
    c.co_nm,
    r.emp_id,
    e.emp_nm,
    r.reg_dt,
    r.rm,
    r.st,
    IFNULL(SUM(d.rcvord_qy),0) AS total_qty,
    MIN(d.paprd_dt) AS due_date
  FROM rcvord r
    LEFT JOIN co c ON c.co_id = r.co_id
    LEFT JOIN emp e ON e.emp_id = r.emp_id
    LEFT JOIN rcvord_deta d ON d.rcvord_id = r.rcvord_id
  GROUP BY r.rcvord_id, r.co_id, c.co_nm, r.emp_id, e.emp_nm, r.reg_dt, r.rm, r.st
  ORDER BY r.rcvord_id`;

// 수주 상세 라인 목록 - 원본 컬럼/명칭 유지
const rcvordFindLines = `SELECT
    d.rcvord_deta_id,
    d.rcvord_id,
    d.prdt_id,
    p.prdt_nm,
    p.spec,
    p.unit,
    p.prdt_st,
    d.prdt_opt_id,
    o.opt_nm,
    d.rcvord_qy,
    d.paprd_dt,
    d.rm
  FROM rcvord_deta d
    LEFT JOIN prdt p ON p.prdt_id = d.prdt_id
    LEFT JOIN prdt_opt o ON o.prdt_opt_id = d.prdt_opt_id
  WHERE d.rcvord_id = ?
  ORDER BY d.rcvord_deta_id`;

// 저장 관련 (INSERT / UPDATE / LINE 재작성)
const rcvordExists = `SELECT 1 FROM rcvord WHERE rcvord_id = ? LIMIT 1`;
const rcvordInsert = `INSERT INTO rcvord (rcvord_id, co_id, emp_id, reg_dt, st, rm) VALUES (?, ?, ?, ?, ?, ?)`;
const rcvordUpdate = `UPDATE rcvord SET co_id = ?, emp_id = ?, reg_dt = ?, st = ?, rm = ? WHERE rcvord_id = ?`;
const rcvordDeleteLines = `DELETE FROM rcvord_deta WHERE rcvord_id = ?`;
const rcvordInsertLine = `INSERT INTO rcvord_deta (rcvord_deta_id, rcvord_id, prdt_id, prdt_opt_id, rcvord_qy, paprd_dt, rm) VALUES (?, ?, ?, ?, ?, ?, ?)`;

module.exports = {
  rcvordFindAllWithAgg,
  rcvordFindHeader,
  rcvordFindLines,
  rcvordExists,
  rcvordInsert,
  rcvordUpdate,
  rcvordDeleteLines,
  rcvordInsertLine,
};
