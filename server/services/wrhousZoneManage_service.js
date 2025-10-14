const mariadb = require("../database/mapper.js");

// 도우미 함수: 객체의 키를 소문자로 정규화 (클라이언트 대소문자 호환성)
const toLowerKeys = (obj) => {
  if (!obj || typeof obj !== "object") return {};
  return Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase()] = obj[k];
    return acc;
  }, {});
};

// 로케이션 ID 자동 생성
const generateZoneId = async () => {
  try {
    const result = await mariadb.query("zoneCreateId", []);
    const generatedId = result[0]?.zone_id || 'ZO_251001';
    console.log("[wrhousZoneManage_service] 생성된 로케이션 ID:", generatedId);
    return generatedId;
  } catch (error) {
    console.error("[wrhousZoneManage_service] 로케이션 ID 생성 오류:", error);
    throw error;
  }
};

// 로케이션 목록 조회 (로케이션이 없는 창고도 포함) - SQL 파일에서 쿼리 가져오기
const getWrhousZoneAll = async (params) => {
  const info = toLowerKeys(params || {});
  const zone_id = (info.zone_id ?? "").trim() || null;
  const wrhous_id = (info.wrhous_id ?? "").trim() || null;
  const wrhous_nm = (info.wrhous_nm ?? "").trim() || null;
  const item_ty = (info.item_ty ?? "").trim() || null;
  const zone_nm = (info.zone_nm ?? "").trim() || null;
  const st = (info.st ?? "").trim() || null;

  console.log("[wrhousZoneManage_service] getWrhousZoneAll params:", { zone_id, wrhous_id, wrhous_nm, item_ty, zone_nm, st });

  try {
    const queryParams = [
      zone_id, zone_id, zone_id,          // ZONE_ID 검색 조건
      wrhous_id, wrhous_id, wrhous_id,    // WRHOUS_ID 검색 조건
      wrhous_nm, wrhous_nm, wrhous_nm,    // WRHOUS_NM 검색 조건
      item_ty, item_ty, item_ty,          // ITEM_TY 검색 조건
      zone_nm, zone_nm, zone_nm,          // ZONE_NM 검색 조건
      st, st, st                          // ST 검색 조건
    ];

    // SQL 파일에서 쿼리 사용 - 로케이션이 없는 창고도 포함
    const result = await mariadb.query("getWrhousWithZones", queryParams);
    
    // 로케이션이 없는 창고는 빈 로케이션 정보로 표시
    const processedResult = result.map(row => ({
      wrhous_id: row.wrhous_id,
      wrhous_nm: row.wrhous_nm,
      zone_id: row.zone_id || '',
      zone_nm: row.zone_nm || '로케이션 없음',
      item_ty: row.item_ty || '',
      st: row.st || '',
      rm: row.rm || ''
    }));
    
    console.log("[wrhousZoneManage_service] getWrhousZoneAll result count:", processedResult.length);
    return processedResult;
  } catch (error) {
    console.error("[wrhousZoneManage_service] getWrhousZoneAll error:", error);
    throw error;
  }
};

// 로케이션 단건 조회 - SQL 파일에서 쿼리 가져오기
const getWrhousZoneById = async (zoneId) => {
  console.log("[wrhousZoneManage_service] getWrhousZoneById:", zoneId);

  try {
    const result = await mariadb.query("getWrhousZoneById", [zoneId]);
    console.log("[wrhousZoneManage_service] getWrhousZoneById result:", result[0]);
    return result[0] || null;
  } catch (error) {
    console.error("[wrhousZoneManage_service] getWrhousZoneById error:", error);
    throw error;
  }
};

// 로케이션 저장 (신규/수정) - SQL 파일에서 쿼리 가져오기
const saveWrhousZone = async (zoneData) => {
  const data = toLowerKeys(zoneData || {});
  console.log("[wrhousZoneManage_service] saveWrhousZone data:", data);

  if (!data) throw new Error("zoneData is required");

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let zone_id = (data.zone_id || "").trim();
    const wrhous_id = data.wrhous_id?.trim();
    const item_ty = data.item_ty?.trim() || '';
    const zone_nm = data.zone_nm?.trim();
    const st = data.st?.trim() || 'M1';
    const rm = data.rm?.trim() || '';

    if (!wrhous_id || !zone_nm) {
      throw new Error("창고 ID, 로케이션명은 필수입니다.");
    }

    // 기존 데이터 확인
    let exists = [];
    if (zone_id) {
      exists = await mariadb.query("checkWrhousZoneIdExists", [zone_id]);
    }

    if (!zone_id || !(exists && exists.length && exists[0]?.count > 0)) {
      // 신규 등록 - ID 자동 생성
      const gen = await mariadb.query("zoneCreateId");
      zone_id = gen && gen[0] && gen[0].zone_id ? gen[0].zone_id : 'ZO_251001';

      await mariadb.query("insertWrhousZone", [
        zone_id, wrhous_id, item_ty, zone_nm, st, rm
      ]);
      console.log("[wrhousZoneManage_service] insertWrhousZone completed, zone_id:", zone_id);
    } else {
      // 수정
      await mariadb.query("updateWrhousZone", [
        wrhous_id, item_ty, zone_nm, st, rm, zone_id
      ]);
      console.log("[wrhousZoneManage_service] updateWrhousZone completed, zone_id:", zone_id);
    }

    await conn.commit();
    return { success: true, isUpdate: exists.length > 0 && exists[0]?.count > 0, zone_id };
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {}
    }
    console.error("[wrhousZoneManage_service] saveWrhousZone error:", error && error.stack ? error.stack : error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

// 로케이션 삭제 - SQL 파일에서 쿼리 가져오기
const deleteWrhousZone = async (zoneId) => {
  console.log("[wrhousZoneManage_service] deleteWrhousZone:", zoneId);

  try {
    if (!zoneId) {
      throw new Error("삭제할 로케이션 ID가 필요합니다.");
    }

    const result = await mariadb.query("deleteWrhousZone", [zoneId]);
    console.log("[wrhousZoneManage_service] deleteWrhousZone result:", result);

    return { success: true, deletedId: zoneId };
  } catch (error) {
    console.error("[wrhousZoneManage_service] deleteWrhousZone error:", error);
    throw error;
  }
};

// 창고 목록 조회 (로케이션 등록시 선택용) - SQL 파일에서 쿼리 가져오기
const getWrhousForZone = async () => {
  console.log("[wrhousZoneManage_service] getWrhousForZone");

  try {
    const result = await mariadb.query("getWrhousForZone", []);
    console.log("[wrhousZoneManage_service] getWrhousForZone result count:", result.length);
    return result;
  } catch (error) {
    console.error("[wrhousZoneManage_service] getWrhousForZone error:", error);
    throw error;
  }
};

module.exports = {
  generateZoneId,
  getWrhousZoneAll,
  getWrhousZoneById,
  saveWrhousZone,
  deleteWrhousZone,
  getWrhousForZone
};