const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// 안전한 UUID 생성 (uuid 패키지 미설치 상황 대비)
let uuidv4;
try {
  uuidv4 = require("uuid").v4;
} catch (err) {
  const crypto = require("crypto");
  // crypto.randomUUID가 있으면 사용, 없으면 타임스탬프 기반 ID 생성
  uuidv4 = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.floor(Math.random()*1000000)}`);
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
  if (typeof v === 'number') return Number.isFinite(v) ? v : def;
  if (typeof v === 'string') {
    const s = v.replace(/,/g, '').trim(); // 쉼표 제거 후 공백 제거
    const n = Number(s);
    return Number.isFinite(n) ? n : def;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
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
    txn_type, txn_type,
    item_type, item_type,
    item_code, item_code,
    item_name, item_name,
    inspect_id, inspect_id,
    emp_id, emp_id,
    reg_dt, reg_dt,
  ];

  console.log('[wrhousdlvr_service] getTransactionList params ->', params);
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
    item_type, item_type,
    item_code, item_code,
    item_name, item_name,
    inspect_id, inspect_id,
    inspect_dt, inspect_dt,
  ];

  console.log('[wrhousdlvr_service] getInspectionList params ->', params);
  const result = await mariadb.query("selectInspectionList", params);
  return result;
};

// 창고 입출고 거래 등록/수정 통합 처리 (Upsert)
const saveTransaction = async ({ transactionList, emp_id = null } = {}) => {
  const transactions = Array.isArray(transactionList) ? transactionList.map(t => toLowerKeys(t || {})) : [];
  
  if (!transactions.length) {
    throw new Error('저장할 거래 데이터가 없습니다.');
  }

  if (!emp_id) {
    throw new Error('사용자 정보가 필요합니다.');
  }

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    const results = [];

    for (const txn of transactions) {
      let txnId = (txn.txn_id || '').trim();
      let exists = [];
      
      // 기존 거래 존재 여부 확인
      if (txnId) {
        exists = await conn.query(sqlList.existsWrhousTransaction, [txnId]);
      }

      if (!txnId || !(exists && exists.length)) {
        // 신규 등록: ID 자동 생성
        const gen = await conn.query(sqlList.createWrhousTransactionId);
        txnId = gen && gen[0] && gen[0].txn_id ? gen[0].txn_id : uuidv4();
        
        await conn.query(sqlList.insertWrhousTransaction, [
          txnId,
          txn.txn_type || 'IN', // 기본값 입고
          txn.item_type || '',
          txn.item_code || '',
          txn.item_name || '',
          txn.spec || '',
          txn.unit || '',
          toNumberSafe(txn.qty, 0),
          txn.inspect_id || null,
          emp_id,
          txn.rm || null,
        ]);
        
        console.log('[wrhousdlvr_service] inserted transaction id=', txnId);
      } else {
        // 기존 거래 수정
        await conn.query(sqlList.updateWrhousTransaction, [
          txn.txn_type || 'IN',
          txn.item_type || '',
          txn.item_code || '',
          txn.item_name || '',
          txn.spec || '',
          txn.unit || '',
          toNumberSafe(txn.qty, 0),
          txn.inspect_id || null,
          emp_id,
          txn.rm || null,
          txnId,
        ]);
        
        console.log('[wrhousdlvr_service] updated transaction id=', txnId);
      }

      results.push({ txn_id: txnId });
    }

    await conn.commit();
    return { isSuccessed: true, results };
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch (_) {}
    console.error('[wrhousdlvr_service] save error:', err && err.stack ? err.stack : err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 창고 입출고 거래 삭제
const deleteTransaction = async (txnId) => {
  if (!txnId) {
    throw new Error('삭제할 거래 ID가 필요합니다.');
  }

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    
    await conn.query(sqlList.deleteWrhousTransaction, [txnId]);
    
    await conn.commit();
    return { isSuccessed: true };
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch (_) {}
    console.error('[wrhousdlvr_service] delete error:', err && err.stack ? err.stack : err);
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
      await conn.query(sqlList.deleteWrhousTransaction, [id]);
    }
    
    await conn.commit();
    return { isSuccessed: true, count: list.length };
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch (_) {}
    console.error('[wrhousdlvr_service] delete selected error:', err && err.stack ? err.stack : err);
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

  console.log('[wrhousdlvr_service] getInventoryStatus itemCode ->', itemCode);
  const result = await mariadb.query("selectInventoryStatus", [itemCode]);
  return result;
};

// 품목별 입출고 이력 조회
const getItemTransactionHistory = async (itemCode) => {
  if (!itemCode) {
    return [];
  }

  console.log('[wrhousdlvr_service] getItemTransactionHistory itemCode ->', itemCode);
  const result = await mariadb.query("selectItemTransactionHistory", [itemCode]);
  return result;
};

// 품질검사서 목록 조회 (완료된 검사서만)
const getQualityInspectionList = async (params = {}) => {
  try {
    console.log('[wrhousdlvr_service] getQualityInspectionList params:', params)
    
    // 자재품질검수 테이블에서 완료된 검사서 조회
    const result = await mapper.selectList('selectRscQltyInspList', {
      item_code: params.item_code || '',
      item_name: params.item_name || '',
      insp_status: '완료'
    })
    
    console.log('[wrhousdlvr_service] 품질검사서 조회 결과:', result?.length || 0, '건')
    return result || []
  } catch (error) {
    console.error('[wrhousdlvr_service] getQualityInspectionList error:', error)
    throw error
  }
}

// 납품서 기반 검사서 목록 조회 
const getDeliveryInspectionList = async (params = {}) => {
  try {
    console.log('[wrhousdlvr_service] getDeliveryInspectionList params:', params)
    
    // 납품 관련 검사서 조회 (임시 데이터)
    const result = [
      {
        insp_no: 'DEL001',
        item_code: 'MTL001',
        item_name: '철강재료 A',
        item_type: '자재',
        item_spec: '10mm',
        item_unit: 'KG',
        insp_qty: 1000,
        pass_qty: 950,
        fail_qty: 50,
        insp_status: '완료',
        insp_date: new Date().toISOString().split('T')[0],
        insp_emp_name: '검사자1'
      }
    ]
    
    // 검색 조건 적용
    const filtered = result.filter(item => {
      const codeMatch = !params.item_code || item.item_code.includes(params.item_code)
      const nameMatch = !params.item_name || item.item_name.includes(params.item_name)
      return codeMatch && nameMatch
    })
    
    console.log('[wrhousdlvr_service] 납품서 검사서 조회 결과:', filtered.length, '건')
    return filtered
  } catch (error) {
    console.error('[wrhousdlvr_service] getDeliveryInspectionList error:', error)
    throw error
  }
}

// 발주서 기반 검사서 목록 조회
const getOrderInspectionList = async (params = {}) => {
  try {
    console.log('[wrhousdlvr_service] getOrderInspectionList params:', params)
    
    // 발주 관련 검사서 조회 (임시 데이터)
    const result = [
      {
        insp_no: 'ORD001',
        item_code: 'MTL002',
        item_name: '알루미늄 시트',
        item_type: '자재',
        item_spec: '5mm',
        item_unit: 'EA',
        insp_qty: 500,
        pass_qty: 480,
        fail_qty: 20,
        insp_status: '완료',
        insp_date: new Date().toISOString().split('T')[0],
        insp_emp_name: '검사자2'
      }
    ]
    
    // 검색 조건 적용
    const filtered = result.filter(item => {
      const codeMatch = !params.item_code || item.item_code.includes(params.item_code)
      const nameMatch = !params.item_name || item.item_name.includes(params.item_name)
      return codeMatch && nameMatch
    })
    
    console.log('[wrhousdlvr_service] 발주서 검사서 조회 결과:', filtered.length, '건')
    return filtered
  } catch (error) {
    console.error('[wrhousdlvr_service] getOrderInspectionList error:', error)
    throw error
  }
}

// 지시서 기반 검사서 목록 조회
const getInstructionInspectionList = async (params = {}) => {
  try {
    console.log('[wrhousdlvr_service] getInstructionInspectionList params:', params)
    
    // 지시서 관련 검사서 조회 (임시 데이터)
    const result = [
      {
        insp_no: 'INS001',
        item_code: 'PRD001',
        item_name: '완제품 A',
        item_type: '제품',
        item_spec: '표준형',
        item_unit: 'SET',
        insp_qty: 100,
        pass_qty: 95,
        fail_qty: 5,
        insp_status: '완료',
        insp_date: new Date().toISOString().split('T')[0],
        insp_emp_name: '검사자3'
      }
    ]
    
    // 검색 조건 적용
    const filtered = result.filter(item => {
      const codeMatch = !params.item_code || item.item_code.includes(params.item_code)
      const nameMatch = !params.item_name || item.item_name.includes(params.item_name)
      return codeMatch && nameMatch
    })
    
    console.log('[wrhousdlvr_service] 지시서 검사서 조회 결과:', filtered.length, '건')
    return filtered
  } catch (error) {
    console.error('[wrhousdlvr_service] getInstructionInspectionList error:', error)
    throw error
  }
}

module.exports = {
  getTransactionList,
  getInspectionList,
  saveTransaction,
  deleteTransaction,
  deleteSelectedTransactions,
  getInventoryStatus,
  getItemTransactionHistory,
  getQualityInspectionList,
  getDeliveryInspectionList,
  getOrderInspectionList,
  getInstructionInspectionList,
};