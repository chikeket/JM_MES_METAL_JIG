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
  const transactions = Array.isArray(transactionList)
    ? transactionList.map((t) => toLowerKeys(t || {}))
    : [];

  if (!transactions.length) {
    throw new Error("저장할 거래 데이터가 없습니다.");
  }

  if (!emp_id) {
    throw new Error("사용자 정보가 필요합니다.");
  }

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    const results = [];

    for (const txn of transactions) {
      let txnId = (txn.txn_id || "").trim();
      let exists = [];

      // 기존 거래 존재 여부 확인
      if (txnId) {
        exists = await mariadb.query("existsWrhousTransaction", [txnId]);
      }

      if (!txnId || !(exists && exists.length)) {
        // 신규 등록: ID 자동 생성
        const gen = await mariadb.query("createWrhousTransactionId");
        txnId = gen && gen[0] && gen[0].txn_id ? gen[0].txn_id : uuidv4();

        await mariadb.query("insertWrhousTransaction", [
          txnId,
          txn.txn_type || "IN", // 기본값 입고
          txn.item_type || "",
          txn.item_code || "",
          txn.item_name || "",
          txn.spec || "",
          txn.unit || "",
          toNumberSafe(txn.qty, 0),
          txn.inspect_id || null,
          emp_id,
          txn.rm || null,
        ]);

        console.log("[wrhousdlvr_service] inserted transaction id=", txnId);
      } else {
        // 기존 거래 수정
        await mariadb.query("updateWrhousTransaction", [
          txn.txn_type || "IN",
          txn.item_type || "",
          txn.item_code || "",
          txn.item_name || "",
          txn.spec || "",
          txn.unit || "",
          toNumberSafe(txn.qty, 0),
          txn.inspect_id || null,
          emp_id,
          txn.rm || null,
          txnId,
        ]);

        console.log("[wrhousdlvr_service] updated transaction id=", txnId);
      }

      results.push({ txn_id: txnId });
    }

    await conn.commit();
    return { isSuccessed: true, results };
  } catch (err) {
    if (conn)
      try {
        await conn.rollback();
      } catch (_) {}
    console.error(
      "[wrhousdlvr_service] save error:",
      err && err.stack ? err.stack : err
    );
    throw err;
  } finally {
    if (conn) conn.release();
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

    return results.map((item) => ({
      ...item,
      insp_type: "deliveryDetail",
      insp_no: item.delivery_id,
      insp_date: item.delivery_date,
      pass_qty: item.remaining_qty,
      insp_qty: item.delivery_qty,
      insp_status: "대기",
      insp_emp_name: item.emp_name,
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

    switch (inspType) {
      case "materialQuality":
        prefix = "RSC_LOT_";
        break;
      case "semiQuality":
        prefix = "SEMI_LOT_";
        break;
      case "finishedQuality":
        prefix = "PRD_LOT_";
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

// 창고 입출고 거래 처리 (다중 검사서 대응)
const processTransactions = async (requestData) => {
  try {
    const { transactionList, emp_id } = requestData;

    if (!Array.isArray(transactionList) || transactionList.length === 0) {
      return {
        isSuccessed: false,
        error: "처리할 거래 데이터가 없습니다.",
      };
    }

    const processedTransactions = [];

    // 각 거래 항목 처리
    for (const transaction of transactionList) {
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
      } = transaction;

      // LOT 번호 생성 (입고의 경우만)
      let lotNo = null;
      if (txn_type === "in" && insp_type) {
        lotNo = await generateLotNumber(insp_type);
      }

      // 거래 ID 생성
      const wrhousWrhsdlvrId = uuidv4();

      // 창고 입출고 기록 생성
      const insertSql = `
        INSERT INTO wrhous_wrhsdlvr (
          wrhous_wrhsdlvr_id,
          wrhous_id,
          zone_id,
          emp_id,
          lot_no,
          rcvpay_ty,
          rcvpay_qy,
          rcvpay_dt,
          rm,
          rsc_id,
          prdt_id,
          prdt_opt_id,
          spec,
          unit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // 기본 창고/구역 설정 (실제 환경에서는 동적으로 결정)
      const warehouseId = "WH_001"; // 메인 창고
      const zoneId =
        item_type === "자재"
          ? "ZONE_MAT_001"
          : item_type === "반제품"
          ? "ZONE_SEMI_001"
          : "ZONE_PROD_001";

      const insertParams = [
        wrhousWrhsdlvrId,
        warehouseId,
        zoneId,
        emp_id || "EMP_001",
        lotNo,
        txn_type === "in" ? "입고" : "출고",
        Number(qty),
        txn_date,
        remark ||
          `${txn_type === "in" ? "입고" : "출고"} 처리 - 검사서: ${insp_no}`,
        item_type === "자재" ? item_code : null,
        item_type !== "자재" ? item_code : null,
        item_type !== "자재" ? "OPT_001" : null, // 기본 옵션
        item_spec,
        item_unit,
      ];

      await mariadb.query(insertSql, insertParams);

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
      message: `${transactionList.length}건의 거래가 성공적으로 처리되었습니다.`,
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
  // 창고 및 로케이션 조회 기능
  getAllWarehouses,
  getAllLocations,
};
