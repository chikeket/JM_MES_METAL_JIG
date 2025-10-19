// 모달용: 마스터+디테일 JOIN 검색
const wrhsdlvrModalSearch = `
SELECT mas.wrhsdlvr_mas_id, mas.rcvpay_ty, e.emp_nm, mas.wrhous_id, mas.zone_id, mas.lot_no, mas.spec, mas.unit, mas.all_rcvpay_qy, mas.rcvpay_dt, mas.rcvpay_nm,
       mas.prdt_id, p.prdt_nm, mas.prdt_opt_id, o.opt_nm,
       mas.rsc_id, mas.rm,
       det.wrhous_wrhsdlvr_id, det.rcvpay_qy, det.rm as dtl_rm
FROM wrhous_wrhsdlvr_mas mas
LEFT JOIN wrhous_wrhsdlvr det ON mas.wrhsdlvr_mas_id = det.wrhsdlvr_mas_id
LEFT JOIN prdt p ON mas.prdt_id = p.prdt_id
LEFT JOIN prdt_opt o ON mas.prdt_opt_id = o.prdt_opt_id
LEFT JOIN emp e ON mas.emp_id = e.emp_id
WHERE (? = '' OR mas.rcvpay_nm LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR mas.rcvpay_ty = ?)
  AND (? = '' OR mas.emp_id = ?)
  AND (? = '' OR mas.rcvpay_dt = ?)
ORDER BY mas.wrhsdlvr_mas_id DESC
`;

// 단건 마스터
const wrhsdlvrMasterById = `
SELECT wrhsdlvr_mas_id, rcvpay_ty, emp_id, rsc_id, prdt_id, prdt_opt_id, wrhous_id, zone_id, lot_no, spec, unit, all_rcvpay_qy, rcvpay_dt, rm, rcvpay_nm
FROM wrhous_wrhsdlvr_mas WHERE wrhsdlvr_mas_id = ?
`;

// 단건 디테일
const wrhsdlvrDetailByMasId = `
SELECT wrhous_wrhsdlvr_id, wrhsdlvr_mas_id, rsc_rtun_trget_id, rsc_qlty_insp_id, semi_prdt_qlty_insp_id, end_prdt_qlty_insp_id, deli_deta_id, rcvpay_qy, rm
FROM wrhous_wrhsdlvr WHERE wrhsdlvr_mas_id = ?
`;

module.exports = {
  wrhsdlvrModalSearch,
  wrhsdlvrMasterById,
  wrhsdlvrDetailByMasId,
};
