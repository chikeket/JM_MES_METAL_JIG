const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require("../utils/converts.js");
const sqlList = require("../database/sqlList.js");

const getPrdtList = async (filters) => {
  try {
    const params = [
      filters.prdt_id || '', filters.prdt_id || '',
      filters.prdt_nm || '', filters.prdt_nm || '',
      filters.prdt_st || '', filters.prdt_st || ''
    ];
    console.log('📋 서비스 파라미터:', params);
    
    let result = await mariadb.query("prdtManageSelect", params);
    console.log('📦 DB 결과 타입:', typeof result, Array.isArray(result));
    console.log('📦 DB 결과:', result);
    
    // ⭐ MariaDB 결과 처리: 배열이면 그대로, 아니면 빈 배열
    let list = Array.isArray(result) ? result : [];
    
    return list;
  } catch (err) {
    console.error("❌ getPrdtList 오류:", err);
    throw err;
  }
};

const getPrdtOptions = async (prdtId) => {
  try {
    let result = await mariadb.query("prdtOptionSelect", [prdtId]);
    console.log('📦 옵션 조회 결과:', result);
    
    // ⭐ 배열 처리
    let list = Array.isArray(result) ? result : [];
    
    return list;
  } catch (err) {
    console.error("❌ getPrdtOptions 오류:", err);
    throw err;
  }
};

const insertPrdt = async (prdtData) => {
  try {
    let data = [
      prdtData.prdt_nm,
      prdtData.spec || '',
      prdtData.unit || '',
      prdtData.prdt_st || 'K1',
      prdtData.rm || prdtData.rmrk || ''
    ];
    
    console.log('📝 제품 등록 데이터:', data);
    let result = await mariadb.query("prdtInsert", data);
    console.log('✅ 제품 등록 결과:', result);
    
    return result;
  } catch (err) {
    console.error("❌ insertPrdt 오류:", err);
    throw err;
  }
};

const updatePrdt = async (prdtData) => {
  try {
    console.log("===== ✅ updatePrdt 받은 데이터 =====");
    console.log(prdtData);

    let data = [
      prdtData.prdt_nm,
      prdtData.spec || '',
      prdtData.unit || '',
      prdtData.prdt_st || 'K1',
      prdtData.rm || prdtData.rmrk || '',
      prdtData.original_prdt_id || prdtData.prdt_id
    ];

    console.log("===== 📝 SQL에 전달할 배열 =====");
    console.log(data);

    let result = await mariadb.query("prdtUpdate", data);

    console.log("===== 💾 UPDATE 실행 결과 =====");
    console.log(result);

    return result;
  } catch (err) {
    console.error("❌ updatePrdt 오류:", err);
    throw err;
  }
};

const deletePrdt = async (prdtId) => {
  try {
    console.log('🗑️ 제품 삭제:', prdtId);
    let result = await mariadb.query("prdtDelete", [prdtId]);
    console.log('✅ 제품 삭제 결과:', result);
    
    return result;
  } catch (err) {
    console.error("❌ deletePrdt 오류:", err);
    
    // ⭐ 외래키 제약 조건 에러 처리
    if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
      const error = new Error('연결된 옵션이 있어 삭제할 수 없습니다.');
      error.errno = 1451;
      throw error;
    }
    
    throw err;
  }
};

// ============================================
// ⭐ 옵션 관련 함수
// ============================================

const insertOption = async (optionData) => {
  try {
    console.log("===== ✅ insertOption 받은 데이터 =====");
    console.log(optionData);

    // ⭐ use_yn 값 변환
    const useYn = (optionData.use_yn === true || 
                   optionData.use_yn === 'ACT' || 
                   optionData.use_yn === 'Y') ? 'ACT' : 'INA';

    let data = [
      optionData.prdt_id,
      optionData.opt_nm,
      useYn,
      optionData.rm || ''
    ];

    console.log("===== 📝 SQL에 전달할 배열 =====");
    console.log(data);

    let result = await mariadb.query("optionInsert", data);
    console.log("===== 💾 INSERT 실행 결과 =====");
    console.log(result);

    return result;
  } catch (err) {
    console.error("❌ insertOption 오류:", err);
    throw err;
  }
};

const updateOption = async (optionData) => {
  try {
    console.log("===== ✅ updateOption 받은 데이터 =====");
    console.log(optionData);

    // ⭐ use_yn 값 변환
    const useYn = (optionData.use_yn === true || 
                   optionData.use_yn === 'ACT' || 
                   optionData.use_yn === 'Y') ? 'ACT' : 'INA';

    let data = [
      optionData.opt_nm,
      useYn,
      optionData.rm || '',
      optionData.opt_id,
      optionData.prdt_id
    ];

    console.log("===== 📝 SQL에 전달할 배열 =====");
    console.log(data);

    let result = await mariadb.query("optionUpdate", data);
    console.log("===== 💾 UPDATE 실행 결과 =====");
    console.log(result);

    return result;
  } catch (err) {
    console.error("❌ updateOption 오류:", err);
    throw err;
  }
};

const deleteOption = async (optId, prdtId) => {
  try {
    console.log("===== ✅ deleteOption 받은 데이터 =====");
    console.log({ optId, prdtId });

    let result = await mariadb.query("optionDelete", [optId, prdtId]);
    
    console.log("===== 💾 DELETE 실행 결과 =====");
    console.log(result);

    return result;
  } catch (err) {
    console.error("❌ deleteOption 오류:", err);
    
    // ⭐ 외래키 제약 조건 에러 처리
    if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
      const error = new Error('다른 데이터(출고, 재고 등)에서 사용 중이므로 삭제할 수 없습니다.');
      error.errno = 1451;
      throw error;
    }
    
    throw err;
  }
};

module.exports = {
  getPrdtList,
  getPrdtOptions,
  insertPrdt,
  updatePrdt,
  deletePrdt,
  insertOption,
  updateOption,
  deleteOption,
};