const mariadb = require("../database/mapper.js");

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
  return result;
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
      isSuccessed: false,
      error: "거래 저장 중 오류가 발생했습니다.",
      details: error.message,
    };
  }
};

// 창고 입출고 거래 삭제
const deleteTransaction = async (txnId) => {
  if (!txnId) {
    throw new Error("삭제할 거래 ID가 필요합니다.");
  }

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    await mariadb.query("deleteWrhousTransaction", [txnId]);

    await conn.commit();
    return { isSuccessed: true };
  } catch (err) {
    if (conn)
      try {
        await conn.rollback();
      } catch (_) {}
    console.error(
      "[wrhousdlvr_service] delete error:",
      err && err.stack ? err.stack : err
    );
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 선택된 거래들 일괄 삭제
const deleteSelectedTransactions = async (ids = []) => {
  const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
  if (!list.length) {
    return { isSuccessed: true, count: 0 };
  }

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    for (const id of list) {
      await mariadb.query("deleteWrhousTransaction", [id]);
    }

    await conn.commit();
    return { isSuccessed: true, count: list.length };
  } catch (err) {
    if (conn)
      try {
        await conn.rollback();
      } catch (_) {}
    console.error(
      "[wrhousdlvr_service] delete selected error:",
      err && err.stack ? err.stack : err
    );
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 품목별 현재 재고 조회
const getInventoryStatus = async (itemCode) => {
  if (!itemCode) {
    return [];
  }

  console.log("[wrhousdlvr_service] getInventoryStatus itemCode ->", itemCode);
  const result = await mariadb.query("selectInventoryStatus", [itemCode]);
  return result;
};

// 품목별 입출고 이력 조회
const getItemTransactionHistory = async (itemCode) => {
  if (!itemCode) {
    return [];
  }

  console.log(
    "[wrhousdlvr_service] getItemTransactionHistory itemCode ->",
    itemCode
  );
  const result = await mariadb.query("selectItemTransactionHistory", [
    itemCode,
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

    return results;
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
    return results;
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

    return results;
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

// LOT 번호 생성 함수
const generateLotNumber = async (inspType) => {
  try {
    let prefix = "";

    // 검사 유형 또는 품목 유형에 따른 LOT prefix 결정
    switch (inspType) {
      case "materialQuality":
      case "E1": // 자재
        prefix = "LOT_RSC_";
        break;
      case "semiQuality":
      case "E2": // 반제품
        prefix = "LOT_SEMI_";
        break;
      case "finishedQuality":
      case "E3": // 완제품
        prefix = "LOT_END_";
        break;
      default:
        prefix = "LOT_";
        break;
    }

    const lotNo = await mariadb.query(createLotno, [prefix]);

    console.log(`[wrhousdlvr_service] 생성된 LOT 번호: ${lotNo}`);
    return lotNo;
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

    const sql = sqlList.selectInventoryStatus;
    const results = await mariadb.query(sql, [itemCode]);

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
  try {
    const { transactionList, emp_id } = requestData;

    console.log(
      `[wrhousdlvr_service] processTransactions 시작 - 총 ${
        transactionList?.length || 0
      }건`
    );

    if (!Array.isArray(transactionList) || transactionList.length === 0) {
      return {
        isSuccessed: false,
        error: "처리할 거래 데이터가 없습니다.",
      };
    }

    // 동일 품목 거래 통합 (클라이언트에서 이미 처리됨 - 비활성화)
    // const consolidatedTransactions = consolidateTransactions(transactionList);
    const consolidatedTransactions = transactionList; // 클라이언트 통합 결과 그대로 사용

    console.log(
      `[wrhousdlvr_service] 거래 처리: ${transactionList.length}건 (클라이언트 통합 완료)`
    );

    const processedTransactions = [];

    // 각 거래 항목 처리
    for (const transaction of consolidatedTransactions) {
      const {
        txn_type, // 'in' 또는 'out'
        item_type, // '자재', '반제품', '완제품'
        item_code,
        item_name,
        item_spec,
        item_unit,
        qty,
        insp_no,
        insp_type,
        txn_date,
        remark,
        insp_nos, // 통합된 검사서 번호 배열
      } = transaction;

      console.log(`[wrhousdlvr_service] 거래 처리 중:`, {
        txn_type,
        item_type,
        item_type_name: transaction.item_type_name,
        item_code,
        item_name,
        qty,
        insp_no,
        insp_type,
        warehouse_id: transaction.warehouse_id,
        location_id: transaction.location_id,
      });

      // item_type은 이미 공통코드(E1, E2, E3)로 전달됨
      const itemTypeCode = item_type || "E3"; // 기본값: 완제품

      console.log(`[wrhousdlvr_service] 품목유형 코드 사용: ${itemTypeCode}`);

      // 통합 거래의 경우 첫 번째 검사서 번호 사용, 단일 거래는 기존 방식 유지
      const primaryInspNo = insp_nos ? insp_nos[0] : insp_no;
      const consolidatedRemark =
        remark ||
        `${
          txn_type === "in" ? "입고" : "출고"
        } 처리 - 검사서: ${primaryInspNo}`;

      // 필수 데이터 검증
      if (!item_code || !item_name || !qty || qty <= 0) {
        console.error(`[wrhousdlvr_service] 필수 데이터 누락:`, {
          item_code,
          item_name,
          qty,
        });
        return {
          isSuccessed: false,
          error: `필수 데이터가 누락되었습니다. 품목코드: ${item_code}, 품목명: ${item_name}, 수량: ${qty}`,
        };
      }

      // 출고의 경우 재고 검증
      if (txn_type === "out") {
        const validation = await validateInventoryForOutbound(
          item_code,
          Number(qty)
        );
        if (!validation.isValid) {
          return {
            isSuccessed: false,
            error: validation.message,
            details: `품목 ${item_code} (${item_name}) 재고 부족`,
          };
        }
      }

      // LOT 번호 생성 (입고의 경우만)
      let lotNo = null;
      if (txn_type === "in" && insp_type) {
        lotNo = await generateLotNumber(insp_type);
        console.log(
          `[wrhousdlvr_service] LOT 번호 생성: ${lotNo} (입고, 타입: ${insp_type})`
        );
      }

      // 거래 ID 생성 (WRH_IN/OUT 형식)
      const wrhousWrhsdlvrId = await generateTransactionId(txn_type);
      console.log(`[wrhousdlvr_service] 거래 ID 생성: ${wrhousWrhsdlvrId}`);

      // 창고 입출고 기록 생성 (정의된 SQL 쿼리 사용)
      const insertParams = [
        wrhousWrhsdlvrId,
        txn_type === "in" ? "입고" : "출고", // DLVR_TY
        itemTypeCode, // ITEM_TY (공통코드: E1, E2, E3)
        item_code || "", // ITEM_CODE
        item_name || "", // ITEM_NM
        item_spec || "", // SPEC
        item_unit || "EA", // UNIT
        Number(qty) || 0, // QY
        primaryInspNo || null, // INSP_ID
        transaction.warehouse_id || "WH_001", // WRHOUS_ID (요청에서 전달된 값 사용)
        transaction.location_id ||
          (itemTypeCode === "E1"
            ? "ZONE_MAT_001"
            : itemTypeCode === "E2"
            ? "ZONE_SEMI_001"
            : "ZONE_PROD_001"), // ZONE_ID (공통코드 기반)
        emp_id || "EMP_001", // EMP_ID
        lotNo || null, // LOT_NO
        consolidatedRemark || "", // RM
      ];

      // 파라미터 유효성 검사
      const paramNames = [
        "WRHSDLVR_ID",
        "DLVR_TY",
        "ITEM_TY",
        "ITEM_CODE",
        "ITEM_NM",
        "SPEC",
        "UNIT",
        "QY",
        "INSP_ID",
        "WRHOUS_ID",
        "ZONE_ID",
        "EMP_ID",
        "LOT_NO",
        "RM",
      ];

      console.log(`[wrhousdlvr_service] 파라미터 검증:`);
      insertParams.forEach((param, index) => {
        console.log(
          `  ${index}: ${paramNames[index]} = ${typeof param} (${param})`
        );
      });

      console.log(
        `[wrhousdlvr_service] 데이터베이스 삽입 파라미터 (${insertParams.length}개):`,
        insertParams
      );

      // 먼저 간단한 테스트 쿼리로 연결 확인
      console.log(`[wrhousdlvr_service] 데이터베이스 연결 테스트 시작`);
      const testResult = await mariadb.query("SELECT 1 as test");
      console.log(`[wrhousdlvr_service] 데이터베이스 연결 성공:`, testResult);

      // 실제 삽입 시도
      console.log(`[wrhousdlvr_service] 실제 삽입 시작`);

      try {
        // MariaDB 연결 풀에서 직접 연결 획득하여 쿼리 실행
        let conn;
        try {
          conn = await mariadb.getConnection();
          console.log(`[wrhousdlvr_service] 연결 획득 성공`);

          console.log(
            `[wrhousdlvr_service] 전체 삽입 시도 - 파라미터 ${insertParams.length}개`
          );
          console.log(`[wrhousdlvr_service] SQL:`, insertWrhousTransaction);
          console.log(`[wrhousdlvr_service] 파라미터:`, insertParams);

          const result = await mariadb.query(
            insertWrhousTransaction,
            insertParams
          );
          console.log(`[wrhousdlvr_service] 전체 삽입 성공!`, result);
        } finally {
          if (conn) conn.release();
        }
      } catch (fullError) {
        console.error(`[wrhousdlvr_service] 전체 삽입 실패:`, fullError);
        console.error(`[wrhousdlvr_service] 오류 메시지:`, fullError.message);
        console.error(`[wrhousdlvr_service] 오류 코드:`, fullError.code);
      }

      console.log(`[wrhousdlvr_service] 거래 저장 성공: ${wrhousWrhsdlvrId}`);

      processedTransactions.push({
        wrhous_wrhsdlvr_id: wrhousWrhsdlvrId,
        lot_no: lotNo,
        item_code,
        item_name,
        qty: Number(qty),
        txn_type,
      });
    }

    return {
      isSuccessed: true,
      message: `${consolidatedTransactions.length}건의 거래가 성공적으로 처리되었습니다. (원본: ${transactionList.length}건)`,
      data: processedTransactions,
    };
  } catch (error) {
    console.error("[wrhousdlvr_service] 거래 처리 실패:", error);
    return {
      isSuccessed: false,
      error: "거래 처리 중 오류가 발생했습니다.",
      details: error.message,
    };
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

    console.log(
      `[wrhousdlvr_service] 창고용 자재 검사서 조회 결과: ${
        results?.length || 0
      }건`
    );
    return results || [];
  } catch (error) {
    console.error("[wrhousdlvr_service] 창고용 자재 검사서 조회 실패:", error);
    return [];
  }
};

// 반제품 품질검사서 목록 조회 (창고 입출고용)
const getWarehouseSemiInspections = async (item_code = "", item_name = "") => {
  try {
    console.log(
      `[wrhousdlvr_service] 창고용 반제품 검사서 조회 - item_code: ${item_code}, item_name: ${item_name}`
    );

    const params = [item_code, item_code, item_name, item_name];

    const results = await mariadb.query("selectSemiInspectionList", params);

    console.log(
      `[wrhousdlvr_service] 창고용 반제품 검사서 조회 결과: ${
        results?.length || 0
      }건`
    );
    return results || [];
  } catch (error) {
    console.error(
      "[wrhousdlvr_service] 창고용 반제품 검사서 조회 실패:",
      error
    );
    return [];
  }
};

// 완제품 품질검사서 목록 조회 (창고 입출고용)
const getWarehouseEndPrdtInspections = async (
  item_code = "",
  item_name = ""
) => {
  try {
    console.log(
      `[wrhousdlvr_service] 창고용 완제품 검사서 조회 - item_code: ${item_code}, item_name: ${item_name}`
    );

    const params = [item_code, item_code, item_name, item_name];

    const results = await mariadb.query("selectEndPrdtInspectionList", params);

    console.log(
      `[wrhousdlvr_service] 창고용 완제품 검사서 조회 결과: ${
        results?.length || 0
      }건`
    );
    return results || [];
  } catch (error) {
    console.error(
      "[wrhousdlvr_service] 창고용 완제품 검사서 조회 실패:",
      error
    );
    return [];
  }
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

    // 1. 마스터 테이블 저장 (WRHOUS_WRHSDLVR_MAS)
    const masterInsertedIds = [];
    for (const master of masterTransactions) {
      const masterId = uuidv4();
      masterInsertedIds.push(masterId);

      console.log(
        `[wrhousdlvr_service] 마스터 저장: ${master.item_code} - ${master.item_name}`
      );

      // 품목 유형에 따라 RSC_ID 또는 PRDT_ID 설정
      let rscId = null;
      let prdtId = null;
      let prdtOptId = null;

      if (master.item_type === "E1") {
        // 자재
        rscId = master.item_code;
      } else {
        // 반제품, 완제품
        prdtId = master.item_code;
        prdtOptId = master.item_opt_code || null;
      }

      // LOT 번호 생성
      const lotNumber = await generateLotNumber(
        master.item_code,
        master.warehouse_id
      );

      await mariadb.query("insertWrhousTransactionMaster", [
        masterId, // WRHSDLVR_MAS_ID
        master.rcvpay_ty || (mode === "in" ? "S1" : "S2"), // RCVPAY_TY (입고: S1, 출고: S2)
        master.emp_id || "EMP_001", // EMP_ID
        rscId, // RSC_ID
        prdtId, // PRDT_ID
        prdtOptId, // PRDT_OPT_ID
        master.warehouse_id, // WRHOUS_ID
        master.zone_id, // ZONE_ID
        lotNumber, // LOT_NO
        master.item_spec || "", // SPEC
        master.item_unit || "EA", // UNIT
        Number(master.total_qty) || 0, // ALL_RCVPAY_QY
        master.rcvpay_dt || new Date().toISOString().split("T")[0], // RCVPAY_DT
        master.remark || "", // RM
      ]);
    }

    // 2. 디테일 테이블 저장 (WRHOUS_WRHSDLVR)
    let detailCount = 0;
    for (const detail of detailTransactions) {
      const detailId = uuidv4();

      // 해당하는 마스터 ID 찾기 (품목코드 기준)
      const correspondingMasterId = masterInsertedIds[0]; // 임시로 첫 번째 마스터 ID 사용

      // 검사 유형에 따라 해당 컬럼에 검사 ID 설정
      let rscQltyInspId = null;
      let semiPrdtQltyInspId = null;
      let endPrdtQltyInspId = null;
      let deliDetaId = null;

      if (detail.item_type === "E1") {
        // 자재
        rscQltyInspId = detail.inspect_id;
      } else if (detail.item_type === "E2") {
        // 반제품
        semiPrdtQltyInspId = detail.inspect_id;
      } else if (detail.item_type === "E3") {
        // 완제품
        endPrdtQltyInspId = detail.inspect_id;
      }

      console.log(
        `[wrhousdlvr_service] 디테일 저장: ${detail.item_code} - 수량: ${detail.qty}`
      );

      await mariadb.query("insertWrhousTransaction", [
        detailId, // WRHOUS_WRHSDLVR_ID
        correspondingMasterId, // WRHSDLVR_MAS_ID
        rscQltyInspId, // RSC_QLTY_INSP_ID
        semiPrdtQltyInspId, // SEMI_PRDT_QLTY_INSP_ID
        endPrdtQltyInspId, // END_PRDT_QLTY_INSP_ID
        deliDetaId, // deli_deta_id
        Number(detail.qty) || 0, // RCVPAY_QY
        detail.remark || "", // RM
      ]);

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

      // 출고 시 재고 확인
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
              total_qty: allocation.qty,
              lot_no: allocation.lot_no,
              // warehouse_id와 zone_id는 사용자가 선택한 원본 값 유지 (allocation에서 덮어쓰지 않음)
            },
            mode,
            conn
          );

          masterInsertedIds.push(masterId);
        }
      } else {
        // 입고 시 LOT 생성
        const lotPrefix = getLotPrefix(masterTxn.item_type);
        const lotNo = await generateNewLotNumber(lotPrefix, conn);

        const masterId = await processMasterTransaction(
          {
            ...masterTxn,
            lot_no: lotNo,
          },
          mode,
          conn
        );

        masterInsertedIds.push(masterId);
      }
    }

    // 4. 디테일 거래 처리
    const rcvpayTy = mode === "in" ? "S1" : "S2"; // 입고: S1, 출고: S2
    for (const detailTxn of detailTransactions) {
      console.log("[wrhousdlvr_service] 디테일 거래 처리:", detailTxn);
      console.log(
        "[wrhousdlvr_service] deli_deta_id 값:",
        detailTxn.deli_deta_id
      );
      console.log("[wrhousdlvr_service] inspect_id 값:", detailTxn.inspect_id);
      console.log("[wrhousdlvr_service] 수량:", detailTxn.qty);

      // 수량 검증: 검사서/납품서의 사용 가능한 수량보다 많이 요청하는지 확인
      await validateTransactionQuantity(detailTxn, mode, conn);

      const detailId = await processDetailTransaction(
        detailTxn,
        masterInsertedIds[0],
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
  return prefixMap[itemType] || "LOT_END_";
};

// 새 LOT 번호 생성
const generateNewLotNumber = async (prefix) => {
  try {
    const result = await mariadb.query("createLotno", [prefix, prefix]);

    return (
      result[0]?.lot_no ||
      `${prefix}${new Date().getFullYear().toString().slice(-2)}${(
        new Date().getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}001`
    );
  } catch (error) {
    console.error("[wrhousdlvr_service] LOT 번호 생성 실패:", error);
    throw error;
  }
};

// 출고 가능한 LOT 조회
const getAvailableLotsForItem = async (item) => {
  try {
    const rscId = item.item_type === "E1" ? item.item_code : "";
    const prdtId = ["E2", "E3"].includes(item.item_type) ? item.item_code : "";
    const prdtOptId = item.item_opt_code || "";

    const result = await mariadb.query("selectAvailableLots", [
      rscId,
      rscId,
      prdtId,
      prdtId,
      prdtOptId,
      prdtOptId,
    ]);

    return result || [];
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

    // EMP_ID 검증 - 존재하지 않으면 NULL 처리
    let validEmpId = null;
    if (masterTxn.emp_id) {
      try {
        const empCheck = await conn.query("validateEmployeeId", [
          masterTxn.emp_id,
        ]);
        if (empCheck && empCheck.length > 0) {
          validEmpId = masterTxn.emp_id;
        }
      } catch (empError) {
        console.warn(
          `[wrhousdlvr_service] EMP_ID 확인 실패: ${masterTxn.emp_id}`,
          empError
        );
      }
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
      (prefix, prefix),
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
      const deliResult = await conn.query(
        `
        SELECT dd.deli_qy, 
               COALESCE(SUM(wd.RCVPAY_QY), 0) AS delivered_qty,
               (dd.deli_qy - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
               p.prdt_nm AS item_name
        FROM deli_deta dd 
        JOIN rcvord_deta rd ON dd.rcvord_deta_id = rd.rcvord_deta_id
        JOIN prdt p ON rd.prdt_id = p.prdt_id
        LEFT JOIN WRHOUS_WRHSDLVR wd ON dd.deli_deta_id = wd.DELI_DETA_ID
        LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
               AND wm.RCVPAY_TY = 'S2'
        WHERE dd.deli_deta_id = ?
        GROUP BY dd.deli_deta_id, dd.deli_qy, p.prdt_nm
      `,
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

      const prodResult = await conn.query(
        `
        SELECT pdd.drct_qy, 
               COALESCE(SUM(wd.RCVPAY_QY), 0) AS withdrawn_qty,
               (pdd.drct_qy - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
               p.prdt_nm AS item_name
        FROM prod_drct_deta pdd 
        JOIN prdt p ON pdd.prdt_id = p.prdt_id
        LEFT JOIN WRHOUS_WRHSDLVR wd ON pdd.prod_drct_deta_id = wd.RSC_QLTY_INSP_ID
        LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
               AND wm.RCVPAY_TY = 'S2'
        WHERE pdd.prod_drct_deta_id = ?
        GROUP BY pdd.prod_drct_deta_id, pdd.drct_qy, p.prdt_nm
      `,
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
        const result = await conn.query(
          `
          SELECT qi.PASS_QY,
                 COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
                 (qi.PASS_QY - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
                 r.RSC_NM AS item_name
          FROM RSC_QLTY_INSP qi
          LEFT JOIN RSC_ORDR_DETA rod ON qi.RSC_ORDR_DETA_ID = rod.RSC_ORDR_DETA_ID
          LEFT JOIN RSC r ON rod.RSC_ID = r.RSC_ID
          LEFT JOIN WRHOUS_WRHSDLVR wd ON qi.RSC_QLTY_INSP_ID = wd.RSC_QLTY_INSP_ID
          LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
                 AND wm.RCVPAY_TY = 'S1'
          WHERE qi.RSC_QLTY_INSP_ID = ?
          GROUP BY qi.RSC_QLTY_INSP_ID, qi.PASS_QY, r.RSC_NM
        `,
          [detailTxn.inspect_id]
        );

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
        const result = await conn.query(
          `
          SELECT qi.PASS_QY,
                 COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
                 (qi.PASS_QY - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
                 'semi_product' AS item_name
          FROM SEMI_PRDT_QLTY_INSP qi
          LEFT JOIN WRHOUS_WRHSDLVR wd ON qi.SEMI_PRDT_QLTY_INSP_ID = wd.SEMI_PRDT_QLTY_INSP_ID
          LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
                 AND wm.RCVPAY_TY = 'S1'
          WHERE qi.SEMI_PRDT_QLTY_INSP_ID = ?
          GROUP BY qi.SEMI_PRDT_QLTY_INSP_ID, qi.PASS_QY
        `,
          [detailTxn.inspect_id]
        );

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
        const result = await conn.query(
          `
          SELECT qi.PASS_QY,
                 COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
                 (qi.PASS_QY - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
                 p.prdt_nm AS item_name
          FROM END_PRDT_QLTY_INSP qi
          LEFT JOIN PROD_DRCT_DETA pdd ON qi.PROD_DRCT_DETA_ID = pdd.PROD_DRCT_DETA_ID
          LEFT JOIN prdt p ON pdd.prdt_id = p.prdt_id
          LEFT JOIN WRHOUS_WRHSDLVR wd ON qi.END_PRDT_QLTY_INSP_ID = wd.END_PRDT_QLTY_INSP_ID
          LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
                 AND wm.RCVPAY_TY = 'S1'
          WHERE qi.END_PRDT_QLTY_INSP_ID = ?
          GROUP BY qi.END_PRDT_QLTY_INSP_ID, qi.PASS_QY, p.prdt_nm
        `,
          [detailTxn.inspect_id]
        );

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
      }
    }
  }
};

module.exports = {
  getTransactionList,
  getInspectionList,
  saveTransaction,
  saveMasterDetailTransactions, // 기존
  saveWarehouseTransactions, // 새로 추가
  deleteTransaction,
  deleteSelectedTransactions,
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
};
