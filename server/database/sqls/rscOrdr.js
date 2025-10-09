// Table : rsc_ordr <자재 발주>
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )
/**
 * 
 * CREATE TABLE RSC_ORDR (
	`RSC_ORDR_ID`	VARCHAR(100)	NOT NULL,
	`CO_ID`	VARCHAR(100)	NOT NULL	COMMENT '업체 테이블 FK',
	`EMP_ID`	VARCHAR(100)	NOT NULL	COMMENT '사원 테이블 FK (담당자))',
	`REG_DT`	DATE	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`RM`	VARCHAR(1000)	NULL
);

CREATE TABLE RSC_ORDR_DETA (
	`RSC_ORDR_DETA_ID`	VARCHAR(100)	NOT NULL	COMMENT '특정규칙 + 시퀀스',
	`RSC_ORDR_ID`	VARCHAR(100)	NOT NULL,
	`RSC_ID`	VARCHAR(100)	NOT NULL	COMMENT '자재 테이블 FK',
	`QY`	FLOAT(15,5)	NOT NULL	COMMENT '규격, 단위는 자재 테이블에 있어서 제외',
	`RM`	VARCHAR(1000)	NULL
);
 */

// 자재 발주 조회(rscOrdrModal.vue모달검색조회쿼리)
const selectRscOrdrList = `
SELECT
 a.rsc_nm,
 b.qy,
 d.emp_nm,
 d.emp_id,
 e.co_nm,
 c.reg_dt,
 a.rsc_id,
 b.rsc_ordr_deta_id
FROM rsc a
JOIN rsc_ordr_deta b
ON a.rsc_id = b.rsc_id
JOIN rsc_ordr c
ON b.rsc_ordr_id = c.rsc_ordr_id
JOIN emp d
ON c.emp_id = d.emp_id
JOIN co e
ON c.co_id = e.co_id
WHERE a.rsc_nm LIKE CONCAT('%', ?, '%')
AND b.qy > ?
AND d.emp_nm LIKE CONCAT('%', ?, '%')
AND e.co_nm LIKE CONCAT('%', ?, '%')
AND c.reg_dt >= ?`;

// 자재 발주 상세조회(rscOrdrModal.vue모달검색조회쿼리)
const selectRscOrdrDeta = `
SELECT 
 b.insp_item_nm,
 b.basi_val,
 b.unit,
 b.eror_scope_min,
 b.eror_scope_max
FROM qlty_item_deta a
JOIN qlty_item b
ON a.qlty_item_mng_id = b.qlty_item_mng_id
WHERE b.st = 'P1'
AND a.rsc_id = ?`;



// 자재 발주 등록
const insertRscOrdr = `
INSERT INTO rsc_ordr(
										co_id,
										emp_id,
										reg_dt,
										rm)
VALUES (?, ?, ?, ?)`;

// 자재 발주 상세 등록
const insertRscOrdrDeta = `
INSERT INTO rsc_ordr_deta(
										rsc_ordr_id,
										rsc_id,
										qy,
										rm)
VALUES (?, ?, ?, ?)`;

//
module.exports = {
	selectRscOrdrList,
	insertRscOrdr,
	insertRscOrdrDeta,
	selectRscOrdrDeta,
};
