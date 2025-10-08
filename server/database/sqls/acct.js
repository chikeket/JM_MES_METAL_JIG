// 계정 + 사원 조인하여 인증용 단건 조회 (ID + PW)
const acctLogin = `SELECT a.acct_id, a.emp_id, a.id, a.pw, a.rm,
       e.co_id, e.dept_id, e.perm_id, e.wkgd_id, e.emp_nm, e.emp_tel, e.emp_email,
       e.hire_dt, e.hoof_st, e.rm AS emp_rm
FROM acct a
JOIN emp e ON e.emp_id = a.emp_id
WHERE a.id = ? AND a.pw = ?
LIMIT 1`;

// 계정 ID로 사원 전체 재조회 (세션 검증 용)
const acctByAcctId = `SELECT a.acct_id, a.emp_id, a.id, a.pw, a.rm,
       e.co_id, e.dept_id, e.perm_id, e.wkgd_id, e.emp_nm, e.emp_tel, e.emp_email,
       e.hire_dt, e.hoof_st, e.rm AS emp_rm
FROM acct a
JOIN emp e ON e.emp_id = a.emp_id
WHERE a.acct_id = ?
LIMIT 1`;

// ID 존재 여부 확인
const acctExistsById = `SELECT 1 FROM acct WHERE id = ? LIMIT 1`;

module.exports = { acctLogin, acctByAcctId, acctExistsById };
