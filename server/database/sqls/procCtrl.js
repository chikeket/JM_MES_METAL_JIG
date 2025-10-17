// 공정 제어(proc_ctrl) 관련 SQL

// ID 생성: 'PRCS_CTRL' + YYYYMM + 3자리 증가 시퀀스
const procCtrlNewId = `
	SELECT CONCAT(
					 'PRCS_CTRL',
					 DATE_FORMAT(NOW(), '%Y%m'),
					 LPAD(IFNULL(MAX(CAST(SUBSTR(prcs_ctrl_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')
				 ) AS new_id
	FROM proc_ctrl
	WHERE SUBSTR(prcs_ctrl_id, 10, 6) = DATE_FORMAT(NOW(), '%Y%m')
`;

// 시작 시 행 INSERT (wk_to_dt, rm는 일단 NULL)
const procCtrlInsert = `
	INSERT INTO proc_ctrl (
		prcs_ctrl_id,
		prcs_prog_precon_id,
		prcs_ord,
		mold_id,
		eqm_id,
		emp_id,
		inpt_qy,
		prod_qy,
		infer_qy,
		pass_qy,
		wk_fr_dt,
		wk_to_dt,
		rm
	) VALUES (
		?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
		STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'),
		NULL,
		NULL
	)
`;

module.exports = {
  procCtrlNewId,
  procCtrlInsert,
};
