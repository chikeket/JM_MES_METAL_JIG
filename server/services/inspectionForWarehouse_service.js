const mariadb = require("../database/mapper.js");

// 입출고용 검사서 조회 (자재 품질 검사)
const getInspectionForWarehouse = async (Info) => {
  console.log("[inspectionForWarehouse_service] 검사서 조회 요청:", Info);

  // 검색 조건 처리
  const item_code = Info.item_code || "";
  const item_name = Info.item_name || "";
  const emp_nm = Info.emp_nm || "";
  const insp_dt = Info.insp_dt || "";

  // 쿼리 파라미터: 각 조건에 대해 NULL 체크와 실제 값 비교를 위해 3번씩 반복
  let data = [
    item_code,
    item_code,
    item_code, // item_code 조건
    item_name,
    item_name,
    item_name, // item_name 조건
    emp_nm,
    emp_nm,
    emp_nm, // emp_nm 조건
    insp_dt,
    insp_dt,
    insp_dt, // insp_dt 조건
  ];

  console.log("[inspectionForWarehouse_service] 쿼리 파라미터:", data);

  try {
    const result = await mariadb.query("getInspectionForWarehouse", data);
    console.log(
      "[inspectionForWarehouse_service] 조회 결과 건수:",
      result?.length || 0
    );
    return result || [];
  } catch (error) {
    console.error("[inspectionForWarehouse_service] 검사서 조회 오류:", error);
    return [];
  }
};

// 반제품 품질 검사서 조회 (필요시 구현)
const getSemiInspectionForWarehouse = async (Info) => {
  console.log(
    "[inspectionForWarehouse_service] 반제품 검사서 조회 요청:",
    Info
  );
  // TODO: 반제품 검사서 테이블이 있다면 구현
  return [];
};

// 완제품 품질 검사서 조회 (필요시 구현)
const getFinishedInspectionForWarehouse = async (Info) => {
  console.log(
    "[inspectionForWarehouse_service] 완제품 검사서 조회 요청:",
    Info
  );
  // TODO: 완제품 검사서 테이블이 있다면 구현
  return [];
};

// 통합 검사서 조회 (검사서 종류에 따라 다른 테이블 조회)
const getAllInspectionsForWarehouse = async (Info) => {
  console.log("[inspectionForWarehouse_service] 통합 검사서 조회 요청:", Info);

  const inspType = Info.insp_type || "";

  try {
    let result = [];

    switch (inspType) {
      case "materialQuality":
        result = await getInspectionForWarehouse(Info);
        break;
      case "semiQuality":
        result = await getSemiInspectionForWarehouse(Info);
        break;
      case "finishedQuality":
        result = await getFinishedInspectionForWarehouse(Info);
        break;
      case "":
      default:
        // 전체 조회 시 자재 검사서만 조회 (다른 테이블은 필요시 추가)
        result = await getInspectionForWarehouse(Info);
        break;
    }

    return result;
  } catch (error) {
    console.error(
      "[inspectionForWarehouse_service] 통합 검사서 조회 오류:",
      error
    );
    return [];
  }
};

module.exports = {
  getInspectionForWarehouse,
  getSemiInspectionForWarehouse,
  getFinishedInspectionForWarehouse,
  getAllInspectionsForWarehouse,
};
