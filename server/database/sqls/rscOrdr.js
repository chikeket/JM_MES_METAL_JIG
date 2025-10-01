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

// 자재 발주 조회
const selectRscOrdrList = `SELECT RSC_ORDR_ID,
CO_ID,
EMP_ID,
REG_DT,
RM
FROM  RSC_ORDR O JOIN RSC_ORDR_DETA_ID D
                  ON `;


// 자재 발주 등록
const insertRscOrdr = `
INSERT INTO rsc_ordr()`;


//
module.exports = {
	selectRscOrdrList,
};
