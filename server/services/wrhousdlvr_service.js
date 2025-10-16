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
    console.log("[wrhousdlvr_service] saveTransaction 호출됨 - 새로운 통합 로직 적용");
    console.log("[wrhousdlvr_service] 입력 데이터:", { 
      transactionListLength: transactionList?.length || 0,
      emp_id,
      firstTransaction: transactionList?.[0] || null
    });
    
    // 기존 API 호환을 위한 데이터 변환 및 새로운 processTransactions 호출
    const result = await processTransactions({
      transactionList: transactionList || [],
      emp_id: emp_id || 'EMP_001'
    });
    
    console.log("[wrhousdlvr_service] saveTransaction 결과:", result);
    return result;
    
  } catch (error) {
    console.error("[wrhousdlvr_service] saveTransaction 오류:", error);
    console.error("[wrhousdlvr_service] 오류 스택:", error.stack);
    return {
      isSuccessed: false,
      error: "거래 저장 중 오류가 발생했습니다.",
      details: error.message
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
const getProductionOrderDetailsList = async (product_code = "", product_name = "") => {
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

    const results = await mariadb.query("selectMaterialByProductionOrder", params);

    console.log(
      "[wrhousdlvr_service] BOM 자재 목록 조회 결과:",
      results.length + "건"
    );

    return results.map((item) => ({
      ...item,
      bom_qty: toNumberSafe(item.bom_qty, 0),
      order_qty: toNumberSafe(item.order_qty, 0),
      required_qty: toNumberSafe(item.required_qty, 0),
      withdrawn_qty: toNumberSafe(item.withdrawn_qty, 0),
      remaining_qty: toNumberSafe(item.remaining_qty, 0),
    }));
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
      insp_type: "deliveryDetail"
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

    // 현재 년월 기준 다음 시퀀스 번호 조회
    const sql = `
      SELECT CONCAT('${prefix}', CONCAT(DATE_FORMAT(NOW(), '%y%m'),
        LPAD(IFNULL(MAX(SUBSTR(lot_no, -3)), 0) + 1, 3, '0'))) as lot_no
      FROM wrhous_wrhsdlvr
      WHERE lot_no LIKE CONCAT('${prefix}', DATE_FORMAT(NOW(), '%y%m'), '%')
    `;

    const results = await mariadb.query(sql);
    const lotNo =
      results?.[0]?.lot_no ||
      `${prefix}${new Date().toISOString().slice(2, 7).replace("-", "")}001`;

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
    const prefix = txnType === 'in' ? 'WRH_IN_' : 'WRH_OUT_';
    
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
    console.log(`[wrhousdlvr_service] 재고 검증 - 품목: ${itemCode}, 요청수량: ${requestQty}`);
    
    const sql = sqlList.selectInventoryStatus;
    const results = await mariadb.query(sql, [itemCode]);
    
    if (!results || results.length === 0) {
      return {
        isValid: false,
        currentStock: 0,
        message: `품목 ${itemCode}의 재고가 없습니다.`
      };
    }
    
    const currentStock = results[0].current_stock || 0;
    const isValid = currentStock >= requestQty;
    
    console.log(`[wrhousdlvr_service] 재고 검증 결과 - 현재재고: ${currentStock}, 유효성: ${isValid}`);
    
    return {
      isValid,
      currentStock,
      message: isValid 
        ? `재고 확인 완료 (현재: ${currentStock}, 요청: ${requestQty})`
        : `재고 부족 (현재: ${currentStock}, 요청: ${requestQty})`
    };
  } catch (error) {
    console.error("[wrhousdlvr_service] 재고 검증 실패:", error);
    return {
      isValid: false,
      currentStock: 0,
      message: "재고 검증 중 오류가 발생했습니다."
    };
  }
};

// 거래 통합 함수 (동일 품목 여러 검사서 통합)
const consolidateTransactions = (transactions) => {
  try {
    console.log(`[wrhousdlvr_service] 거래 통합 시작 - 총 ${transactions.length}건`);
    
    const consolidated = {};
    
    transactions.forEach(txn => {
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
          remark: `통합거래 - 검사서: ${txn.insp_no}`
        };
      }
    });
    
    const result = Object.values(consolidated);
    console.log(`[wrhousdlvr_service] 거래 통합 완료 - ${transactions.length}건 → ${result.length}건`);
    
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

    console.log(`[wrhousdlvr_service] processTransactions 시작 - 총 ${transactionList?.length || 0}건`);

    if (!Array.isArray(transactionList) || transactionList.length === 0) {
      return {
        isSuccessed: false,
        error: "처리할 거래 데이터가 없습니다.",
      };
    }

    // 동일 품목 거래 통합 (클라이언트에서 이미 처리됨 - 비활성화)
    // const consolidatedTransactions = consolidateTransactions(transactionList);
    const consolidatedTransactions = transactionList; // 클라이언트 통합 결과 그대로 사용
    
    console.log(`[wrhousdlvr_service] 거래 처리: ${transactionList.length}건 (클라이언트 통합 완료)`);
    
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
        location_id: transaction.location_id
      });

      // item_type은 이미 공통코드(E1, E2, E3)로 전달됨
      const itemTypeCode = item_type || "E3"; // 기본값: 완제품
      
      console.log(`[wrhousdlvr_service] 품목유형 코드 사용: ${itemTypeCode}`);

      // 통합 거래의 경우 첫 번째 검사서 번호 사용, 단일 거래는 기존 방식 유지
      const primaryInspNo = insp_nos ? insp_nos[0] : insp_no;
      const consolidatedRemark = remark || `${txn_type === "in" ? "입고" : "출고"} 처리 - 검사서: ${primaryInspNo}`;

      // 필수 데이터 검증
      if (!item_code || !item_name || !qty || qty <= 0) {
        console.error(`[wrhousdlvr_service] 필수 데이터 누락:`, {
          item_code,
          item_name,
          qty
        });
        return {
          isSuccessed: false,
          error: `필수 데이터가 누락되었습니다. 품목코드: ${item_code}, 품목명: ${item_name}, 수량: ${qty}`
        };
      }

      // 출고의 경우 재고 검증
      if (txn_type === "out") {
        const validation = await validateInventoryForOutbound(item_code, Number(qty));
        if (!validation.isValid) {
          return {
            isSuccessed: false,
            error: validation.message,
            details: `품목 ${item_code} (${item_name}) 재고 부족`
          };
        }
      }

      // LOT 번호 생성 (입고의 경우만)
      let lotNo = null;
      if (txn_type === "in" && insp_type) {
        lotNo = await generateLotNumber(insp_type);
        console.log(`[wrhousdlvr_service] LOT 번호 생성: ${lotNo} (입고, 타입: ${insp_type})`);
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
        transaction.location_id || (itemTypeCode === "E1" ? "ZONE_MAT_001" : itemTypeCode === "E2" ? "ZONE_SEMI_001" : "ZONE_PROD_001"), // ZONE_ID (공통코드 기반)
        emp_id || "EMP_001", // EMP_ID
        lotNo || null, // LOT_NO
        consolidatedRemark || "", // RM
      ];

      // 파라미터 유효성 검사
      const paramNames = [
        'WRHSDLVR_ID', 'DLVR_TY', 'ITEM_TY', 'ITEM_CODE', 'ITEM_NM',
        'SPEC', 'UNIT', 'QY', 'INSP_ID', 'WRHOUS_ID',
        'ZONE_ID', 'EMP_ID', 'LOT_NO', 'RM'
      ];
      
      console.log(`[wrhousdlvr_service] 파라미터 검증:`);
      insertParams.forEach((param, index) => {
        console.log(`  ${index}: ${paramNames[index]} = ${typeof param} (${param})`);
      });

      console.log(`[wrhousdlvr_service] 데이터베이스 삽입 파라미터 (${insertParams.length}개):`, insertParams);
      
      // 먼저 간단한 테스트 쿼리로 연결 확인
      console.log(`[wrhousdlvr_service] 데이터베이스 연결 테스트 시작`);
      const testResult = await mariadb.query("SELECT 1 as test");
      console.log(`[wrhousdlvr_service] 데이터베이스 연결 성공:`, testResult);
      
      // 테이블 구조 확인
      console.log(`[wrhousdlvr_service] 테이블 구조 확인 시작`);
      const tableInfo = await mariadb.query("DESCRIBE WRHOUS_WRHSDLVR");
      console.log(`[wrhousdlvr_service] 테이블 구조:`, tableInfo.map(col => `${col.Field} (${col.Type}, ${col.Null})`));
      
      // 실제 삽입 시도
      console.log(`[wrhousdlvr_service] 실제 삽입 시작`);
      
      try {
        // MariaDB 연결 풀에서 직접 연결 획득하여 쿼리 실행
        let conn;
        try {
          conn = await mariadb.getConnection();
          console.log(`[wrhousdlvr_service] 연결 획득 성공`);
          
          // 전체 파라미터로 정식 삽입 시도
          const fullSql = `
            INSERT INTO WRHOUS_WRHSDLVR (
              WRHSDLVR_ID, DLVR_TY, ITEM_TY, ITEM_CODE, ITEM_NM, 
              SPEC, UNIT, QY, INSP_ID, WRHOUS_ID, 
              ZONE_ID, EMP_ID, LOT_NO, REG_DT, RM
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
          `;
          
          console.log(`[wrhousdlvr_service] 전체 삽입 시도 - 파라미터 ${insertParams.length}개`);
          console.log(`[wrhousdlvr_service] SQL:`, fullSql);
          console.log(`[wrhousdlvr_service] 파라미터:`, insertParams);

          const result = await mariadb.query(fullSql, insertParams);
          console.log(`[wrhousdlvr_service] 전체 삽입 성공!`, result);
          
        } finally {
          if (conn) conn.release();
        }
        
      } catch (fullError) {
        console.error(`[wrhousdlvr_service] 전체 삽입 실패:`, fullError);
        console.error(`[wrhousdlvr_service] 오류 메시지:`, fullError.message);
        console.error(`[wrhousdlvr_service] 오류 코드:`, fullError.code);
        
        // 간단한 삽입으로 대체 시도
        try {
          let conn2;
          try {
            conn2 = await mariadb.getConnection();
            const simpleSql = `
              INSERT INTO WRHOUS_WRHSDLVR (
                WRHSDLVR_ID, DLVR_TY, ITEM_TY, ITEM_CODE, ITEM_NM, QY, REG_DT
              ) VALUES (?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const simpleParams = [
              wrhousWrhsdlvrId,
              "입고",
              "E3",
              item_code || "TEST",
              item_name || "테스트품목",
              Number(qty) || 1
            ];
            
            console.log(`[wrhousdlvr_service] 간단한 삽입 시도:`, simpleParams);
            const result2 = await connection2.query(simpleSql, simpleParams);
            console.log(`[wrhousdlvr_service] 간단한 삽입 성공!`, result2);
          } finally {
            if (connection2) connection2.release();
          }
        } catch (simpleError) {
          console.error(`[wrhousdlvr_service] 간단한 삽입도 실패:`, simpleError);
          throw simpleError;
        }
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

module.exports = {
  getTransactionList,
  getInspectionList,
  saveTransaction,
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
};
