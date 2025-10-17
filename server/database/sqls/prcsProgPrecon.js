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
	p.prcs_nm,
	ppp.drct_qy,
	ppp.inpt_qy,
	ppp.st,
	sc.sub_code_nm AS st_nm,
	p.mold_use_at,
	ppp.rm,
	pr.prdt_nm,
	po.opt_nm,
	pdd.prdt_id,
	pdd.prdt_opt_id,
	ppp.prcs_prog_precon_id
FROM prcs_prog_precon ppp
JOIN prod_drct_deta pdd ON ppp.prod_drct_deta_id = pdd.prod_drct_deta_id
JOIN prdt pr ON pdd.prdt_id = pr.prdt_id
JOIN prdt_opt po ON pdd.prdt_opt_id = po.prdt_opt_id
LEFT JOIN sub_code sc ON sc.sub_code_id = ppp.st
LEFT JOIN prcs p ON p.prcs_id = ppp.prcs_id
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
  // 현투입 수량 조회: RWMATR_RTUN_TRGET에서 prod_drct_deta_id 기준 생산예상수량(prod_expc_qy)
  prcsProgPreconRunTargetByDeta: `
SELECT COALESCE(SUM(r.prod_expc_qy), 0) AS prod_expc_qy
FROM RWMATR_RTUN_TRGET r
WHERE r.prod_drct_deta_id = ?`,
  // 현투입 수량 목록 조회: inpt_st = 'J2' 인 행들의 prod_expc_qy 리스트
  prcsProgPreconRunTargetListByDeta: `
SELECT r.prod_expc_qy
FROM RWMATR_RTUN_TRGET r
WHERE r.prod_drct_deta_id = ?
	AND r.inpt_st = 'J2'
ORDER BY r.prod_expc_qy`,
  // 금형 조회 모달: mold 목록 (mold_id LIKE, prdt/sub_code 조인)
  prcsProgPreconMoldList: `
SELECT 
	m.mold_id,
	m.mold_nm,
	p.prdt_nm,
	m.mold_ty,
	sc_ty.sub_code_nm AS mold_ty_nm,
	m.CAVITY,
	m.accmlt_shot,
	m.warn_qy,
	m.dsuse_qy,
	m.chck_cycle,
	m.chck_dt,
	sc.sub_code_nm AS st_nm,
	m.rm
FROM mold m
LEFT JOIN prdt p ON p.prdt_id = m.prdt_id
LEFT JOIN sub_code sc ON sc.sub_code_id = m.st
LEFT JOIN sub_code sc_ty ON sc_ty.sub_code_id = m.mold_ty
WHERE (? IS NULL OR ? = '')
	 OR m.mold_id LIKE CONCAT('%', ?, '%')
ORDER BY m.mold_id`,
  // 공정 단건 조회 (금형 사용 여부 확인용)
  prcsProgPreconPrcsById: `
SELECT 
	p.prcs_id,
	p.mold_use_at
FROM prcs p
WHERE p.prcs_id = ?`,
};
