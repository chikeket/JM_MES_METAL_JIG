const mariadb = require("../database/mapper.js");

// 도우미 함수: 객체의 키를 소문자로 정규화 (클라이언트 대소문자 호환성)
const toLowerKeys = (obj) => {
  if (!obj || typeof obj !== "object") return {};
  return Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase()] = obj[k];
    return acc;
  }, {});
};

// 창고 ID 자동 생성
const generateWrhousId = async () => {
  try {
    const queryString = `
      SELECT CONCAT('WR_', CONCAT(DATE_FORMAT(NOW(), '%y%m'),
        LPAD(IFNULL(MAX(SUBSTR(wrhous_id, -3)), 0) + 1, 3, '0'))) as wrhous_id
      FROM WRHOUS
      WHERE SUBSTR(wrhous_id, 4, 4) = DATE_FORMAT(NOW(), '%y%m')
    `;
    const result = await mariadb.query(queryString, []);
    const generatedId = result[0]?.wrhous_id || 'WR_251001';
    console.log("[wrhousManage_service] 생성된 창고 ID:", generatedId);
    return generatedId;
  } catch (error) {
    console.error("[wrhousManage_service] 창고 ID 생성 오류:", error);
    throw error;
  }
};

// 창고 목록 조회 - SQL 파일에서 쿼리 가져오기
const getWrhousAll = async (params) => {
  const info = toLowerKeys(params || {});
  const wrhous_id = (info.wrhous_id ?? "").trim() || null;
  const wrhous_nm = (info.wrhous_nm ?? "").trim() || null;
  const item_ty = (info.item_ty ?? "").trim() || null;
  const st = (info.st ?? "").trim() || null;

  console.log("[wrhousManage_service] getWrhousAll params:", { wrhous_id, wrhous_nm, item_ty, st });

  try {
    const queryParams = [
      wrhous_id, wrhous_id, wrhous_id,    // WRHOUS_ID 검색 조건
      wrhous_nm, wrhous_nm, wrhous_nm,    // WRHOUS_NM 검색 조건  
      item_ty, item_ty, item_ty,          // ITEM_TY 검색 조건
      st, st, st                          // ST 검색 조건
    ];

    const result = await mariadb.query("getWrhousAll", queryParams);
    console.log("[wrhousManage_service] getWrhousAll result count:", result.length);
    return result;
  } catch (error) {
    console.error("[wrhousManage_service] getWrhousAll error:", error);
    throw error;
  }
};

// 창고 단건 조회 - SQL 파일에서 쿼리 가져오기
const getWrhousById = async (wrhousId) => {
  console.log("[wrhousManage_service] getWrhousById:", wrhousId);

  try {
    const result = await mariadb.query("getWrhousById", [wrhousId]);
    console.log("[wrhousManage_service] getWrhousById result:", result[0]);
    return result[0] || null;
  } catch (error) {
    console.error("[wrhousManage_service] getWrhousById error:", error);
    throw error;
  }
};

// 창고 저장 (신규/수정) - SQL 파일에서 쿼리 가져오기
const saveWrhous = async (wrhousData) => {
  const data = toLowerKeys(wrhousData || {});
  console.log("[wrhousManage_service] saveWrhous data:", data);

  if (!data) throw new Error("wrhousData is required");

  let conn = '';
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let wrhous_id = (data.wrhous_id || "").trim();
    const wrhous_nm = data.wrhous_nm?.trim();
    const item_ty = data.item_ty?.trim() || '';
    const st = data.st?.trim() || 'M1';
    const rm = data.rm?.trim() || '';

    if (!wrhous_nm) {
      throw new Error("창고명은 필수입니다.");
    }

    // 기존 데이터 확인
    let exists = [];
    if (wrhous_id) {
      exists = await mariadb.query("checkWrhousIdExists", [wrhous_id]);
    }

    if (!wrhous_id || !(exists && exists.length && exists[0]?.count > 0)) {
      // 신규 등록 - ID 자동 생성
      const gen = await mariadb.query("wrhousCreateId");
      wrhous_id = gen && gen[0] && gen[0].wrhous_id ? gen[0].wrhous_id : 'WR_251001';

      await mariadb.query("insertWrhous", [
        wrhous_id, wrhous_nm, item_ty, st, rm
      ]);
      console.log("[wrhousManage_service] insertWrhous completed, wrhous_id:", wrhous_id);
    } else {
      // 수정
      await mariadb.query("updateWrhous", [
        wrhous_nm, item_ty, st, rm, wrhous_id
      ]);
      console.log("[wrhousManage_service] updateWrhous completed, wrhous_id:", wrhous_id);
    }

    await conn.commit();
    return { success: true, isUpdate: exists.length > 0 && exists[0]?.count > 0, wrhous_id };
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {}
    }
    console.error("[wrhousManage_service] saveWrhous error:", error && error.stack ? error.stack : error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

// 창고 삭제 - SQL 파일에서 쿼리 가져오기
const deleteWrhous = async (wrhousId) => {
  console.log("[wrhousManage_service] deleteWrhous:", wrhousId);

  try {
    if (!wrhousId) {
      throw new Error("삭제할 창고 ID가 필요합니다.");
    }

    const result = await mariadb.query("deleteWrhous", [wrhousId]);
    console.log("[wrhousManage_service] deleteWrhous result:", result);

    return { success: true, deletedId: wrhousId };
  } catch (error) {
    console.error("[wrhousManage_service] deleteWrhous error:", error);
    throw error;
  }
};

module.exports = {
  generateWrhousId,
  getWrhousAll,
  getWrhousById,
  saveWrhous,
  deleteWrhous
};