// 직원(사원) 조회 SQL
// 이름으로 단건(또는 우선순위 1건) 검색: 완전 일치 우선, 없으면 부분 일치 1건
const empFindByName = `SELECT emp_id, emp_nm FROM emp WHERE emp_nm = ? LIMIT 1`;
const empFindByNameLike = `SELECT emp_id, emp_nm FROM emp WHERE emp_nm LIKE CONCAT('%', ?, '%') ORDER BY emp_id LIMIT 10`;
const empFindAll = `SELECT emp_id, emp_nm FROM emp ORDER BY emp_id`;

module.exports = { empFindByName, empFindByNameLike, empFindAll };
