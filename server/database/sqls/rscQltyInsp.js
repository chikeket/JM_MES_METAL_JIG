//자재품질검수

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

module.exports = {
    rscQltyInspCreateId,
    rscQltyInspInsert,
};
