const mariadb = require("../database/mapper.js");

module.exports = {
  async login(id, pw) {
    if (!id || !pw) throw new Error("아이디/비밀번호 누락");
    const idTrim = id.trim();
    const pwTrim = pw.trim();
    const rows = await mariadb.query("acctLogin", [idTrim, pwTrim]);
    const row = rows[0];
    if (!row) {
      // 추가 진단: ID 존재 여부 확인
      const exists = await mariadb.query("acctExistsById", [idTrim]);
      if (exists.length) {
        const err = new Error("비밀번호가 올바르지 않습니다.");
        err.code = "WRONG_PASSWORD";
        throw err;
      } else {
        const err = new Error("아이디를 찾을 수 없습니다.");
        err.code = "NO_ID";
        throw err;
      }
    }
    return normalize(row);
  },
  async getAcct(acctId) {
    if (!acctId) return null;
    const rows = await mariadb.query("acctByAcctId", [acctId]);
    return rows[0] ? normalize(rows[0]) : null;
  },
  async logout(session) {
    return new Promise((resolve, reject) => {
      session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
};

function normalize(r) {
  return {
    acct_id: r.acct_id,
    emp_id: r.emp_id,
    id: r.id,
    co_id: r.co_id,
    dept_id: r.dept_id,
    perm_id: r.perm_id,
    wkgd_id: r.wkgd_id,
    emp_nm: r.emp_nm,
    emp_tel: r.emp_tel,
    emp_email: r.emp_email,
    hire_dt: r.hire_dt,
    hoof_st: r.hoof_st,
    acct_rm: r.rm,
    emp_rm: r.emp_rm,
  };
}
