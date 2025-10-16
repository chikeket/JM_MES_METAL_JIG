// 공정 진행 현황 - SQL 모음

// 지시 조회 모달: prod_drct 목록 (지시 ID LIKE 검색, emp_nm 포함)
const prcsProgPreconProdDrctSearch = `
SELECT 
	d.prod_drct_id,
	d.prod_drct_nm,
	d.prod_drct_fr_dt,
	d.prod_drct_to_dt,
	d.reg_dt,
	d.rm,
	e.emp_nm
FROM prod_drct d
LEFT JOIN emp e ON e.emp_id = d.emp_id
WHERE (? IS NULL OR ? = '')
	 OR d.prod_drct_id LIKE CONCAT('%', ?, '%')
ORDER BY d.reg_dt DESC`;

// 메인 큰 그리드: 선택한 지시 ID 기준, 진행상태 J2인 공정만
const prcsProgPreconMainList = `
SELECT 
	ppp.prod_drct_deta_id,
	pdd.prod_drct_id,
	ppp.prcs_ord,
	ppp.prcs_id,
	ppp.drct_qy,
	ppp.inpt_qy,
	ppp.st,
	sc.sub_code_nm AS st_nm,
	ppp.rm,
	pr.prdt_nm,
	po.opt_nm
FROM prcs_prog_precon ppp
JOIN prod_drct_deta pdd ON ppp.prod_drct_deta_id = pdd.prod_drct_deta_id
JOIN prdt pr ON pdd.prdt_id = pr.prdt_id
JOIN prdt_opt po ON pdd.prdt_opt_id = po.prdt_opt_id
LEFT JOIN sub_code sc ON sc.sub_code_id = ppp.st
WHERE pdd.prod_drct_id = ?
	AND ppp.st = 'J2'
ORDER BY ppp.prcs_ord, ppp.prcs_id`;

// 좌측 하단 그리드: 사원 전체 (부서명 포함)
const prcsProgPreconEmpList = `
SELECT 
	e.emp_id,
	e.emp_nm,
	sc.sub_code_nm AS dept_nm
FROM emp e
LEFT JOIN sub_code sc ON sc.sub_code_id = e.dept_id
ORDER BY e.emp_id`;

// 우측 하단 그리드: 설비 전체 (상태명 포함)
const prcsProgPreconEqmList = `
SELECT 
	q.eqm_id,
	q.eqm_nm,
	sc.sub_code_nm AS st_nm
FROM eqm q
LEFT JOIN sub_code sc ON sc.sub_code_id = q.st
ORDER BY q.eqm_id`;

module.exports = {
  prcsProgPreconProdDrctSearch,
  prcsProgPreconMainList,
  prcsProgPreconEmpList,
  prcsProgPreconEqmList,
};
