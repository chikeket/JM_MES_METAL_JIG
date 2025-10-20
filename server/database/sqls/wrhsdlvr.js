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
SELECT  wrhsdlvr_mas_id,
        rcvpay_ty,
        emp_id,
        rsc_id,
        prdt_id,
        prdt_opt_id,
        wrhous_id,
        zone_id,
        lot_no,
        spec,
        unit,
        all_rcvpay_qy,
        rcvpay_dt,
        rm,
        rcvpay_nm
FROM wrhous_wrhsdlvr_mas 
WHERE wrhsdlvr_mas_id = ?
`;

// 단건 디테일
const wrhsdlvrDetailByMasId = `
SELECT  d.wrhous_wrhsdlvr_id AS id,
        d.wrhsdlvr_mas_id,
        d.rsc_rtun_trget_id,
        d.rsc_qlty_insp_id,
        d.semi_prdt_qlty_insp_id,
        d.end_prdt_qlty_insp_id,
        d.deli_deta_id,
        d.rcvpay_qy,
        d.rm,
        m.prdt_id,
        m.prdt_opt_id,
        m.rsc_id,
        p.prdt_nm,
        o.opt_nm,
        m.unit,
        m.spec,
        m.rcvpay_ty,
        m.emp_id,
        e.emp_nm,
        m.wrhous_id,
        m.zone_id,
        m.lot_no
FROM wrhous_wrhsdlvr d
LEFT JOIN wrhous_wrhsdlvr_mas m ON d.wrhsdlvr_mas_id = m.wrhsdlvr_mas_id
LEFT JOIN prdt p ON m.prdt_id = p.prdt_id
LEFT JOIN prdt_opt o ON m.prdt_opt_id = o.prdt_opt_id
LEFT JOIN emp e ON m.emp_id = e.emp_id
WHERE d.wrhsdlvr_mas_id = ?
`;

module.exports = {
  wrhsdlvrModalSearch,
  wrhsdlvrMasterById,
  wrhsdlvrDetailByMasId,
};
