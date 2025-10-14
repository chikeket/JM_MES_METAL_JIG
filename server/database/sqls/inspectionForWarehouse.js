// 입출고용 검사서 조회 관련 쿼리들 (기존 rscQltyInsp와 분리)

// 자재 품질 검사서 조회 (입출고용)
const getInspectionForWarehouse = `
SELECT
 a.rsc_qlty_insp_id as insp_no,
 a.rsc_ordr_deta_id,
 a.emp_id,
 b.emp_nm as insp_emp_name,
 f.co_nm,
 d.rsc_nm as item_name,
 d.rsc_id as item_code,
 d.rsc_spec as item_spec,
 d.rsc_unit as item_unit,
 c.rsc_id,
 c.qy,
 a.insp_qy,
 a.pass_qy,
 a.rtngud_qy as fail_qty,
 a.insp_dt as insp_date,
 a.rm as remark,
 CASE 
   WHEN a.pass_qy > 0 OR a.rtngud_qy > 0 THEN '완료'
   ELSE '대기'
 END as insp_status,
 '자재' as item_type,
 'materialQuality' as insp_type
FROM rsc_qlty_insp a
JOIN emp b ON a.emp_id = b.emp_id
JOIN rsc_ordr_deta c ON a.rsc_ordr_deta_id = c.rsc_ordr_deta_id
JOIN rsc d ON c.rsc_id = d.rsc_id
JOIN rsc_ordr e ON c.rsc_ordr_id = e.rsc_ordr_id
JOIN co f ON e.co_id = f.co_id
WHERE (a.pass_qy > 0 OR a.rtngud_qy > 0)
AND (? IS NULL OR ? = '' OR d.rsc_id LIKE CONCAT('%', ?, '%'))
AND (? IS NULL OR ? = '' OR d.rsc_nm LIKE CONCAT('%', ?, '%'))
AND (? IS NULL OR ? = '' OR b.emp_nm LIKE CONCAT('%', ?, '%'))
AND (? IS NULL OR ? = '' OR a.insp_dt >= ?)
ORDER BY a.insp_dt DESC
`;

// 반제품 품질 검사서 조회 (입출고용) - 필요시 추가
const getSemiInspectionForWarehouse = `
-- 반제품 품질 검사서 조회 쿼리 (테이블 구조에 맞게 수정 필요)
SELECT 
  'semi_inspection' as placeholder
`;

// 완제품 품질 검사서 조회 (입출고용) - 필요시 추가
const getFinishedInspectionForWarehouse = `
-- 완제품 품질 검사서 조회 쿼리 (테이블 구조에 맞게 수정 필요)
SELECT 
  'finished_inspection' as placeholder
`;

module.exports = {
  getInspectionForWarehouse,
  getSemiInspectionForWarehouse,
  getFinishedInspectionForWarehouse,
};
