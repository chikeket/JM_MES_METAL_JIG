const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// 수량 update (입고/출고)
async function updateQty(rows) {
  const conn = await mariadb.getConnection();
  await conn.beginTransaction();
  try {
    for (const row of rows) {
      // wrhous_wrhsdlvr_mas, wrhous_wrhsdlvr, lot_stc_precon 모두 update
      // 1. wrhous_wrhsdlvr_mas
      console.log(rows);
      await conn.query(sqlList["updateWrhousdlvrMasQty"], [
        row.qty,
        row.wrhsdlvr_mas_id,
      ]);
      // 2. wrhous_wrhsdlvr
      await conn.query(sqlList["updateWrhousdlvrDetailQty"], [
        row.qty,
        row.wrhsdlvr_mas_id,
      ]);
      // 3. lot_stc_precon: 입고/출고 모드에 따라 IST_QY/OUST_QY 변경
      if (row.mode === "in") {
        await conn.query(sqlList["updateLotStcPreconIstQty"], [
          row.qty,
          row.wrhsdlvr_mas_id,
        ]);
      } else if (row.mode === "out") {
        await conn.query(sqlList["updateLotStcPreconOustQty"], [
          row.qty,
          row.wrhsdlvr_mas_id,
        ]);
      }
    }
    conn.commit();
    return { affectedRows: rows.length };
  } finally {
    conn.release();
  }
}

// 창고 입출고 삭제
async function deleteWrhousdlvr(wrhsdlvrMasId) {
  const conn = await mariadb.getConnection();
  await conn.beginTransaction();
  try {
    await conn.query(sqlList["deleteMaterialWithdrawalByMasId"], [
      wrhsdlvrMasId,
    ]);
    await conn.query(sqlList["deleteWrhousdlvrDetailsByMasId"], [
      wrhsdlvrMasId,
    ]);
    await conn.query(sqlList["deleteLotStcPreconByMasId"], [wrhsdlvrMasId]);
    await conn.query(sqlList["deleteWrhousdlvrMasById"], [wrhsdlvrMasId]);

    conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * LOT 할당 결과를 프론트로 반환할 때 lot_no가 반드시 포함되도록 반환하는 예시
 * @param {Array} allocations - LOT 할당 결과 배열
 * @param {Object} summary - 할당 요약 정보
 * @returns {Object} 프론트 응답 객체
 */
function buildLotAllocationResponse(allocations, summary) {
  // allocations 배열의 각 객체에 lot_no가 포함되어 있는지 확인
  const safeAllocations = allocations.map((a) => ({
    lot_no: a.lot_no || a.LOT_NO || a.lot || "",
    allocated_qty: a.allocated_qty,
    warehouse_id: a.warehouse_id || "",
    zone_id: a.zone_id || "",
  }));
  return {
    success: true,
    allocations: safeAllocations,
    summary: summary,
  };
}
/**
 * 자재ID만으로 LOT_STC_PRECON에서 재고가 남아있는 LOT_NO를 선입선출로 조회하는 함수
 * @param {string} rscId - 자재ID
 * @returns {Promise<Array>} 사용가능 LOT 리스트 [{lot_no, now_stock}]
 */
async function getAvailableLotsByRscId(rscId) {
  const conn = await mariadb.getConnection();
  try {
    const lots = await conn.query(
      `SELECT LOT_NO, NOW_STC_QY FROM LOT_STC_PRECON WHERE RSC_ID = ? AND NOW_STC_QY > 0 ORDER BY LOT_NO ASC`,
      [rscId]
    );
    return lots;
  } finally {
    conn.release();
  }
}
/**
 * 자재 불출 처리 시 자재 리스트에 LOT 번호를 매핑하여 반환하는 연동 예시
 * @param {Array} materials - 자재 리스트 (각 행에 rsc_id 필드 필요)
 * @returns {Promise<Array>} LOT이 매핑된 자재 리스트
 */
async function processMaterialWithdrawalWithLotNo(materials) {
  const materialsWithLot = await assignLotToMaterials(materials);
  return materialsWithLot;
}
/**
 * 자재 리스트에 LOT 번호를 매핑하는 함수 (완제품과 동일 로직)
 * @param {Array} materials - 자재 리스트 (각 행에 rsc_id 필드 필요)
 * @returns {Promise<Array>} LOT이 매핑된 자재 리스트
 */
async function assignLotToMaterials(materials) {
  for (const material of materials) {
    if (!material.rsc_id) continue;
    const lotStocks = await getLotStockByRscId(material.rsc_id);
    // lot_no, LOT_NO 모두 체크, 없으면 ''
    const firstLot =
      lotStocks.length > 0
        ? lotStocks[0].lot_no || lotStocks[0].LOT_NO || ""
        : "";
    material.lot_no = firstLot;
    material.lot = firstLot; // 프론트/백엔드 일관성 위해 둘 다
    // 필요시 material.lot_allocations = lotStocks; // 전체 LOT별 재고 정보 저장
  }
  return materials;
}
/**
 * 자재ID로 LOT별 자재 재고 현황을 조회하는 함수
 * @param {string} rscId - 자재ID
 * @returns {Promise<Array>} LOT별 자재 재고 리스트 [{lot_no, wrhsdlvr_mas_id, now_stock}]
 */
async function getLotStockByRscId(rscId) {
  const conn = await mariadb.getConnection();
  try {
    // 1. 창고 입출고 마스터에서 자재ID로 LOT_NO, WRHSDLVR_MAS_ID 조회
    const masRows = await conn.query(
      `SELECT WRHSDLVR_MAS_ID, LOT_NO FROM WRHOUS_WRHSDLVR_MAS WHERE RSC_ID = ? AND LOT_NO IS NOT NULL`,
      [rscId]
    );
    const result = [];
    // 2. 각 마스터ID로 LOT_STC_PRECON에서 재고 수량 조회
    for (const mas of masRows) {
      const lotRows = await conn.query(
        `SELECT NOW_STC_QY FROM LOT_STC_PRECON WHERE WRHSDLVR_MAS_ID = ?`,
        [mas.WRHSDLVR_MAS_ID]
      );
      result.push({
        lot_no: mas.lot_no || mas.LOT_NO || "",
        wrhsdlvr_mas_id: mas.WRHSDLVR_MAS_ID || "",
        now_stock: lotRows[0]?.NOW_STC_QY ?? 0,
      });
    }
    return result;
  } finally {
    conn.release();
  }
}
/**
 * 자재 불출 처리 예시: BOM 자재 리스트에 LOT 할당 결과 반영
 * @param {Array} bomMaterials - BOM 자재 리스트
 * @param {string} wrhsdlvrMasId - 창고 입출고 마스터ID
 * @returns {Promise<Array>} LOT이 반영된 BOM 자재 리스트
 */
async function processMaterialWithdrawalWithLot(bomMaterials, wrhsdlvrMasId) {
  // LOT 할당 결과 반영
  const bomMaterialsWithLot = await assignLotToBomMaterials(
    bomMaterials,
    wrhsdlvrMasId
  );
  // 이후 bomMaterialsWithLot를 프론트로 반환하거나 화면에 표시
  return bomMaterialsWithLot;
}
/**
 * BOM 자재 리스트에 LOT 할당 결과를 반영하는 함수 예시
 * @param {Array} bomMaterials - BOM 자재 리스트
 * @param {string} wrhsdlvrMasId - 창고 입출고 마스터ID
 * @returns {Promise<Array>} LOT이 매핑된 BOM 자재 리스트
 */
async function assignLotToBomMaterials(bomMaterials, wrhsdlvrMasId) {
  // LOT별 재고 현황 조회 및 전체 수량 합산
  for (const material of bomMaterials) {
    // 각 자재별로 LOT별 할당 결과 계산
    const allocations = await allocateLotForMaterialWithdrawal(
      wrhsdlvrMasId,
      material.qty
    );
    // 첫 번째 할당 LOT을 material.lot에 매핑 (여러 LOT 분할 시 로직 확장 가능)
    material.lot = allocations.length > 0 ? allocations[0].lot_no : "";
    // 필요시 material.lot_allocations = allocations; // 전체 할당 결과 저장
  }
  return bomMaterials;
}
/**
 * 자재 불출 시 LOT별로 출고 수량을 분할 할당하는 함수
 * @param {string} wrhsdlvrMasId - 창고 입출고 마스터ID
 * @param {number} withdrawalQty - 출고 요청 수량
 * @returns {Promise<Array>} LOT별 할당 결과 [{lot_no, allocated_qty, wrhsdlvr_mas_id, rsc_id, warehouse_id, zone_id}]
 */
async function allocateLotForMaterialWithdrawal(wrhsdlvrMasId, withdrawalQty) {
  const lotStocks = await getLotRscStockByMasId(wrhsdlvrMasId);
  let remainingQty = withdrawalQty;
  const allocations = [];
  // lotStocks의 lot_no가 undefined/null인 경우 LOT_NO, 또는 둘 다 없으면 빈 값
  for (const lot of lotStocks) {
    const lotNo = lot.lot_no || lot.LOT_NO || "";
    if (!lotNo) continue; // lot_no가 없으면 건너뜀
    if (remainingQty <= 0) break;
    const allocQty = Math.min(lot.now_stock, remainingQty);
    if (allocQty > 0) {
      allocations.push({
        lot_no: lotNo,
        allocated_qty: allocQty,
        wrhsdlvr_mas_id: lot.wrhsdlvr_mas_id,
        rsc_id: lot.rsc_id,
        warehouse_id: lot.wrhous_id,
        zone_id: lot.zone_id,
      });
      remainingQty -= allocQty;
    }
  }
  return allocations;
}

/**
 * 특정 창고 입출고 마스터ID로 LOT별 자재 재고 현황 조회
 * @param {string} wrhsdlvrMasId
 * @returns {Promise<Array>} LOT별 재고 현황 리스트
 */
const getLotRscStockByMasId = async (wrhsdlvrMasId) => {
  const conn = await mariadb.getConnection();
  try {
    const rows = await conn.query(sqlList["selectLotRscStockByMasId"], [
      wrhsdlvrMasId,
    ]);
    return rows;
  } finally {
    conn.release();
  }
};

// 검사서ID로 남은 수량(remaining_qty) 단건 조회 API용 래퍼
async function getInspectionRemainingQty({ inspect_id, item_type }) {
  if (!inspect_id || !item_type) return { remaining_qty: 0 };
  let remaining_qty = 0;
  let itemName = "";
  const typeMap = { 자재: "E1", 반제품: "E2", 완제품: "E3" };
  const itemTypeCode = typeMap[item_type] || item_type;
  if (itemTypeCode === "E1") {
    const result = await mariadb.query("selectRscInspectionDetails", [
      inspect_id,
    ]);
    if (result.length > 0) {
      remaining_qty = Number(result[0].remaining_qty);
      itemName = result[0].item_name || "";
    }
  } else if (itemTypeCode === "E2") {
    const result = await mariadb.query("selectSemiInspectionListById", [
      inspect_id,
    ]);
    if (result.length > 0) {
      remaining_qty = Number(result[0].remaining_qty);
      itemName = result[0].item_name || "";
    }
  } else if (itemTypeCode === "E3") {
    const result = await mariadb.query("selectEndPrdtInspectionListById", [
      inspect_id,
    ]);
    if (result.length > 0) {
      remaining_qty = Number(result[0].remaining_qty);
      itemName = result[0].item_name || "";
    }
  }
  return { remaining_qty, item_name: itemName };
}
// 가용 수량 단건 조회 API용 래퍼
async function getAvailableQty({ item_type, item_code, item_opt_code = "" }) {
  const qty = await getAvailableQtyForItem({
    item_type,
    item_code,
    item_opt_code,
  });
  return { available_qty: Number(qty || 0) };
}
// 품목별(필요시 옵션 포함) 현재 가용 수량 계산
const getAvailableQtyForItem = async ({
  item_type,
  item_code,
  item_opt_code = "",
}) => {
  // selectAvailableLots 쿼리 파라미터 9개로 맞춤
  let params = [];
  if (item_type === "E1") {
    // 자재
    params = ["E1", "E1", "E1", item_code || "", item_code, "", "", "", ""];
  } else if (item_type === "E2") {
    // 반제품
    params = ["E2", "E2", "E2", "", "", item_code || "", item_code, "", ""];
  } else if (item_type === "E3") {
    // 완제품
    params = [
      "E3",
      "E3",
      "E3",
      "",
      "",
      item_code || "",
      item_code,
      item_opt_code || "",
      item_opt_code,
    ];
  }
  const lots = await mariadb.query("selectAvailableLots", params);
  // LOT별 가용수량을 합산(출고 전용이면 LOT 단위로도 활용 가능)
  const total = (lots || []).reduce(
    (sum, lot) => sum + Number(lot.available_qty || 0),
    0
  );
  return total; // 숫자
};

// 안전한 UUID 생성 (uuid 패키지 미설치 상황 대비)
let uuidv4;
try {
  uuidv4 = require("uuid").v4;
} catch (err) {
  const crypto = require("crypto");
  // crypto.randomUUID가 있으면 사용, 없으면 타임스탬프 기반 ID 생성
  uuidv4 = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

// 도우미 함수: 객체의 키를 소문자로 정규화 (클라이언트 대소문자 호환성)
const toLowerKeys = (obj) => {
  if (!obj || typeof obj !== "object") return {};
  return Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase()] = obj[k];
    return acc;
  }, {});
};

// 안전한 숫자 변환 함수 (쉼표가 포함된 문자열 등 처리)
const toNumberSafe = (v, def = 0) => {
  if (v == null) return def;
  if (typeof v === "number") return Number.isFinite(v) ? v : def;
  if (typeof v === "string") {
    const s = v.replace(/,/g, "").trim(); // 쉼표 제거 후 공백 제거
    const n = Number(s);
    return Number.isFinite(n) ? n : def;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

// 전체 창고 목록 조회 (품목 유형별 필터링 가능)
const getAllWarehouses = async (info = {}) => {
  console.log("[wrhousdlvr_service] getAllWarehouses 호출됨, info:", info);

  const item_type_raw = (info.item_type ?? "").trim() || null;

  // 매핑: 화면용 한글 -> DB 코드
  const typeMap = {
    자재: "E1",
    반제품: "E2",
    완제품: "E3",
    E1: "E1",
    E2: "E2",
    E3: "E3",
  };

  const item_type = item_type_raw
    ? typeMap[item_type_raw] || item_type_raw
    : null;

  console.log("[wrhousdlvr_service] item_type_raw:", item_type_raw);
  console.log("[wrhousdlvr_service] mapped item_type:", item_type);

  try {
    let result;

    if (item_type) {
      // 품목 유형별 창고 필터링 - 기존 방식(sqlList 별칭) 사용
      console.log(
        "[wrhousdlvr_service] 별칭 방식으로 특정 품목유형 창고 조회:",
        item_type
      );
      result = await mariadb.query("getWarehousesByItemType", [item_type]);
    } else {
      // 전체 창고 목록 - 기존 방식(sqlList 별칭) 사용
      console.log("[wrhousdlvr_service] 별칭 방식으로 전체 창고 조회");
      result = await mariadb.query("getWarehousesByNone");
    }

    console.log("[wrhousdlvr_service] getAllWarehouses result:", result);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error("[wrhousdlvr_service] getAllWarehouses error:", err);
    throw err;
  }
};

// 전체 로케이션 목록 조회 (품목 유형별 필터링 가능)
const getAllLocations = async (info = {}) => {
  console.log("[wrhousdlvr_service] getAllLocations 호출됨, info:", info);

  const warehouse_id = (info.warehouse_id ?? "").trim() || null;
  console.log("[wrhousdlvr_service] warehouse_id:", warehouse_id);

  try {
    let result;

    if (warehouse_id) {
      // 특정 창고의 위치 조회 - 기존 방식(sqlList 별칭) 사용
      console.log(
        "[wrhousdlvr_service] 별칭 방식으로 특정 창고 위치 조회:",
        warehouse_id
      );
      result = await mariadb.query("getLocationsByWarehouse", [warehouse_id]);
    } else {
      // 전체 위치 조회 - 기존 방식(sqlList 별칭) 사용
      console.log("[wrhousdlvr_service] 별칭 방식으로 전체 위치 조회");
      result = await mariadb.query("getLocationsByNone");
    }

    console.log("[wrhousdlvr_service] getAllLocations result:", result);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error("[wrhousdlvr_service] getAllLocations error:", err);
    throw err;
  }
};

// 창고 입출고 거래 목록 조회 (로그인 사용자 기준 필터링)
const getTransactionList = async (Info) => {
  const info = toLowerKeys(Info || {});
  const txn_type = (info.txn_type ?? "").trim() || null; // 'IN' 또는 'OUT'
  const item_type = (info.item_type ?? "").trim() || null;
  const item_code = (info.item_code ?? "").trim() || null;
  const item_name = (info.item_name ?? "").trim() || null;
  const inspect_id = (info.inspect_id ?? "").trim() || null;
  const emp_id = (info.emp_id ?? "").trim() || null; // 로그인 사용자 ID
  const reg_dt = (info.reg_dt ?? "").trim() || null;

  // SQL 파라미터 배열 (각 조건이 2개씩 들어감: IS NULL 체크용과 실제 값 비교용)
  const params = [
    txn_type,
    txn_type,
    item_type,
    item_type,
    item_code,
    item_code,
    item_name,
    item_name,
    inspect_id,
    inspect_id,
    emp_id,
    emp_id,
    reg_dt,
    reg_dt,
  ];

  console.log("[wrhousdlvr_service] getTransactionList params ->", params);
  const result = await mariadb.query("selectWrhousTransactionList", params);
  return result;
};

// 검사서 목록 조회 (입출고 가능한 검사 완료 품목들)
const getInspectionList = async (Info) => {
  const info = toLowerKeys(Info || {});
  const item_type = (info.item_type ?? "").trim() || null;
  const item_code = (info.item_code ?? "").trim() || null;
  const item_name = (info.item_name ?? "").trim() || null;
  const inspect_id = (info.inspect_id ?? "").trim() || null;
  const inspect_dt = (info.inspect_dt ?? "").trim() || null;

  const params = [
    item_type,
    item_type,
    item_code,
    item_code,
    item_name,
    item_name,
    inspect_id,
    inspect_id,
    inspect_dt,
    inspect_dt,
  ];

  console.log("[wrhousdlvr_service] getInspectionList params ->", params);
  const result = await mariadb.query("selectInspectionList", params);

  // 각 검사서별로 available_qty 계산해서 응답에 포함
  const enhancedResult = [];
  for (const inspection of result) {
    try {
      const availableQtyQuery = `
        SELECT IFNULL(SUM(CASE WHEN wm.RCVPAY_TY = 'S1' THEN wm.ALL_RCVPAY_QY ELSE -wm.ALL_RCVPAY_QY END), 0) AS available_qty
        FROM WRHOUS_WRHSDLVR_MAS wm
        WHERE wm.INSPECT_ID = ? AND wm.DEL_YN = 'N'
      `;
      const availableQtyResult = await mariadb.query(availableQtyQuery, [
        inspection.INSP_NO,
      ]);
      const availableQty = availableQtyResult[0]?.available_qty || 0;
      enhancedResult.push({
        ...inspection,
        available_qty: Number(availableQty),
        available_qty_display: `${availableQty} ${inspection.UNIT || "EA"}`,
      });
    } catch (err) {
      enhancedResult.push({
        ...inspection,
        available_qty: 0,
        available_qty_display: `0 ${inspection.UNIT || "EA"}`,
      });
    }
  }
  return enhancedResult;
};

// 창고 입출고 거래 등록/수정 통합 처리 (Upsert)
const saveTransaction = async ({ transactionList, emp_id = null } = {}) => {
  try {
    console.log(
      "[wrhousdlvr_service] saveTransaction 호출됨 - 새로운 통합 로직 적용"
    );
    console.log("[wrhousdlvr_service] 입력 데이터:", {
      transactionListLength: transactionList?.length || 0,
      emp_id,
      firstTransaction: transactionList?.[0] || null,
    });

    // 기존 API 호환을 위한 데이터 변환 및 새로운 processTransactions 호출
    const result = await processTransactions({
      transactionList: transactionList || [],
      emp_id: emp_id || "EMP_001",
    });

    console.log("[wrhousdlvr_service] saveTransaction 결과:", result);
    return result;
  } catch (error) {
    console.error("[wrhousdlvr_service] saveTransaction 오류:", error);
    console.error("[wrhousdlvr_service] 오류 스택:", error.stack);
    return {
      success: false,
      error: "거래 저장 중 오류가 발생했습니다.",
      details: error.message,
    };
  }
};

// 품목별 현재 재고 조회 (개선된 버전)
const getInventoryStatusByType = async (
  itemType,
  itemCode,
  itemOptCode = ""
) => {
  try {
    console.log("[wrhousdlvr_service] getInventoryStatusByType ->", {
      itemType,
      itemCode,
      itemOptCode,
    });

    let result = [];

    if (itemType === "E1") {
      // 자재 재고 조회
      result = await mariadb.query("selectRscInventoryStatus", [itemCode]);
    } else {
      // 반제품/완제품 재고 조회
      result = await mariadb.query("selectPrdtInventoryStatus", [
        itemCode,
        itemOptCode,
        itemOptCode,
      ]);
    }

    console.log("[wrhousdlvr_service] 재고 조회 결과:", result.length, "건");
    return result;
  } catch (error) {
    console.error("[wrhousdlvr_service] 재고 조회 실패:", error);
    return [];
  }
};

// 품목별 현재 재고 조회 (기존 호환성 유지)
const getInventoryStatus = async (itemCode) => {
  if (!itemCode) {
    return [];
  }

  console.log("[wrhousdlvr_service] getInventoryStatus itemCode ->", itemCode);
  // 마스터-디테일 구조에 맞게 파라미터 2개 전달 (RSC_ID와 PRDT_ID 모두 체크)
  const result = await mariadb.query("selectInventoryStatus", [
    itemCode,
    itemCode,
  ]);
  return result;
};

// 품목별 입출고 이력 조회 (품목 유형별 분기 처리)
const getItemTransactionHistory = async (
  itemCode,
  itemType = "E3",
  itemOptCode = ""
) => {
  if (!itemCode) {
    return [];
  }

  console.log("[wrhousdlvr_service] getItemTransactionHistory ->", {
    itemCode,
    itemType,
    itemOptCode,
  });

  // 품목 유형에 따라 파라미터 전달 (E1: 자재, E2/E3: 반제품/완제품)
  const result = await mariadb.query("selectItemTransactionHistory", [
    itemType, // 첫 번째 조건용
    itemCode, // 자재 코드 또는 제품 코드
    itemType, // 두 번째 조건용
    itemCode, // 제품 코드
    itemOptCode, // 옵션 코드 (빈 문자열 체크용)
    itemOptCode, // 실제 옵션 코드
  ]);
  return result;
};

// 완제품 품질검사서 목록 조회
const getFinishedQualityInspectionList = async (
  item_code,
  item_name,
  insp_status
) => {
  try {
    const normalizedItemCode = (item_code || "").trim();
    const normalizedItemName = (item_name || "").trim();
    const normalizedInspStatus = (insp_status || "").trim();

    console.log("[wrhousdlvr_service] 완제품 검사서 조회 파라미터:", {
      normalizedItemCode,
      normalizedItemName,
      normalizedInspStatus,
    });

    // SQL에서 4개의 파라미터만 사용 (item_code 2개, item_name 2개)
    const params = [
      normalizedItemCode, // ? = '' 체크용
      normalizedItemCode, // LIKE 검색용
      normalizedItemName, // ? = '' 체크용
      normalizedItemName, // LIKE 검색용
    ];

    const results = await mariadb.query("selectEndPrdtInspectionList", params);

    console.log(
      "[wrhousdlvr_service] 완제품 검사서 조회 결과:",
      results.length + "건"
    );

    // 각 검사서별로 available_qty 계산해서 응답에 포함
    const enhancedResults = [];
    for (const inspection of results) {
      let available_qty = 0;
      try {
        available_qty = await getAvailableQtyForItem({
          item_type: "E3",
          item_code: inspection.item_code,
          item_opt_code: inspection.opt_code || "",
        });
      } catch (err) {
        available_qty = 0;
      }
      enhancedResults.push({
        ...inspection,
        available_qty,
        available_qty_display: `${available_qty} ${
          inspection.item_unit || "EA"
        }`,
      });
    }
    return enhancedResults;
  } catch (error) {
    console.error("[wrhousdlvr_service] 완제품 검사서 조회 실패:", error);
    throw error;
  }
};

// 반제품 품질검사서 목록 조회 (임시 구현)
const getSemiQualityInspectionList = async (
  item_code,
  item_name,
  insp_status
) => {
  try {
    const normalizedItemCode = (item_code || "").trim();
    const normalizedItemName = (item_name || "").trim();
    const normalizedInspStatus = (insp_status || "").trim();
    console.log("[wrhousdlvr_service] 반제품 검사서 조회", {
      normalizedItemCode,
      normalizedItemName,
      normalizedInspStatus,
    });

    // SQL에서 4개의 파라미터만 사용 (item_code 2개, item_name 2개)
    const params = [
      normalizedItemCode, // ? = '' 체크용
      normalizedItemCode, // LIKE 검색용
      normalizedItemName, // ? = '' 체크용
      normalizedItemName, // LIKE 검색용
    ];

    const results = await mariadb.query("selectSemiInspectionList", params);

    console.log(
      "[wrhousdlvr_service] 반제품 검사서 조회 결과:",
      results.length + "건"
    );
    // 각 검사서별로 available_qty 계산해서 응답에 포함
    const enhancedResults = [];
    for (const inspection of results) {
      let available_qty = 0;
      try {
        available_qty = await getAvailableQtyForItem({
          item_type: "E2",
          item_code: inspection.item_code,
          item_opt_code: inspection.opt_code || "",
        });
      } catch (err) {
        available_qty = 0;
      }
      enhancedResults.push({
        ...inspection,
        available_qty,
        available_qty_display: `${available_qty} ${
          inspection.item_unit || "EA"
        }`,
      });
    }
    return enhancedResults;
  } catch (error) {
    console.error("[wrhousdlvr_service] 반제품 검사서 조회 실패:", error);
    throw error;
  }
};

// 자재 검사서 목록 조회 (기존 함수명 유지)
const getRscQualityInspectionList = async (
  item_code,
  item_name,
  insp_status
) => {
  try {
    const normalizedItemCode = (item_code || "").trim();
    const normalizedItemName = (item_name || "").trim();
    const normalizedInspStatus = (insp_status || "").trim();

    console.log("[wrhousdlvr_service] 자재 검사서 조회 파라미터:", {
      normalizedItemCode,
      normalizedItemName,
      normalizedInspStatus,
    });

    // SQL에서 4개의 파라미터만 사용 (item_code 2개, item_name 2개)
    const params = [
      normalizedItemCode, // ? = '' 체크용
      normalizedItemCode, // LIKE 검색용
      normalizedItemName, // ? = '' 체크용
      normalizedItemName, // LIKE 검색용
    ];

    const results = await mariadb.query("selectRscInspectionList", params);

    console.log(
      "[wrhousdlvr_service] 자재 검사서 조회 결과:",
      results.length + "건"
    );

    // 각 검사서별로 available_qty 계산해서 응답에 포함
    const enhancedResults = [];
    for (const inspection of results) {
      let available_qty = 0;
      try {
        available_qty = await getAvailableQtyForItem({
          item_type: "E1",
          item_code: inspection.item_code,
        });
      } catch (err) {
        available_qty = 0;
      }
      enhancedResults.push({
        ...inspection,
        available_qty,
        available_qty_display: `${available_qty} ${
          inspection.item_unit || "EA"
        }`,
      });
    }
    return enhancedResults;
  } catch (error) {
    console.error("[wrhousdlvr_service] 자재 검사서 조회 실패:", error);
    throw error;
  }
};

// 납품 상세 목록 조회 (임시 구현)
const getDeliveryDetailList = async (item_code, item_name, delivery_status) => {
  try {
    const normalizedItemCode = (item_code || "").trim();
    const normalizedItemName = (item_name || "").trim();
    const normalizedDeliStatus = (delivery_status || "").trim();
    console.log("[wrhousdlvr_service] 납품 상세 조회: ", {
      normalizedItemCode,
      normalizedItemName,
      normalizedDeliStatus,
    });

    const params = [
      normalizedItemCode, // ? = '' 체크용
      normalizedItemCode, // LIKE 검색용
      normalizedItemName, // ? = '' 체크용
      normalizedItemName, // LIKE 검색용
    ];

    const results = await mariadb.query("selectWarehouseProducts", params);

    console.log(
      "[wrhousdlvr_service] 완제품 납품 조회 결과:",
      results.length + "건"
    );

    return results;
  } catch (error) {
    console.error("[wrhousdlvr_service] 납품 상세 조회 실패:", error);
    throw error;
  }
};

// 생산지시 상세 목록 조회 (상단 그리드용)
const getProductionOrderDetailsList = async (
  product_code = "",
  product_name = ""
) => {
  try {
    const normalizedProductCode = (product_code || "").trim();
    const normalizedProductName = (product_name || "").trim();

    console.log("[wrhousdlvr_service] 생산지시 상세 목록 조회 파라미터:", {
      normalizedProductCode,
      normalizedProductName,
    });

    const params = [
      normalizedProductCode, // ? = '' 체크용
      normalizedProductCode, // LIKE 검색용
      normalizedProductName, // ? = '' 체크용
      normalizedProductName, // LIKE 검색용
    ];

    const results = await mariadb.query("selectProductionOrderDetails", params);

    console.log(
      "[wrhousdlvr_service] 생산지시 상세 목록 조회 결과:",
      results.length + "건"
    );

    return results.map((item) => ({
      ...item,
      required_qty: toNumberSafe(item.required_qty, 0),
    }));
  } catch (error) {
    console.error("[wrhousdlvr_service] 생산지시 상세 목록 조회 오류:", error);
    throw error;
  }
};

// 특정 생산지시의 BOM 자재 목록 조회 (하단 그리드용)
const getMaterialByProductionOrder = async (prod_drct_deta_id) => {
  try {
    if (!prod_drct_deta_id) {
      throw new Error("생산지시 상세 ID가 필요합니다.");
    }

    console.log("[wrhousdlvr_service] BOM 자재 목록 조회 파라미터:", {
      prod_drct_deta_id,
    });

    const params = [prod_drct_deta_id];

    const results = await mariadb.query(
      "selectMaterialByProductionOrder",
      params
    );

    console.log(
      "[wrhousdlvr_service] BOM 자재 목록 조회 결과:",
      results.length + "건"
    );

    // 원본 데이터 로그 출력
    console.log(
      "[wrhousdlvr_service] BOM 원본 데이터:",
      results.map((item) => ({
        item_name: item.item_name,
        bom_qty_원본: item.bom_qty,
        bom_qty_타입: typeof item.bom_qty,
        required_qty_원본: item.required_qty,
        order_qty_원본: item.order_qty,
      }))
    );

    const processedResults = results.map((item) => ({
      ...item,
      bom_qty: toNumberSafe(item.bom_qty, 0),
      order_qty: toNumberSafe(item.order_qty, 0),
      required_qty: toNumberSafe(item.required_qty, 0),
      withdrawn_qty: toNumberSafe(item.withdrawn_qty, 0),
      remaining_qty: toNumberSafe(item.remaining_qty, 0),
    }));

    // 변환 후 데이터 로그 출력
    console.log(
      "[wrhousdlvr_service] BOM 변환 후 데이터:",
      processedResults.map((item) => ({
        item_name: item.item_name,
        bom_qty_변환후: item.bom_qty,
        required_qty_변환후: item.required_qty,
        order_qty_변환후: item.order_qty,
      }))
    );

    return processedResults;
  } catch (error) {
    console.error("[wrhousdlvr_service] BOM 자재 목록 조회 오류:", error);
    throw error;
  }
};

// 자재 불출 대상 목록 조회 (생산지시 → BOM 기반)
const getMaterialWithdrawalList = async (item_code = "", item_name = "") => {
  try {
    const normalizedItemCode = (item_code || "").trim();
    const normalizedItemName = (item_name || "").trim();

    console.log("[wrhousdlvr_service] 자재 불출 대상 조회 파라미터:", {
      normalizedItemCode,
      normalizedItemName,
    });

    const params = [
      normalizedItemCode, // ? = '' 체크용
      normalizedItemCode, // LIKE 검색용
      normalizedItemName, // ? = '' 체크용
      normalizedItemName, // LIKE 검색용
    ];

    const results = await mariadb.query("selectMaterialWithdrawal", params);

    console.log(
      "[wrhousdlvr_service] 자재 불출 대상 조회 결과:",
      results.length + "건"
    );

    return results.map((item) => ({
      ...item,
      insp_type: "materialWithdrawal",
      insp_no: item.withdrawal_id,
      insp_date: item.order_date,
      pass_qty: item.remaining_qty,
      insp_qty: item.required_qty,
      insp_status: "대기",
      insp_emp_name: item.emp_name,
    }));
  } catch (error) {
    console.error("[wrhousdlvr_service] 자재 불출 대상 조회 실패:", error);
    throw error;
  }
};

// 완제품 납품 대상 목록 조회 (납품상세 기반)
const getDeliveryProductsList = async (item_code = "", item_name = "") => {
  try {
    const normalizedItemCode = (item_code || "").trim();
    const normalizedItemName = (item_name || "").trim();

    console.log("[wrhousdlvr_service] 완제품 납품 대상 조회 파라미터:", {
      normalizedItemCode,
      normalizedItemName,
    });

    const params = [
      normalizedItemCode, // ? = '' 체크용
      normalizedItemCode, // LIKE 검색용
      normalizedItemName, // ? = '' 체크용
      normalizedItemName, // LIKE 검색용
    ];

    const results = await mariadb.query("selectDeliveryProducts", params);

    console.log(
      "[wrhousdlvr_service] 완제품 납품 대상 조회 결과:",
      results.length + "건"
    );
    console.log(
      "[wrhousdlvr_service] 첫 번째 결과 데이터:",
      JSON.stringify(results[0], null, 2)
    );

    return results.map((item) => ({
      ...item,
      insp_type: "deliveryDetail",
    }));
  } catch (error) {
    console.error("[wrhousdlvr_service] 완제품 납품 대상 조회 실패:", error);
    throw error;
  }
};

// 납품 검사서 목록 조회 (임시 구현)
const getDeliveryInspectionList = async (searchParams) => {
  try {
    console.log("[wrhousdlvr_service] 납품 검사서 조회 - 임시 빈 배열 반환");
    return [];
  } catch (error) {
    console.error("[wrhousdlvr_service] 납품 검사서 조회 실패:", error);
    throw error;
  }
};

// 발주 검사서 목록 조회 (임시 구현)
const getOrderInspectionList = async (searchParams) => {
  try {
    console.log("[wrhousdlvr_service] 발주 검사서 조회 - 임시 빈 배열 반환");
    return [];
  } catch (error) {
    console.error("[wrhousdlvr_service] 발주 검사서 조회 실패:", error);
    throw error;
  }
};

// 지시서 검사서 목록 조회 (임시 구현)
const getInstructionInspectionList = async (searchParams) => {
  try {
    console.log("[wrhousdlvr_service] 지시서 검사서 조회 - 임시 빈 배열 반환");
    return [];
  } catch (error) {
    console.error("[wrhousdlvr_service] 지시서 검사서 조회 실패:", error);
    throw error;
  }
};

// === LOT prefix 결정: item_type(E1/E2/E3) 또는 inspType 키워드 → 접두사 ===
const resolveLotPrefix = (type) => {
  switch (type) {
    case "materialQuality":
    case "E1": // 자재
    case "자재":
      return "LOT_RSC_";
    case "semiQuality":
    case "E2": // 반제품
    case "반제품":
      return "LOT_SEMI_";
    case "finishedQuality":
    case "E3": // 완제품
    case "완제품":
      return "LOT_END_";
    default:
      return "LOT_END_";
  }
};

// === LOT 생성 표준 함수(단일 진입점) ===
const generateLotNumberByPrefix = async (prefix) => {
  try {
    // ✅ 별칭 문자열 "createLotno" 사용 + 파라미터 2개 전달 필수
    const rows = await mariadb.query("createLotno", [prefix, prefix]); // <-- 중요
    const lotNo = rows?.[0]?.lot_no;
    if (!lotNo || typeof lotNo !== "string" || lotNo.trim() === "") {
      console.error("[wrhousdlvr_service] LOT 번호 생성 실패: 응답값:", lotNo);
      throw new Error("LOT 번호 생성 실패(응답 비정상)");
    }
    console.log("[wrhousdlvr_service] 생성 LOT:", lotNo);
    return lotNo;
  } catch (err) {
    console.error("[wrhousdlvr_service] LOT 생성 실패:", err);
    throw err;
  }
};

// LOT 번호 생성 함수 (호환성 유지)
const generateLotNumber = async (inspType) => {
  try {
    const prefix = resolveLotPrefix(inspType);
    return await generateLotNumberByPrefix(prefix);
  } catch (error) {
    console.error("[wrhousdlvr_service] LOT 번호 생성 실패:", error);
    throw error;
  }
};

// 창고 거래 ID 생성 함수 (WRH_IN/OUT 형식)
const generateTransactionId = async (txnType) => {
  try {
    const prefix = txnType === "in" ? "WRH_IN_" : "WRH_OUT_";

    // 임시로 고정 ID 생성 (디버깅용)
    const timestamp = Date.now().toString().slice(-6);
    const txnId = `${prefix}${timestamp}`;

    console.log(`[wrhousdlvr_service] 생성된 거래 ID (임시): ${txnId}`);
    return txnId;
  } catch (error) {
    console.error("[wrhousdlvr_service] 거래 ID 생성 실패:", error);
    throw error;
  }
};

// 재고 검증 함수 (출고 전 재고 확인)
const validateInventoryForOutbound = async (itemCode, requestQty) => {
  try {
    console.log(
      `[wrhousdlvr_service] 재고 검증 - 품목: ${itemCode}, 요청수량: ${requestQty}`
    );

    // 신규 마스터-디테일 구조 쿼리 사용 (파라미터 2개 필요)
    const results = await mariadb.query("selectInventoryStatus", [
      itemCode,
      itemCode,
    ]);

    if (!results || results.length === 0) {
      return {
        isValid: false,
        currentStock: 0,
        message: `품목 ${itemCode}의 재고가 없습니다.`,
      };
    }

    const currentStock = results[0].current_stock || 0;
    const isValid = currentStock >= requestQty;

    console.log(
      `[wrhousdlvr_service] 재고 검증 결과 - 현재재고: ${currentStock}, 유효성: ${isValid}`
    );

    return {
      isValid,
      currentStock,
      message: isValid
        ? `재고 확인 완료 (현재: ${currentStock}, 요청: ${requestQty})`
        : `재고 부족 (현재: ${currentStock}, 요청: ${requestQty})`,
    };
  } catch (error) {
    console.error("[wrhousdlvr_service] 재고 검증 실패:", error);
    return {
      isValid: false,
      currentStock: 0,
      message: "재고 검증 중 오류가 발생했습니다.",
    };
  }
};

// 거래 통합 함수 (동일 품목 여러 검사서 통합)
const consolidateTransactions = (transactions) => {
  try {
    console.log(
      `[wrhousdlvr_service] 거래 통합 시작 - 총 ${transactions.length}건`
    );

    const consolidated = {};

    transactions.forEach((txn) => {
      // 통합 키: 거래유형_품목코드_품목유형
      const key = `${txn.txn_type}_${txn.item_code}_${txn.item_type}`;

      if (consolidated[key]) {
        // 기존 거래에 수량 합산 및 검사서 추가
        consolidated[key].qty += Number(txn.qty);
        consolidated[key].insp_nos.push(txn.insp_no);
        consolidated[key].remark += `, ${txn.insp_no}`;
      } else {
        // 새로운 통합 거래 생성
        consolidated[key] = {
          ...txn,
          qty: Number(txn.qty),
          insp_nos: [txn.insp_no],
          remark: `통합거래 - 검사서: ${txn.insp_no}`,
        };
      }
    });

    const result = Object.values(consolidated);
    console.log(
      `[wrhousdlvr_service] 거래 통합 완료 - ${transactions.length}건 → ${result.length}건`
    );

    return result;
  } catch (error) {
    console.error("[wrhousdlvr_service] 거래 통합 실패:", error);
    return transactions; // 실패 시 원본 반환
  }
};

// 창고 입출고 거래 처리 (다중 검사서 대응)
const processTransactions = async (requestData) => {
  // 그룹핑 키와 값 로그 출력
  console.log(
    "[processTransactions] 그룹핑 대상 transactionList:",
    requestData.transactionList.map((doc) => ({
      rsc_qlty_insp_id: doc.master.rsc_qlty_insp_id,
      semi_prdt_qlty_insp_id: doc.master.semi_prdt_qlty_insp_id,
      end_prdt_qlty_insp_id: doc.master.end_prdt_qlty_insp_id,
      deli_deta_id: doc.master.deli_deta_id,
      rsc_id: doc.master.rsc_id,
      prdt_id: doc.master.prdt_id,
      warehouse_id: doc.master.warehouse_id,
    }))
  );
  // === 문서(입고서/출고서) 1장마다 마스터-디테일 1:N 구조 보장 ===
  // transactionList: [{ master: {...}, details: [{...}, ...] }, ...]
  const conn = await mariadb.getConnection();
  try {
    await conn.beginTransaction();

    // 1. 품목ID+창고ID 기준으로 그룹핑
    const groupKey = (doc) => {
      const m = doc.master;
      return [
        m.rsc_id || m.prdt_id || "",
        m.prdt_opt_id || "",
        m.warehouse_id || "",
        m.zone_id || "",
      ].join("|");
    };
    const grouped = {};
    for (const doc of requestData.transactionList) {
      const key = groupKey(doc);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(doc);
    }

    // 2. 그룹별로 마스터/디테일 생성
    for (const docs of Object.values(grouped)) {
      const doc = docs[0];
      // 그룹키와 마스터 주요 값 로그 출력
      console.log(
        "[processTransactions] 마스터 생성 직전 그룹키:",
        groupKey(doc)
      );
      console.log("[processTransactions] 마스터 주요 값:", {
        rsc_qlty_insp_id: doc.master.rsc_qlty_insp_id,
        semi_prdt_qlty_insp_id: doc.master.semi_prdt_qlty_insp_id,
        end_prdt_qlty_insp_id: doc.master.end_prdt_qlty_insp_id,
        deli_deta_id: doc.master.deli_deta_id,
        rsc_id: doc.master.rsc_id,
        prdt_id: doc.master.prdt_id,
        warehouse_id: doc.master.warehouse_id,
      });
      // 그룹 내 첫번째 doc 기준으로 마스터 생성
      // LOT_NO 세팅 전 디버깅 로그
      if (doc.master.rcvpay_ty === "S2") {
        const firstDetail = doc?.details?.[0];
        console.log(
          "[processTransactions] 출고 마스터 LOT_NO 세팅 직전 details[0]:",
          {
            lot: firstDetail?.lot,
            lot_no: firstDetail?.lot_no,
          }
        );
      }
      const masPrefix =
        doc.master.rcvpay_ty === "S1" ? "WRHM_IN_" : "WRHM_OUT_";
      const masIdRows = await conn.query(sqlList["createWrhousTransactionId"], [
        masPrefix,
        masPrefix,
      ]);
      const masId = masIdRows[0]?.txn_id;

      // LOT 번호 자동 생성 (DB 일련번호)
      let lotNo = doc.master.lot_no;
      if (doc.master.rcvpay_ty === "S1" && !lotNo) {
        const lotPrefix = resolveLotPrefix(doc.master.item_type);
        const lotRows = await mariadb.query("createLotno", [
          lotPrefix,
          lotPrefix,
        ]);
        lotNo = lotRows[0]?.lot_no;
      } else if (doc.master.rcvpay_ty === "S2") {
        // 출고일 때는 해당 마스터(그룹)의 첫 번째 디테일 LOT_NO를 마스터에 세팅
        lotNo = "";
      }

      // 마스터 등록
      console.log("[processTransactions] 마스터 insert 직전:", {
        masId,
        rsc_id: doc.master.rsc_id,
        prdt_id: doc.master.prdt_id,
        prdt_opt_id: doc.master.prdt_opt_id,
        warehouse_id: doc.master.warehouse_id,
        zone_id: doc.master.zone_id,
        lot_no: doc.master.lot_no,
        all_rcvpay_qy: doc.master.all_rcvpay_qy,
        qty: doc.master.qty,
      });
      if (!doc.master.rsc_id && !doc.master.prdt_id) {
        console.warn(
          "[processTransactions] 마스터 품목ID가 null/undefined입니다:",
          doc.master
        );
      }
      await conn.query(sqlList["insertWrhousTransactionMaster"], [
        masId,
        doc.master.rcvpay_ty || "S1",
        requestData.emp_id,
        doc.master.rsc_id || null,
        doc.master.prdt_id || null,
        doc.master.prdt_opt_id || null,
        doc.master.warehouse_id || null,
        doc.master.zone_id || null,
        doc.master.lot_no,
        doc.master.item_spec || doc.master.spec || null,
        doc.master.item_unit || doc.master.unit || null,
        doc.master.qty  || doc.master.all_rcvpay_qy || 0,
        doc.master.rcvpay_dt || new Date(),
        doc.master.remark || doc.master.rm || "",
        doc.master.rcvpay_nm || "자동입력",
      ]);

      // 입고일 때 LOT_STC_PRECON 테이블에 insert
      if (doc.master.rcvpay_ty === "S1") {
        const lotIdRows = await conn.query(sqlList["createLotId"], [
          "LOT_STC_",
          "LOT_STC_",
        ]);
        const lotId = lotIdRows[0]?.txn_id;
        await conn.query(sqlList["insertLotStcPrecon"], [
          lotId,
          masId,
          Number(doc.master.all_rcvpay_qy || doc.master.qty || 0),
          0,
          Number(doc.master.all_rcvpay_qy || doc.master.qty || 0),
          doc.master.rm || "",
        ]);
      }

      // 그룹 내 모든 디테일 등록
      for (const docDetail of docs) {
        for (const detail of docDetail.details) {
          const dtlPrefix =
            doc.master.rcvpay_ty === "S1" ? "WRH_IN_" : "WRH_OUT_";
          const detailIdRows = await conn.query(
            sqlList["createWrhousDetailId"],
            [dtlPrefix, dtlPrefix]
          );
          const detailId = detailIdRows[0]?.detail_id;
          let rsc_qlty_insp_id = null,
            semi_prdt_qlty_insp_id = null,
            end_prdt_qlty_insp_id = null;
          // 검사서ID 매핑 (자재 불출 분기 처리)
          if (detail.item_type === "E1" || detail.rsc_qlty_insp_id) {
            // 자재 불출(생산지시 기반): prod_drct_deta_id만 세팅, end_prdt_qlty_insp_id는 강제로 null
            rsc_qlty_insp_id = detail.rsc_qlty_insp_id || null;
            semi_prdt_qlty_insp_id = null;
            end_prdt_qlty_insp_id = null;
            deli_deta_id = null;
          } else if (
            detail.item_type === "E3" ||
            detail.end_prdt_qlty_insp_id
          ) {
            // 완제품 출고: end_prdt_qlty_insp_id만 세팅, 나머지는 null
            rsc_qlty_insp_id = null;
            semi_prdt_qlty_insp_id = null;
            end_prdt_qlty_insp_id = detail.end_prdt_qlty_insp_id || null;
            deli_deta_id = null;
          } else if (
            detail.item_type === "E2" ||
            detail.semi_prdt_qlty_insp_id
          ) {
            // 납품상세 출고: deli_deta_id만 세팅, 나머지는 null
            rsc_qlty_insp_id = null;
            semi_prdt_qlty_insp_id = detail.semi_prdt_qlty_insp_id || null;
            end_prdt_qlty_insp_id = null;
            deli_deta_id = null;
          }
          const rowInspectId =
            rsc_qlty_insp_id ||
            semi_prdt_qlty_insp_id ||
            end_prdt_qlty_insp_id ||
            detail.deli_deta_id ||
            null;
          const rowItemId = detail.rsc_id || detail.prdt_id || null;
          const rowWarehouseId =
            detail.warehouse_id || doc.master.warehouse_id || null;
          console.log("[processTransactions] 디테일 insert 직전:", {
            detailId,
            masId,
            rowInspectId,
            rowItemId,
            rowWarehouseId,
            rsc_qlty_insp_id,
            semi_prdt_qlty_insp_id,
            end_prdt_qlty_insp_id,
            deli_deta_id: detail.deli_deta_id,
            rsc_rtun_trget_id: detail.rsc_rtun_trget_id,
            qty: detail.rcvpay_qy || detail.qty,
          });
          if (!rowInspectId) {
            console.warn(
              "[processTransactions] 디테일 행ID(검사서ID)가 null/undefined입니다:",
              detail
            );
          }

          // 자재 출고(S2)일 때, 자재 불출 테이블 ID 생성 및 insert
          let rtunId = null;
          if (doc.master.rcvpay_ty === "S2" && detail.prod_drct_deta_id) {
            // 1. 자재 불출 ID 생성
            const rtunIdRows = await conn.query(
              sqlList["createRwmatrRtunTrgetId"]
            );
            rtunId =
              rtunIdRows[0]?.txn_id ||
              rtunIdRows[0]?.rtun_id ||
              rtunIdRows[0]?.id ||
              null;
            detail.rsc_rtun_trget_id = rtunId; // detail에 할당
            console.log(
              "[createRwmatrRtunTrgetId] 생성된 rtunId:",
              rtunId,
              "원본:",
              rtunIdRows
            );
            // 2. 자재 불출 테이블 insert (ID, 생산지시 상세ID, 제품ID, 옵션ID, 수량, LOT)
            const rwmatrParams = [
              rtunId,
              detail.prod_drct_deta_id || null,
              detail.prdt_id || null,
              detail.prdt_opt_id || null,
              detail.qty || detail.rcvpay_qy || 0,
              "J2",
              detail.remark || detail.rm || "",
            ];
            // LOT 정보가 있으면 추가로 저장 (예: update 쿼리 또는 별도 insert 필요시)
            if (detail.lot || detail.lot_no) {
              detail.lot_no = detail.lot_no || detail.lot;
              // LOT 번호를 자재 불출 테이블에 저장하는 쿼리 실행 (예시, 실제 쿼리명/파라미터 맞게 수정 필요)
              if (sqlList["updateRwmatrRtunTrgetLot"]) {
                await conn.query(sqlList["updateRwmatrRtunTrgetLot"], [
                  detail.lot_no,
                  rtunId,
                ]);
                console.log(
                  "[updateRwmatrRtunTrgetLot] LOT 저장:",
                  detail.lot_no,
                  rtunId
                );
              }
            }
            console.log(
              "[insertRwmatrRtunTrget] insert 직전 파라미터:",
              rwmatrParams
            );
            const rwmatrResult = await conn.query(
              sqlList["insertRwmatrRtunTrget"],
              rwmatrParams
            );
            console.log("[insertRwmatrRtunTrget] 실행 결과:", rwmatrResult);
          }

          // 3. 마스터/디테일 insert: 입고/출고/납품 분기
          let wrhousDtlParams;
          if (doc.master.rcvpay_ty === "S1") {
            // 입고: 검사서ID 매핑
            wrhousDtlParams = [
              detailId,
              masId,
              null,
              rsc_qlty_insp_id,
              semi_prdt_qlty_insp_id,
              end_prdt_qlty_insp_id,
              null,
              detail.qty || detail.rcvpay_qy || 0,
              detail.remark || detail.rm || "",
            ];
          } else if (doc.master.rcvpay_ty === "S2" && doc.master.rsc_id) {
            // 자재 출고: 자재 불출 ID와 할당된 LOT_NO 저장
            // LOT 할당 함수로 LOT_NO를 받아옴 (예시)
            let lotNo = "";
            if (detail.rsc_id) {
              const lots = await getAvailableLotsByRscId(detail.rsc_id);
              if (lots && lots.length > 0)
                lotNo = lots[0].lot_no || lots[0].LOT_NO || "";
            }
            wrhousDtlParams = [
              detailId,
              masId,
              detail.rsc_rtun_trget_id, // 자재 불출 ID
              null,
              null,
              null,
              lotNo, // LOT_NO 저장
              detail.qty || detail.rcvpay_qy || 0,
              detail.remark || detail.rm || "",
            ];
            console.log(
              "[processTransactions] 자재 출고 디테일 파라미터:",
              wrhousDtlParams
            );
          } else if (doc.master.rcvpay_ty === "S2" && detail.deli_deta_id) {
            // 납품 출고: 납품 상세 ID 매핑
            let lotNo = "";
            wrhousDtlParams = [
              detailId,
              masId,
              null,
              null,
              null,
              null,
              detail.deli_deta_id,
              detail.qty || detail.rcvpay_qy || 0,
              detail.remark || detail.rm || "",
            ];
          } else {
            // 기타: 자재 불출 ID만 저장
            wrhousDtlParams = [
              detailId,
              masId,
              detail.rsc_rtun_trget_id,
              rsc_qlty_insp_id,
              semi_prdt_qlty_insp_id,
              end_prdt_qlty_insp_id,
              detail.deli_deta_id,
              detail.qty || detail.rcvpay_qy || 0,
              detail.remark || detail.rm || "",
            ];
          }
          await conn.query(sqlList["insertWrhousTransaction"], wrhousDtlParams);

          // 4. LOT 재고 현황 update
          if (doc.master.rcvpay_ty === "S2" && (detail.lot || detail.lot_no)) {
            console.log("[updateLotStcPreconOustQty] params:", {
              qty: detail.qty || detail.rcvpay_qy || 0,
              lot: detail.lot,
              lot_no: detail.lot_no,
            });
            const masIdRows = await conn.query(sqlList["selectMasByLotNo"], [
              detail.lot_no || null,
            ]);
            if (Array.isArray(masIdRows)) {
              for (const row of masIdRows) {
                if (row?.wrhsdlvr_mas_id) {
                  await conn.query(sqlList["updateLotStcPreconOustQty"], [
                    detail.qty || detail.rcvpay_qy || 0,
                    row.wrhsdlvr_mas_id,
                  ]);
                }
              }
            }
          }
        }
      }
    }
    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    console.error("[processTransactions] Error:", err);
    throw err;
  } finally {
    conn.release();
  }
};

// ===== 창고 입출고 전용 검사서 조회 함수들 =====

// 자재 품질검사서 목록 조회 (창고 입출고용)
const getWarehouseRscInspections = async (item_code = "", item_name = "") => {
  try {
    console.log(
      `[wrhousdlvr_service] 창고용 자재 검사서 조회 - item_code: ${item_code}, item_name: ${item_name}`
    );

    const params = [item_code, item_code, item_name, item_name];
    const results = await mariadb.query("selectRscInspectionList", params);

    // 각 검사서에 대해 사용 가능 수량 추가
    const resultsWithAvailableQty = await Promise.all(
      results.map(async (item) => {
        try {
          // 현재고 조회 (입고 - 출고) - 디버깅 추가
          console.log(
            `[wrhousdlvr_service] 현재고 조회 시작 - 자재: ${
              item.code || item.item_code
            }, 옵션: ${item.opt_code || item.item_opt_code || ""}`
          );

          const availableQtyResult = await mariadb.query(
            `
            SELECT 
              IFNULL(SUM(CASE WHEN wm.RCVPAY_TY = 'S1' THEN wm.ALL_RCVPAY_QY ELSE -wm.ALL_RCVPAY_QY END), 0) AS available_qty
            FROM WRHOUS_WRHSDLVR_MAS wm
            WHERE wm.RSC_ID = ?
          `,
            [item.code || item.item_code]
          );

          console.log(
            `[wrhousdlvr_service] 현재고 조회 결과:`,
            availableQtyResult
          );
          const availableQty = availableQtyResult[0]?.available_qty || 0;

          return {
            ...item,
            available_qty: Number(availableQty),
            available_qty_display: `${availableQty} ${item.unit || "EA"}`,
          };
        } catch (err) {
          console.warn(
            `[wrhousdlvr_service] 사용가능수량 조회 실패 (${item.code}):`,
            err.message
          );
          return {
            ...item,
            available_qty: 0,
            available_qty_display: `0 ${item.unit || "EA"}`,
          };
        }
      })
    );

    console.log(
      `[wrhousdlvr_service] 창고용 자재 검사서 조회 결과: ${
        resultsWithAvailableQty?.length || 0
      }건 (사용가능수량 포함)`
    );
    return resultsWithAvailableQty || [];
  } catch (error) {
    console.error("[wrhousdlvr_service] 창고용 자재 검사서 조회 실패:", error);
    return [];
  }
};

// 반제품 품질검사서 목록 조회 (창고 입출고용) - 사용 가능 수량 포함
const getWarehouseSemiInspections = async (item_code = "", item_name = "") => {
  console.log(
    `[wrhousdlvr_service] 창고용 반제품 검사서 조회 - item_code: ${item_code}, item_name: ${item_name}`
  );

  const params = [item_code, item_code, item_name, item_name];
  const results = await mariadb.query("selectSemiInspectionList", params);

  // 각 검사서에 대해 사용 가능 수량 추가 (헬퍼 사용)
  const enriched = await Promise.all(
    (results || []).map(async (item) => {
      try {
        // 반제품은 옵션 조건 없이 PRDT_ID만 비교
        const availableQtyResult = await mariadb.query(
          `
          SELECT IFNULL(SUM(CASE WHEN wm.RCVPAY_TY = 'S1' THEN wm.ALL_RCVPAY_QY ELSE -wm.ALL_RCVPAY_QY END), 0) AS available_qty
          FROM WRHOUS_WRHSDLVR_MAS wm
          WHERE wm.PRDT_ID = ? AND (wm.PRDT_OPT_ID IS NULL OR wm.PRDT_OPT_ID = '')
        `,
          [item.item_code]
        );
        const available = availableQtyResult[0]?.available_qty || 0;
        return {
          ...item,
          available_qty: available,
          available_qty_display: available == null ? "N/A" : String(available),
        };
      } catch (err) {
        console.warn(
          `[wrhousdlvr_service] 사용가능수량 조회 실패 (${item.item_code}):`,
          err.message
        );
        return {
          ...item,
          available_qty: 0,
          available_qty_display: `0 ${item.unit || "EA"}`,
        };
      }
    })
  );

  console.log(
    `[wrhousdlvr_service] 창고용 반제품 검사서 조회 결과: ${enriched.length}건`
  );
  return enriched;
};

// 완제품 품질검사서 목록 조회 (창고 입출고용) - 사용 가능 수량 포함
const getWarehouseEndPrdtInspections = async (
  item_code = "",
  item_name = ""
) => {
  console.log(
    `[wrhousdlvr_service] 창고용 완제품 검사서 조회 - item_code: ${item_code}, item_name: ${item_name}`
  );

  const params = [item_code, item_code, item_name, item_name];
  const results = await mariadb.query("selectEndPrdtInspectionList", params);

  // 각 검사서에 대해 사용 가능 수량 추가 (헬퍼 사용)
  const enriched = await Promise.all(
    (results || []).map(async (item) => {
      try {
        const available = await getAvailableQtyForItem({
          item_type: "E3",
          item_code: item.item_code,
          item_opt_code: item.opt_code || item.item_opt_code || "",
        });
        return {
          ...item,
          available_qty: available,
          available_qty_display: available == null ? "N/A" : String(available),
        };
      } catch (err) {
        console.warn(
          `[wrhousdlvr_service] 사용가능수량 조회 실패 (${item.item_code}):`,
          err.message
        );
        return {
          ...item,
          available_qty: 0,
          available_qty_display: `0 ${item.unit || "EA"}`,
        };
      }
    })
  );

  console.log(
    `[wrhousdlvr_service] 창고용 완제품 검사서 조회 결과: ${enriched.length}건`
  );
  return enriched;
};

// 납품서 기반 완제품 목록 조회
const getWarehouseProducts = async (item_code = "", item_name = "") => {
  try {
    console.log(
      `[wrhousdlvr_service] 창고 완제품 조회 - item_code: ${item_code}, item_name: ${item_name}`
    );

    const params = [item_code, item_code, item_name, item_name];

    const results = await mariadb.query("selectWarehouseProducts", params);

    console.log(
      `[wrhousdlvr_service] 창고 완제품 조회 결과: ${results?.length || 0}건`
    );
    return results || [];
  } catch (error) {
    console.error("[wrhousdlvr_service] 창고 완제품 조회 실패:", error);
    return [];
  }
};

// 창고 자재 목록 조회 (자재 불출용)
const getWarehouseMaterials = async (item_code = "", item_name = "") => {
  try {
    console.log(
      `[wrhousdlvr_service] 창고 자재 조회 - item_code: ${item_code}, item_name: ${item_name}`
    );

    const params = [item_code, item_code, item_name, item_name];

    const results = await mariadb.query("selectWarehouseMaterials", params);

    console.log(
      `[wrhousdlvr_service] 창고 자재 조회 결과: ${results?.length || 0}건`
    );
    return results || [];
  } catch (error) {
    console.error("[wrhousdlvr_service] 창고 자재 조회 실패:", error);
    return [];
  }
};

// 마스터-디테일 구조의 창고 입출고 거래 저장
const saveMasterDetailTransactions = async ({
  mode,
  masterTransactions,
  detailTransactions,
}) => {
  let conn;
  try {
    console.log("[wrhousdlvr_service] saveMasterDetailTransactions 시작");
    console.log(`[wrhousdlvr_service] 모드: ${mode}`);
    console.log(
      `[wrhousdlvr_service] 마스터 거래: ${masterTransactions.length}건`
    );
    console.log(
      `[wrhousdlvr_service] 디테일 거래: ${detailTransactions.length}건`
    );

    if (detailTransactions.length === 0) {
      throw new Error("디테일 테이블에 값이 하나도 없으면 저장할 수 없습니다.");
    }

    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    console.log("[wrhousdlvr_service] 트랜잭션 시작됨");

    // === 1) 마스터 생성 ===
    const masterMap = new Map(); // key → masterId
    const masterInsertedIds = [];

    for (const master of masterTransactions) {
      const masterId = uuidv4();

      // ✅ LOT 생성 (입고에서만 신규 LOT 발급)
      let lotNumber = master.lot_no || null;
      if (!lotNumber && mode === "in") {
        const lotPrefix = resolveLotPrefix(master.item_type); // E1/E2/E3
        lotNumber = await generateLotNumberByPrefix(lotPrefix); // <-- 중요
      }

      // ✅ 품목 유형에 따라 RSC/PRDT/PRDT_OPT 세팅
      let rscId = null,
        prdtId = null,
        prdtOptId = null;
      if (master.item_type === "E1") {
        rscId = master.item_code;
      } else {
        prdtId = master.item_code;
        prdtOptId = master.item_opt_code || null;
      }

      console.log(
        `[wrhousdlvr_service] 마스터 저장: ${master.item_code} - ${master.item_name}`
      );

      // ✅ 마스터 INSERT (별칭은 기존과 동일)
      await mariadb.query("insertWrhousTransactionMaster", [
        masterId,
        master.rcvpay_ty || (mode === "in" ? "S1" : "S2"),
        master.emp_id || "EMP001", // ✅ EMP_ID가 없으면 기본값 사용 (실제 존재하는 직원 ID)
        rscId,
        prdtId,
        prdtOptId,
        master.warehouse_id,
        master.zone_id,
        master.lot_no, // ✅ LOT_NO
        master.item_spec || "",
        master.item_unit || "EA",
        Number(master.total_qty) || 0,
        master.rcvpay_dt || new Date().toISOString().split("T")[0],
        master.remark || "",
        master.rcvpay_nm || "", // ✅ RCVPAY_NM (수불 명) 추가
      ]);

      masterInsertedIds.push(masterId);

      // ✅ 마스터-매칭키 구성
      // 입고(in): LOT가 방금 생성되므로, 같은 (item_code,warehouse,zone) 묶음 기준
      // 출고(out): 이미 존재하는 LOT별(warehouse,zone)로 묶는 게 자연스러움
      const key =
        mode === "in"
          ? `IN|${master.item_type}|${master.item_code}|${master.warehouse_id}|${master.zone_id}`
          : `OUT|${master.item_type}|${lotNumber || master.lot_no}|${
              master.warehouse_id
            }|${master.zone_id}`;

      masterMap.set(key, { masterId, lotNumber });
    }

    // === 2) 디테일 생성 ===
    let detailCount = 0;

    for (const detail of detailTransactions) {
      const detailId = uuidv4();

      // ✅ 디테일-매칭키 구성: 마스터 생성 시의 기준과 동일하게 만듦
      const key =
        mode === "in"
          ? `IN|${detail.item_type}|${detail.item_code}|${detail.warehouse_id}|${detail.zone_id}`
          : `OUT|${detail.item_type}|${detail.lot_no}|${detail.warehouse_id}|${detail.zone_id}`;

      const found = masterMap.get(key);
      if (!found) {
        throw new Error(`디테일을 연결할 마스터를 찾지 못했습니다: ${key}`);
      }
      const { masterId } = found;

      // ✅ 검사 유형 매핑
      let rscQltyInspId = null,
        semiPrdtQltyInspId = null,
        endPrdtQltyInspId = null,
        deliDetaId = null;
      if (detail.item_type === "E1") rscQltyInspId = detail.inspect_id;
      else if (detail.item_type === "E2")
        semiPrdtQltyInspId = detail.inspect_id;
      else if (detail.item_type === "E3") endPrdtQltyInspId = detail.inspect_id;

      console.log(
        `[wrhousdlvr_service] 디테일 저장: ${detail.item_code} - 수량: ${detail.qty}`
      );

      // ✅ 디테일 INSERT (별칭은 기존과 동일)
      await mariadb.query("insertWrhousTransaction", [
        detailId, // WRHOUS_WRHSDLVR_ID
        masterId, // WRHSDLVR_MAS_ID  ✅ 고정 0번이 아니라 매칭된 masterId
        null, // RSC_RTUN_TRGET_ID (자재 반납 대상 ID - 현재 사용 안함)
        rscQltyInspId,
        semiPrdtQltyInspId,
        endPrdtQltyInspId,
        deliDetaId,
        Number(detail.qty) || 0,
        detail.remark || "",
      ]);

      // ✅ 출고면 원본 수량 차감
      if (mode === "out") {
        await updateOriginalQuantity(detail, conn); // 기존 로직 그대로 사용
      }

      detailCount++;
    }

    await conn.commit();
    console.log("[wrhousdlvr_service] 트랜잭션 커밋 완료");

    return {
      success: true,
      message: `${mode === "in" ? "입고" : "출고"} 처리가 완료되었습니다.`,
      masterCount: masterTransactions.length,
      detailCount: detailCount,
      masterIds: masterInsertedIds,
    };
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
        console.log("[wrhousdlvr_service] 트랜잭션 롤백됨");
      } catch (rollbackError) {
        console.error("[wrhousdlvr_service] 롤백 실패:", rollbackError);
      }
    }

    console.error(
      "[wrhousdlvr_service] saveMasterDetailTransactions 오류:",
      error
    );
    console.error("[wrhousdlvr_service] 오류 스택:", error.stack);

    return {
      success: false,
      error: "마스터-디테일 거래 저장 중 오류가 발생했습니다.",
      details: error.message,
    };
  } finally {
    if (conn) conn.release();
  }
};

// 새로운 마스터-디테일 거래 저장 (Vue 컴포넌트용)
const saveWarehouseTransactions = async (info = {}) => {
  console.log("[wrhousdlvr_service] saveWarehouseTransactions 호출됨");
  console.log(
    "[wrhousdlvr_service] 요청 데이터:",
    JSON.stringify(info, null, 2)
  );

  let conn;

  try {
    // 1. 요청 데이터 검증
    const { mode, masterTransactions = [], detailTransactions = [] } = info;

    if (!mode || !["in", "out"].includes(mode)) {
      return { success: false, error: "올바른 모드(in/out)를 지정해주세요." };
    }

    if (masterTransactions.length === 0 || detailTransactions.length === 0) {
      return { success: false, error: "저장할 거래 데이터가 없습니다." };
    }

    // 2. DB 트랜잭션 시작
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    console.log("[wrhousdlvr_service] 트랜잭션 시작됨");

    const masterInsertedIds = [];
    const detailInsertedIds = [];

    // 3. 마스터 거래 처리
    for (const masterTxn of masterTransactions) {
      console.log("[wrhousdlvr_service] 마스터 거래 처리:", masterTxn);
      console.log(
        "[wrhousdlvr_service] 마스터 거래 EMP_ID 확인:",
        masterTxn.emp_id
      );

      if (mode === "out") {
        const availableLots = await getAvailableLotsForItem(masterTxn, conn);
        console.log("[wrhousdlvr_service] LOT 조회 결과:", availableLots);
        if (!availableLots || availableLots.length === 0) {
          throw new Error(`재고가 부족합니다: ${masterTxn.item_name}`);
        }
        const totalStock = availableLots.reduce(
          (sum, lot) => sum + Number(lot.available_qty),
          0
        );
        if (totalStock < Number(masterTxn.total_qty)) {
          throw new Error(
            `재고 부족: ${masterTxn.item_name} (요청: ${masterTxn.total_qty}, 재고: ${totalStock})`
          );
        }
        // 선입선출로 LOT 분할 처리
        const lotAllocations = allocateLotsForWithdrawal(
          availableLots,
          Number(masterTxn.total_qty)
        );
        console.log("[wrhousdlvr_service] LOT 할당 결과:", lotAllocations);
        for (const allocation of lotAllocations) {
          console.log("[wrhousdlvr_service] 처리할 allocation:", allocation);
          console.log("[wrhousdlvr_service] 원본 masterTxn:", {
            warehouse_id: masterTxn.warehouse_id,
            zone_id: masterTxn.zone_id,
          });
          const masterId = await processMasterTransaction(
            {
              ...masterTxn,
              total_qty: allocation.allocated_qty,
              lot_no: allocation.lot_no,
              warehouse_id: allocation.warehouse_id,
              zone_id: allocation.zone_id,
            },
            mode,
            conn
          );
          masterInsertedIds.push(masterId);
          // LOT_STC_PRECON 출고수량 누적 update
          // allocation.lot_no가 LOT_STC_PRECON의 PK(LOT_INVNTRY_PRECON_ID)
          await mariadb.query("updateLotStcPreconOustQty", [
            allocation.allocated_qty,
            allocation.allocated_qty,
            masterId,
          ]);
        }
      } else {
        // 입고 시 LOT 번호 분리 관리
        // 1) 마스터 LOT_NO: 품목 유형별 prefix로 생성 (예: LOT_END_...)
        const lotPrefix = resolveLotPrefix(masterTxn.item_type);
        const lotNo = await generateLotNumberByPrefix(lotPrefix);
        if (!lotNo || typeof lotNo !== "string" || lotNo.trim() === "") {
          throw new Error("입고 마스터 LOT_NO 생성 실패: null 또는 빈 값");
        }
        // 2) LOT 재고 현황 PK: LOT_ID로 생성 (예: LOT_STC_...)
        const lotIdRows = await mariadb.query("createLotId", [
          "LOT_STC_",
          "LOT_STC_",
        ]);
        const lotId = lotIdRows[0]?.txn_id;
        if (!lotId || typeof lotId !== "string" || lotId.trim() === "") {
          throw new Error("LOT 재고 현황 LOT_ID 생성 실패: null 또는 빈 값");
        }
        const masterId = await processMasterTransaction(
          {
            ...masterTxn,
            lot_no: allocation.lot_no, // 마스터 LOT_NO는 LOT_END_... 등 prefix
          },
          mode,
          conn
        );
        masterInsertedIds.push(masterId);
        // LOT_STC_PRECON insert (입고수량, 현재수량 동시)
        await mariadb.query("insertLotStcPrecon", [
          lotId, // LOT_ID (재고 현황 LOT 번호)
          masterId, // WRHSDLVR_MAS_ID
          Number(masterTxn.total_qty), // IST_QY
          0, // OUST_QY
          Number(masterTxn.total_qty), // NOW_STC_QY
          masterTxn.remark || "", // RM
        ]);
      }
    }

    // 4. 디테일 거래 처리
    const rcvpayTy = mode === "in" ? "S1" : "S2"; // 입고: S1, 출고: S2

    // 마스터-디테일 매칭을 위한 맵 생성
    const masterMap = new Map();

    // 각 마스터에 대해 매칭 키 생성
    for (let i = 0; i < masterTransactions.length; i++) {
      const master = masterTransactions[i];
      const masterId = masterInsertedIds[i];

      // 매칭 키: item_type + item_code + warehouse_id + zone_id 조합
      const key = `${master.item_type}|${master.item_code}|${master.warehouse_id}|${master.zone_id}`;

      if (!masterMap.has(key)) {
        masterMap.set(key, []);
      }
      masterMap.get(key).push({ masterId, master });
    }

    console.log(
      "[wrhousdlvr_service] 마스터 매칭 맵 생성:",
      Array.from(masterMap.keys())
    );

    for (const detailTxn of detailTransactions) {
      console.log("[wrhousdlvr_service] 디테일 거래 처리:", detailTxn);
      console.log(
        "[wrhousdlvr_service] deli_deta_id 값:",
        detailTxn.deli_deta_id
      );
      console.log("[wrhousdlvr_service] inspect_id 값:", detailTxn.inspect_id);
      console.log("[wrhousdlvr_service] 수량:", detailTxn.qty);

      // 디테일에 해당하는 마스터 ID 찾기
      const detailKey = `${detailTxn.item_type}|${detailTxn.item_code}|${detailTxn.warehouse_id}|${detailTxn.zone_id}`;
      const matchingMasters = masterMap.get(detailKey);

      if (!matchingMasters || matchingMasters.length === 0) {
        throw new Error(
          `디테일을 연결할 마스터를 찾을 수 없습니다: ${detailKey}`
        );
      }

      // 첫 번째 매칭되는 마스터 사용 (같은 품목+창고+존의 경우)
      const selectedMasterId = matchingMasters[0].masterId;

      console.log(
        `[wrhousdlvr_service] 디테일 ${detailTxn.item_code}을(를) 마스터 ID ${selectedMasterId}에 연결`
      );

      // 출고(out)일 때만 수량 검증 수행
      if (mode === "out") {
        // 수량 검증: 검사서/납품서의 사용 가능한 수량보다 많이 요청하는지 확인
        await validateTransactionQuantity(detailTxn, mode, conn);
      }

      // 검사서별로 디테일 insert (중복 없이 모두 저장)
      // detailTransactions 배열이 검사서별로 구성되어 있으므로, 각 detailTxn마다 insert
      const detailId = await processDetailTransaction(
        detailTxn,
        selectedMasterId,
        conn,
        rcvpayTy
      );
      detailInsertedIds.push(detailId);

      // 부분 입고/출고 처리: 원본 검사서/출고서 수량 업데이트
      console.log("[wrhousdlvr_service] updateOriginalQuantity 호출 전");
      if (mode === "out") {
        // 출고 모드일 때만 원본 수량 차감
        await updateOriginalQuantity(detailTxn, conn);
      } else {
        console.log("[wrhousdlvr_service] 입고 모드로 원본 수량 업데이트 스킵");
      }
      console.log("[wrhousdlvr_service] updateOriginalQuantity 호출 후");
    }

    // 5. 트랜잭션 커밋
    await conn.commit();
    console.log("[wrhousdlvr_service] 트랜잭션 커밋됨");

    return {
      success: true,
      message: `${mode === "in" ? "입고" : "출고"} 처리가 완료되었습니다.`,
      data: {
        masterCount: masterInsertedIds.length,
        detailCount: detailInsertedIds.length,
        masterIds: masterInsertedIds,
        detailIds: detailInsertedIds,
      },
    };
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
        console.log("[wrhousdlvr_service] 트랜잭션 롤백됨");
      } catch (rollbackError) {
        console.error("[wrhousdlvr_service] 롤백 실패:", rollbackError);
      }
    }

    console.error(
      "[wrhousdlvr_service] saveWarehouseTransactions 오류:",
      error
    );
    return {
      success: false,
      error: error.message || "거래 저장 중 오류가 발생했습니다.",
      details: error.stack,
    };
  } finally {
    if (conn) {
      conn.release();
      console.log("[wrhousdlvr_service] DB 연결 해제됨");
    }
  }
};

// LOT 접두사 생성
const getLotPrefix = (itemType) => {
  const prefixMap = {
    E1: "LOT_RSC_",
    E2: "LOT_SEMI_",
    E3: "LOT_END_",
    자재: "LOT_RSC_",
    반제품: "LOT_SEMI_",
    완제품: "LOT_END_",
  };
  // 검사서 ID가 배열일 경우 첫 번째 값 사용, 단일 값이면 그대로 사용
  let masterLotNo = null;
  if (Array.isArray(masterTxn.inspect_id)) {
    masterLotNo = masterTxn.inspect_id[0];
  } else {
    masterLotNo =
      masterTxn.inspect_id ||
      masterTxn.lot_no ||
      masterTxn.default_lot_no ||
      null;
  }
};

// 새 LOT 번호 생성 (호환성 유지)
const generateNewLotNumber = async (prefix) => {
  try {
    return await generateLotNumberByPrefix(prefix);
  } catch (error) {
    console.error("[wrhousdlvr_service] LOT 번호 생성 실패:", error);
    throw error;
  }
};

// 출고 가능한 LOT 조회
const getAvailableLotsForItem = async (item) => {
  try {
    let rscId = "";
    let prdtId = "";
    let prdtOptId = "";
    if (item.item_type === "E1") {
      rscId = item.item_code;
    } else if (item.item_type === "E2" || item.item_type === "E3") {
      prdtId = item.item_code;
      prdtOptId = item.item_opt_code || "";
    }
    const result = await mariadb.query("selectAvailableLots", [
      item.item_type, // E1
      item.item_type, // E2
      item.item_type, // E3
      rscId,
      rscId,
      prdtId,
      prdtId,
      prdtOptId,
      prdtOptId,
    ]);
    // LOT명 접두사 보정: 완제품은 LOT_END_, 반제품은 LOT_SEMI_, 자재는 LOT_RSC_
    const prefixMap = {
      E1: "LOT_RSC_",
      E2: "LOT_SEMI_",
      E3: "LOT_END_",
    };
    const prefix = prefixMap[item.item_type] || "";
    // prefix를 강제로 붙이지 않고, DB에 저장된 LOT 번호를 그대로 반환
    return (result || []).map((lot) => ({
      ...lot,
      lot_no: lot.lot_no || "",
    }));
  } catch (error) {
    console.error("[wrhousdlvr_service] 사용 가능한 LOT 조회 실패:", error);
    throw error;
  }
};

// 선입선출 LOT 할당
const allocateLotsForWithdrawal = (availableLots, requiredQty) => {
  const allocations = [];
  let remainingQty = requiredQty;

  for (const lot of availableLots) {
    if (remainingQty <= 0) break;

    const allocatedQty = Math.min(Number(lot.available_qty), remainingQty);

    allocations.push({
      lot_no: lot.lot_no,
      qty: allocatedQty,
      warehouse_id: lot.warehouse_id,
      zone_id: lot.zone_id,
    });

    remainingQty -= allocatedQty;
  }

  return allocations;
};

// 마스터 거래 처리
const processMasterTransaction = async (masterTxn, mode) => {
  try {
    // 마스터 ID 생성
    const prefix = mode === "in" ? "WRHM_IN_" : "WRHM_OUT_";
    const masterIdResult = await mariadb.query("createWrhousTransactionId", [
      prefix,
      prefix,
    ]);

    const masterId = masterIdResult[0]?.txn_id || `${prefix}${Date.now()}`;

    // EMP_ID 검증 - 존재하지 않으면 기본값 사용 (NOT NULL 제약조건 대응)
    let validEmpId = masterTxn.emp_id || "EMP001"; // 기본값 설정 (실제 존재하는 직원 ID)
    console.log(
      `[wrhousdlvr_service] processMasterTransaction EMP_ID 검증 시작: ${masterTxn.emp_id}`
    );

    if (masterTxn.emp_id && masterTxn.emp_id !== "EMP001") {
      try {
        const empCheck = await mariadb.query("validateEmployeeId", [
          masterTxn.emp_id,
        ]);
        if (empCheck && empCheck.length > 0) {
          validEmpId = masterTxn.emp_id; // 검증 성공 시 원본 사용
          console.log(`[wrhousdlvr_service] EMP_ID 검증 성공: ${validEmpId}`);
        } else {
          console.warn(
            `[wrhousdlvr_service] EMP_ID 검증 실패, 기본값 사용: ${masterTxn.emp_id} → EMP001`
          );
          validEmpId = "EMP001"; // 검증 실패 시 기본값 사용
        }
      } catch (empError) {
        console.warn(
          `[wrhousdlvr_service] EMP_ID 확인 실패, 기본값 사용: ${masterTxn.emp_id} → EMP001`,
          empError
        );
        validEmpId = "EMP001"; // 에러 발생 시 기본값 사용
      }
    } else {
      console.log(
        `[wrhousdlvr_service] EMP_ID가 없거나 기본값, 기본값 사용: ${validEmpId}`
      );
    }

    // 마스터 거래 INSERT
    const rscId = masterTxn.item_type === "E1" ? masterTxn.item_code : null;
    const prdtId = ["E2", "E3"].includes(masterTxn.item_type)
      ? masterTxn.item_code
      : null;

    const insertParams = [
      masterId,
      mode === "in" ? "S1" : "S2",
      validEmpId, // 검증된 EMP_ID 또는 NULL
      rscId,
      prdtId,
      masterTxn.item_opt_code || null,
      masterTxn.warehouse_id,
      masterTxn.zone_id,
      masterTxn.lot_no,
      masterTxn.item_spec || "",
      masterTxn.item_unit || "EA",
      Number(masterTxn.total_qty),
      masterTxn.rcvpay_dt || new Date().toISOString().split("T")[0],
      masterTxn.remark || "",
      masterTxn.rcvpay_nm || "", // ✅ RCVPAY_NM (수불 명) 추가
    ];

    console.log(`[wrhousdlvr_service] 마스터 INSERT 파라미터:`, {
      WRHSDLVR_MAS_ID: insertParams[0],
      RCVPAY_TY: insertParams[1],
      EMP_ID: insertParams[2],
      RSC_ID: insertParams[3],
      PRDT_ID: insertParams[4],
      PRDT_OPT_ID: insertParams[5],
      WRHOUS_ID: insertParams[6],
      ZONE_ID: insertParams[7],
      LOT_NO: insertParams[8],
      SPEC: insertParams[9],
      UNIT: insertParams[10],
      ALL_RCVPAY_QY: insertParams[11],
      RCVPAY_DT: insertParams[12],
      RM: insertParams[13],
      RCVPAY_NM: insertParams[14], // ✅ RCVPAY_NM 추가
    });

    await mariadb.query("insertWrhousTransactionMaster", insertParams);

    console.log(`[wrhousdlvr_service] 마스터 거래 저장됨: ${masterId}`);
    return masterId;
  } catch (error) {
    console.error("[wrhousdlvr_service] 마스터 거래 처리 실패:", error);
    throw error;
  }
};

// 부분 입고/출고 시 원본 검사서/출고서 수량 업데이트
const updateOriginalQuantity = async (detailTxn, conn) => {
  try {
    const typeMap = {
      자재: "E1",
      반제품: "E2",
      완제품: "E3",
    };
    const itemTypeCode = typeMap[detailTxn.item_type] || detailTxn.item_type;
    const processedQty = Number(detailTxn.qty);

    console.log(`[wrhousdlvr_service] 원본 수량 업데이트 시작:`, {
      inspect_id: detailTxn.inspect_id,
      item_type: itemTypeCode,
      processed_qty: processedQty,
    });

    if (!detailTxn.inspect_id || processedQty <= 0) {
      console.log(
        "[wrhousdlvr_service] 수량 업데이트 스킵: 검사서 ID 없음 또는 수량 0"
      );
      return;
    }

    // inspect_id가 납품서 상세 ID인지 품질검사서 ID인지 판단
    const isDeli = detailTxn.inspect_id.startsWith("DLD");

    if (isDeli) {
      // 납품서 상세인 경우 - 별도 업데이트 불필요 (WRHOUS_WRHSDLVR 테이블에 저장되면 자동으로 remaining_qty 계산됨)
      console.log(
        `[wrhousdlvr_service] 납품서 상세 ID: ${detailTxn.inspect_id} - 별도 수량 업데이트 불필요`
      );
    } else {
      // 품질검사서인 경우 PASS_QY 차감
      if (itemTypeCode === "E1") {
        // 자재 품질검사서 PASS_QY 차감
        console.log(
          `[wrhousdlvr_service] 자재 품질검사서 수량 업데이트 실행: ${detailTxn.inspect_id}, 차감량: ${processedQty}`
        );
        const result = await mariadb.query("deductRscInspPassQty", [
          processedQty,
          detailTxn.inspect_id,
        ]);
        console.log(
          `[wrhousdlvr_service] 자재 품질검사서 UPDATE 결과:`,
          result
        );
        console.log(
          `[wrhousdlvr_service] 자재 검사서 ${detailTxn.inspect_id} PASS_QY ${processedQty} 차감`
        );
      } else if (itemTypeCode === "E2") {
        // 반제품 품질검사서 PASS_QY 차감
        console.log(
          `[wrhousdlvr_service] 반제품 품질검사서 수량 업데이트 실행: ${detailTxn.inspect_id}, 차감량: ${processedQty}`
        );
        const result = await mariadb.query("deductSemiPrdtInspPassQty", [
          processedQty,
          detailTxn.inspect_id,
        ]);
        console.log(
          `[wrhousdlvr_service] 반제품 품질검사서 UPDATE 결과:`,
          result
        );
        console.log(
          `[wrhousdlvr_service] 반제품 검사서 ${detailTxn.inspect_id} PASS_QY ${processedQty} 차감`
        );
      } else if (itemTypeCode === "E3") {
        // 완제품 품질검사서 PASS_QY 차감
        console.log(
          `[wrhousdlvr_service] 완제품 품질검사서 수량 업데이트 실행: ${detailTxn.inspect_id}, 차감량: ${processedQty}`
        );
        const result = await mariadb.query("deductEndPrdtInspPassQty", [
          processedQty,
          detailTxn.inspect_id,
        ]);
        console.log(
          `[wrhousdlvr_service] 완제품 품질검사서 UPDATE 결과:`,
          result
        );
        console.log(
          `[wrhousdlvr_service] 완제품 검사서 ${detailTxn.inspect_id} PASS_QY ${processedQty} 차감`
        );
      }
    }
  } catch (error) {
    console.error("[wrhousdlvr_service] 원본 수량 업데이트 실패:", error);
    throw error;
  }
};

// 디테일 거래 처리
const processDetailTransaction = async (
  detailTxn,
  masterId,
  conn,
  rcvpayTy = "S1"
) => {
  try {
    // 디테일 ID 생성 - 입고/출고에 따른 접두사 설정
    const prefix = rcvpayTy === "S1" ? "WRH_IN_" : "WRH_OUT_";
    const detailIdResult = await mariadb.query("createWrhousDetailId", [
      prefix,
      prefix,
    ]);

    const detailId = detailIdResult[0]?.detail_id || `${prefix}${Date.now()}`;

    console.log(
      `[wrhousdlvr_service] 디테일 ID 생성됨: ${detailId} (타입: ${
        rcvpayTy === "S1" ? "입고" : "출고"
      })`
    );

    // 검사서 타입에 따른 ID 설정 및 Foreign Key 검증
    let rscQltyInspId = null;
    let semiPrdtQltyInspId = null;
    let endPrdtQltyInspId = null;
    let deliDetaId = null;

    // 타입 변환 (한글 → 코드)
    const typeMap = {
      자재: "E1",
      반제품: "E2",
      완제품: "E3",
    };
    const itemTypeCode = typeMap[detailTxn.item_type] || detailTxn.item_type;

    console.log(
      `[wrhousdlvr_service] 타입 변환: ${detailTxn.item_type} → ${itemTypeCode}`
    );

    // inspect_id가 납품서 상세 ID인지 품질검사서 ID인지 판단
    // DLD로 시작하면 납품서 상세, 그 외는 품질검사서
    const isDeli =
      detailTxn.inspect_id && detailTxn.inspect_id.startsWith("DLD");

    if (isDeli) {
      // 납품서 상세인 경우
      const deliExists = await mariadb.query("selectDeliveryOrderCount", [
        detailTxn.inspect_id,
      ]);
      if (deliExists[0]?.cnt > 0) {
        deliDetaId = detailTxn.inspect_id;
        console.log(
          `[wrhousdlvr_service] 납품서 상세 ID로 인식: ${detailTxn.inspect_id}`
        );
      } else {
        console.warn(
          `[wrhousdlvr_service] 납품서 상세 ${detailTxn.inspect_id}가 존재하지 않음`
        );
      }
    } else if (detailTxn.inspect_id) {
      // 품질검사서인 경우
      if (itemTypeCode === "E1") {
        // 자재 품질검사서 존재 확인
        const rscExists = await mariadb.query("selectRscInspectionOrderCount", [
          detailTxn.inspect_id,
        ]);
        if (rscExists[0]?.cnt > 0) {
          rscQltyInspId = detailTxn.inspect_id;
        } else {
          console.warn(
            `[wrhousdlvr_service] 자재 품질검사서 ${detailTxn.inspect_id}가 존재하지 않음`
          );
        }
      } else if (itemTypeCode === "E2") {
        // 반제품 품질검사서 존재 확인
        const semiExists = await mariadb.query(
          "selectSemiInspectionOrderCount",
          [detailTxn.inspect_id]
        );
        if (semiExists[0]?.cnt > 0) {
          semiPrdtQltyInspId = detailTxn.inspect_id;
        } else {
          console.warn(
            `[wrhousdlvr_service] 반제품 품질검사서 ${detailTxn.inspect_id}가 존재하지 않음`
          );
        }
      } else if (itemTypeCode === "E3") {
        // 완제품 품질검사서 존재 확인
        const endExists = await mariadb.query(
          "selectEndPrdtInspectionOrderCount",
          [detailTxn.inspect_id]
        );
        if (endExists[0]?.cnt > 0) {
          endPrdtQltyInspId = detailTxn.inspect_id;
        } else {
          console.warn(
            `[wrhousdlvr_service] 완제품 품질검사서 ${detailTxn.inspect_id}가 존재하지 않음`
          );
        }
      }
    }

    if (detailTxn.deli_deta_id) {
      // 납품 상세 존재 확인
      const deliExists = await mariadb.query("selectDeliveryOrderCount", [
        detailTxn.deli_deta_id,
      ]);
      if (deliExists[0]?.cnt > 0) {
        deliDetaId = detailTxn.deli_deta_id;
      } else {
        console.warn(
          `[wrhousdlvr_service] 납품 상세 ${detailTxn.deli_deta_id}가 존재하지 않음`
        );
      }
    }

    console.log(`[wrhousdlvr_service] Foreign Key 검증 완료:`, {
      원본_타입: detailTxn.item_type,
      변환된_타입: itemTypeCode,
      rscQltyInspId,
      semiPrdtQltyInspId,
      endPrdtQltyInspId,
      deliDetaId,
    });

    console.log(`[wrhousdlvr_service] 디테일 거래 INSERT 실행:`, {
      detailId,
      masterId,
      rscQltyInspId,
      semiPrdtQltyInspId,
      endPrdtQltyInspId,
      deliDetaId: deliDetaId,
      수량: Number(detailTxn.qty),
      비고: detailTxn.remark || "",
    });

    // 디테일 거래 INSERT
    const insertResult = await mariadb.query("insertWrhousTransaction", [
      detailId,
      masterId,
      null, // RSC_RTUN_TRGET_ID (자재 반납 대상 ID - 현재 사용 안함)
      rscQltyInspId,
      semiPrdtQltyInspId,
      endPrdtQltyInspId,
      deliDetaId,
      Number(detailTxn.qty),
      detailTxn.remark || "",
    ]);

    console.log(`[wrhousdlvr_service] 디테일 거래 INSERT 결과:`, insertResult);
    console.log(`[wrhousdlvr_service] 디테일 거래 저장됨: ${detailId}`);
    return detailId;
  } catch (error) {
    console.error("[wrhousdlvr_service] 디테일 거래 처리 실패:", error);
    throw error;
  }
};

// 수량 검증 함수: 검사서/납품서의 사용 가능한 수량보다 많이 요청하는지 확인
const validateTransactionQuantity = async (detailTxn, mode, conn) => {
  try {
    console.log("[wrhousdlvr_service] 수량 검증 시작:", {
      inspect_id: detailTxn.inspect_id,
      qty: detailTxn.qty,
      item_type: detailTxn.item_type,
      mode: mode,
    });

    const requestedQty = Number(detailTxn.qty);
    if (requestedQty <= 0) {
      throw new Error(`올바르지 않은 수량입니다: ${requestedQty}`);
    }

    // inspect_id가 납품서 상세 ID인지 품질검사서 ID인지 판단
    const isDeli =
      detailTxn.inspect_id && detailTxn.inspect_id.startsWith("DLD");

    let availableQty = 0;
    let itemName = detailTxn.item_name || "품목";

    if (isDeli) {
      // 납품서 상세인 경우: 잔여 수량 조회
      console.log(
        "[wrhousdlvr_service] 납품서 상세 ID로 검증:",
        detailTxn.inspect_id
      );
      // 여기부터
      const deliResult = await mariadb.query(
        "selectDeliveryOrderRemainingQty",
        [detailTxn.inspect_id]
      );

      console.log("[wrhousdlvr_service] 납품서 조회 결과:", deliResult);

      if (deliResult.length > 0) {
        availableQty = Number(deliResult[0].remaining_qty);
        itemName = deliResult[0].item_name || itemName;
      } else {
        throw new Error(
          `납품서 상세 정보를 찾을 수 없습니다: ${detailTxn.inspect_id}`
        );
      }
    } else if (detailTxn.inspect_id && detailTxn.inspect_id.startsWith("PDD")) {
      // 생산지시 상세 ID인 경우: 생산지시 수량에서 이미 불출된 수량 제외
      console.log(
        "[wrhousdlvr_service] 생산지시 상세 ID로 검증:",
        detailTxn.inspect_id
      );

      const prodResult = await mariadb.query(
        "selectProductionOrderDetailsById",
        [detailTxn.inspect_id]
      );

      console.log("[wrhousdlvr_service] 생산지시 상세 조회 결과:", prodResult);

      if (prodResult.length > 0) {
        availableQty = Number(prodResult[0].remaining_qty);
        itemName = prodResult[0].item_name || itemName;
      } else {
        throw new Error(
          `생산지시 상세 정보를 찾을 수 없습니다: ${detailTxn.inspect_id}`
        );
      }
    } else {
      // 품질검사서인 경우: PASS_QY에서 이미 입고된 수량 제외
      const typeMap = {
        자재: "E1",
        반제품: "E2",
        완제품: "E3",
      };
      const itemTypeCode = typeMap[detailTxn.item_type] || detailTxn.item_type;

      console.log("[wrhousdlvr_service] 품질검사서 검증:", {
        inspect_id: detailTxn.inspect_id,
        item_type: detailTxn.item_type,
        itemTypeCode: itemTypeCode,
      });

      if (itemTypeCode === "E1") {
        // 자재 품질검사서
        const result = await mariadb.query("selectRscInspectionDetails", [
          detailTxn.inspect_id,
        ]);

        console.log("[wrhousdlvr_service] 자재 품질검사서 조회 결과:", result);

        if (result.length > 0) {
          availableQty = Number(result[0].remaining_qty);
          itemName = result[0].item_name || itemName;
        } else {
          throw new Error(
            `자재 품질검사서 정보를 찾을 수 없습니다: ${detailTxn.inspect_id}`
          );
        }
      } else if (itemTypeCode === "E2") {
        // 반제품 품질검사서
        const result = await mariadb.query("selectSemiInspectionListById", [
          detailTxn.inspect_id,
        ]);

        console.log(
          "[wrhousdlvr_service] 반제품 품질검사서 조회 결과:",
          result
        );

        if (result.length > 0) {
          availableQty = Number(result[0].remaining_qty);
        } else {
          throw new Error(
            `반제품 품질검사서 정보를 찾을 수 없습니다: ${detailTxn.inspect_id}`
          );
        }
      } else if (itemTypeCode === "E3") {
        // 완제품 품질검사서
        const result = await mariadb.query("selectEndPrdtInspectionListById", [
          detailTxn.inspect_id,
        ]);

        console.log(
          "[wrhousdlvr_service] 완제품 품질검사서 조회 결과:",
          result
        );

        if (result.length > 0) {
          availableQty = Number(result[0].remaining_qty);
          itemName = result[0].item_name || itemName;
        } else {
          throw new Error(
            `완제품 품질검사서 정보를 찾을 수 없습니다: ${detailTxn.inspect_id}`
          );
        }
      } else {
        throw new Error(`알 수 없는 품목 유형입니다: ${itemTypeCode}`);
      }
    }

    console.log(`[wrhousdlvr_service] 수량 검증 결과:`, {
      inspect_id: detailTxn.inspect_id,
      요청수량: requestedQty,
      사용가능수량: availableQty,
      품목명: itemName,
      타입: isDeli ? "납품서" : "품질검사서",
    });

    // 사용 가능한 수량보다 많이 요청하는 경우 에러
    if (requestedQty > availableQty) {
      const errorMsg = `수량 부족: ${itemName} (요청: ${requestedQty}, 사용가능: ${availableQty})`;
      console.error("[wrhousdlvr_service] 수량 검증 실패:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("[wrhousdlvr_service] 수량 검증 통과");
  } catch (error) {
    console.error("[wrhousdlvr_service] 수량 검증 실패:", error);
    throw error; // 에러를 다시 던져서 트랜잭션이 롤백되도록 함
  }
};

// LOT 할당 정보 조회 (FIFO 기반 자동 분할)
const getLotAllocations = async (info = {}) => {
  console.log("[wrhousdlvr_service] getLotAllocations 호출됨, info:", info);

  const item_type = (info.item_type ?? "").trim();
  const item_code = (info.item_code ?? "").trim();
  const item_opt_code = (info.item_opt_code ?? "").trim();
  const quantity = toNumberSafe(info.quantity, 0);

  if (!item_type || !item_code || quantity <= 0) {
    console.error("[wrhousdlvr_service] LOT 할당 조회 - 필수 파라미터 누락:", {
      item_type,
      item_code,
      quantity,
    });
    throw new Error("품목 유형, 품목 코드, 수량이 필요합니다.");
  }

  let conn;
  try {
    conn = await mariadb.getConnection();

    // 품목 정보 객체 생성
    const item = {
      item_type,
      item_code,
      item_opt_code,
    };

    console.log("[wrhousdlvr_service] LOT 할당을 위한 품목 정보:", item);

    // 사용 가능한 LOT 조회 (FIFO 순서)
    const availableLots = await getAvailableLotsForItem(item, conn);
    console.log("[wrhousdlvr_service] 사용 가능한 LOT 목록:", availableLots);

    if (availableLots.length === 0) {
      console.warn("[wrhousdlvr_service] 사용 가능한 LOT가 없음");
      return {
        success: true,
        allocations: [],
        message: "사용 가능한 LOT가 없습니다.",
      };
    }

    // LOT 할당 계산 (FIFO 기반 자동 분할)
    const allocations = allocateLotsForWithdrawal(availableLots, quantity);
    console.log("[wrhousdlvr_service] LOT 할당 결과:", allocations);

    // 할당된 총 수량 확인
    const totalAllocated = allocations.reduce(
      (sum, alloc) => sum + alloc.qty,
      0
    );
    const isFullyAllocated = totalAllocated >= quantity;

    console.log("[wrhousdlvr_service] 할당 상세:", {
      요청수량: quantity,
      할당수량: totalAllocated,
      완전할당: isFullyAllocated,
    });

    return {
      success: true,
      allocations: allocations.map((alloc) => ({
        lot_no: alloc.lot_no,
        allocated_qty: alloc.qty,
        warehouse_id: alloc.warehouse_id,
        zone_id: alloc.zone_id,
      })),
      summary: {
        requested_qty: quantity,
        allocated_qty: totalAllocated,
        fully_allocated: isFullyAllocated,
        shortage_qty: isFullyAllocated ? 0 : quantity - totalAllocated,
      },
    };
  } catch (error) {
    console.error("[wrhousdlvr_service] LOT 할당 조회 실패:", error);
    throw error;
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (endError) {
        console.error("[wrhousdlvr_service] 연결 종료 실패:", endError);
      } finally {
        conn.release();
        console.log("[wrhousdlvr_service] DB 연결 해제됨");
      }
    }
  }
};

// 모달용: 마스터+디테일 JOIN 검색
async function searchWrhsdlvrMasterDetail({
  rsc_ordr_nm,
  rcvpay_ty,
  emp_nm,
  reg_dt,
}) {
  const params = [
    rsc_ordr_nm || "",
    rsc_ordr_nm || "",
    rcvpay_ty || "",
    rcvpay_ty || "",
    emp_nm || "",
    emp_nm || "",
    reg_dt || "",
    reg_dt || "",
  ];
  const rows = await mariadb.query("wrhsdlvrModalSearch", params);
  return rows;
}

// 단건: 마스터+디테일
async function getWrhsdlvrMasterDetailById(masId) {
  const [master] = await mariadb.query("wrhsdlvrMasterById", [masId]);
  const detailsRaw = await mariadb.query("wrhsdlvrDetailByMasId", [masId]);
  // 화면 변수명에 맞게 details 매핑
  const details = detailsRaw.map((row) => ({
    id: row.wrhous_wrhsdlvr_id || row.wrhsdlvr_id || row.wrhsdlvr_mas_id || "",
    code: row.prdt_id || row.rsc_id || row.code || "",
    name: row.prdt_nm || row.rsc_nm || row.name || "",
    opt_code: row.prdt_opt_id || "",
    opt_name: row.opt_nm || row.opt_name || "",
    unit: row.unit || "",
    spec: row.spec || "",
    type: row.prdt_id ? "완제품" : row.rsc_id ? "자재" : "반제품",
    emp_nm: row.emp_nm || "",
    qty: row.rcvpay_qy || row.qty || row.qy || 0,
    remark: row.rm || row.remark || "",
    inspect_id:
      row.rsc_qlty_insp_id ||
      row.semi_prdt_qlty_insp_id ||
      row.end_prdt_qlty_insp_id ||
      row.deli_deta_id ||
      row.rsc_rtun_trget_id ||
      "",
    warehouse_id: row.warehous_id || row.wrhous_id || "",
    warehouse_name: row.warehous_id || row.wrhous_id || "",
    zone_id: row.zone_id || "",
    location_id: row.zone_id || "",
    location_name: row.zone_id || "",
    lot: row.lot_no || "",
    lot_no: row.lot_no || "",
    ...row, // 원본 row도 포함(디버깅/확장성)
  }));
  return { master, details };
}

const deleteSelectedTransactions = async (detailIds = []) => {
  const ids = Array.isArray(detailIds) ? detailIds.filter(Boolean) : [];
  if (!ids.length) return { success: true, count: 0 };

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    // 1) 삭제 대상 패킷 조회 (디테일 ↔ 마스터, 모드 포함)
    const ph = ids.map(() => "?").join(",");
    const packSql = sqlList["selectWrhousdlvrDeletePackByDetailIds"].replace("%IDS%", ph);
    const rows = await conn.query(packSql, ids); // ← rows로 받음
    // rows 컬럼: detail_id, mas_id, detail_qty, rtun_id, rcvpay_ty, mas_total_qty
    // (정의 확인) SELECT 패킷 스키마 참조. 
    //  - rcvpay_ty: 'S1'=입고, 'S2'=출고
    //  - rtun_id: 자재불출 연계 ID (있을 수도/없을 수도)
    //  (정의 위치) wrhousdlvr.js
    //  SELECT ... FROM WRHOUS_WRHSDLVR d JOIN WRHOUS_WRHSDLVR_MAS m ... IN (%IDS%)

    // 2) 디테일 먼저 실제 삭제
    for (const id of ids) {
      await conn.query(sqlList["deleteWrhousTransaction"], [id]); // ← 존재하는 키로 교체
    }

    // 3) 마스터/LOT/자재불출 롤백 집계
    const byMas = new Map();
    for (const row of rows) {
      const k = row.mas_id;
      if (!byMas.has(k)) byMas.set(k, { qtySum: 0, rcvpay_ty: row.rcvpay_ty, rtunIds: [] });
      byMas.get(k).qtySum += Number(row.detail_qty) || 0;
      if (row.rtun_id) byMas.get(k).rtunIds.push(row.rtun_id);
    }

    // 4) 마스터별로 롤백 실행
    for (const [masId, info] of byMas.entries()) {
      const delta = info.qtySum;

      // 4-1) 마스터 총수량 감소
      await conn.query(sqlList["decreaseWrhousdlvrMasQty"], [delta, masId]);

      // 4-2) LOT 롤백 (입고 vs 출고)
      if (info.rcvpay_ty === "S1") {
        // 입고 삭제: IST_QY, NOW_STC_QY 감소 → 0이면 LOT 삭제
        await conn.query(sqlList["decreaseLotIstQtyByMasId"], [delta, delta, masId]);
        await conn.query(sqlList["deleteLotIfZeroByMasId"], [masId]);
      } else if (info.rcvpay_ty === "S2") {
        // 출고 삭제: OUST_QY 감소 + NOW_STC_QY 증가 (되돌림)
        await conn.query(sqlList["decreaseLotOustQtyByS2MasId"], [delta, delta, masId]);
      }

      // 4-3) 자재불출 연계 수량 롤백 & 0이면 삭제
      for (const rtunId of info.rtunIds) {
        await conn.query(sqlList["decreaseRwmatrRtunTrgetQty"], [delta, rtunId]);
        await conn.query(sqlList["deleteRwmatrRtunTrgetIfZero"], [rtunId]);
      }

      // 4-4) 마스터 총수량이 0이면 마스터 삭제
      await conn.query(sqlList["deleteWrhousdlvrMasIfZero"], [masId]);
    }

    await conn.commit();
    return { success: true, count: ids.length };
  } catch (err) {
    if (conn) await conn.rollback();
    return { success: false, error: err.message };
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getInspectionRemainingQty,
  getTransactionList,
  getInspectionList,
  saveTransaction,
  saveMasterDetailTransactions, // 기존
  saveWarehouseTransactions, // 새로 추가
  getInventoryStatus,
  getItemTransactionHistory,
  getQualityInspectionList: getFinishedQualityInspectionList, // 기존 호환성
  getFinishedQualityInspectionList,
  getSemiQualityInspectionList,
  getDeliveryDetailList,
  getRscQualityInspectionList,
  getMaterialWithdrawalList,
  getDeliveryInspectionList,
  getOrderInspectionList,
  getInstructionInspectionList,
  // 새로 추가된 기능들
  generateLotNumber,
  processTransactions,
  // DB 쿼리 실행 헬퍼
  // 창고 입출고 전용 검사서 조회 함수들
  getWarehouseRscInspections,
  getWarehouseSemiInspections,
  getWarehouseEndPrdtInspections,
  getWarehouseMaterials,
  getWarehouseProducts,
  // 새로운 출고 관련 기능들
  getDeliveryProductsList,
  getMaterialWithdrawalList,
  getProductionOrderDetailsList,
  getMaterialByProductionOrder,
  // 창고 및 로케이션 조회 기능
  getAllWarehouses,
  getAllLocations,
  // LOT 할당 조회 기능
  getLotAllocations,
  // 개선된 재고 조회 기능
  getInventoryStatusByType,
  // 가용 수량 단건 조회 래퍼
  getAvailableQty,
  updateQty,
  buildLotAllocationResponse,
  searchWrhsdlvrMasterDetail,
  getWrhsdlvrMasterDetailById,
  searchWrhsdlvrMasterDetail,
  deleteSelectedTransactions,
};
