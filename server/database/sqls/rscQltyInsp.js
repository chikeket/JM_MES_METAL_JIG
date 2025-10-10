//자재품질검수

// 자재 품질 상세조회(rscOrdrModal.vue모달검색조회쿼리)
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

//자재 품질 검수 ID생성 쿼리
const rscQltyInspCreateId = `
SELECT CONCAT('RSC_QLTY_INSP', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(rsc_qlty_insp_id, -3)),0) + 1, 3, '0'))) "rsc_qlty_insp_id"
FROM rsc_qlty_insp
WHERE SUBSTR(rsc_qlty_insp_id, 14, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

//자재 품질 검수 인서트쿼리
const rscQltyInspInsert = `
INSERT INTO rsc_qlty_insp(
 rm,
 rsc_ordr_deta_id,
 emp_id,
 rtngud_qy,
 pass_qy,
 insp_qy,
 insp_dt,
 rsc_qlty_insp_id)
VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

//자재 품질 검사 테이블 조회
const rscQltyInspSelect = `
SELECT
 a.rsc_qlty_insp_id,
 a.rsc_ordr_deta_id,
 a.emp_id,
 b.emp_nm,
 d.rsc_nm,
 c.rsc_id,
 c.qy,
 a.insp_qy,
 a.pass_qy,
 a.rtngud_qy,
 a.insp_dt,
 a.rm
FROM rsc_qlty_insp a
JOIN emp b
ON a.emp_id = b.emp_id
JOIN rsc_ordr_deta c
ON a.rsc_ordr_deta_id = c.rsc_ordr_deta_id
JOIN rsc d
ON c.rsc_id = d.rsc_id
WHERE b.emp_nm LIKE CONCAT('%', ?, '%')
AND a.insp_dt >= ?`

//자재 품질 검사 테이블 수정
const rscQltyInspUpdate = `
UPDATE rsc_qlty_insp
SET
 rm = ?,
 rsc_ordr_deta_id = ?,
 emp_id = ?,
 rtngud_qy = ?,
 pass_qy = ?,
 insp_qy = ?,
 insp_dt = ?
WHERE rsc_qlty_insp_id = ?
`

//자재 품질 검사 테이블 삭제
const rscQltyInspDelete = `
DELETE
FROM rsc_qlty_insp
WHERE rsc_qlty_insp_id = ?
`

module.exports = {
    selectRscOrdrDeta,
    rscQltyInspCreateId,
    rscQltyInspInsert,
    rscQltyInspSelect,
    rscQltyInspUpdate,
    rscQltyInspDelete,
};
