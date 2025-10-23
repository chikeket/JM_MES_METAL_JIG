// 창고 로케이션 관리 기준정보 관련 쿼리들

// 로케이션 ID 자동 생성 (예: ZO_251001)
const zoneCreateId = `
SELECT CONCAT('ZO_', CONCAT(DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(zone_id, -3)), 0) + 1, 3, '0'))) as zone_id
FROM WRHOUS_ZONE
WHERE SUBSTR(zone_id, 4, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

// 로케이션 목록 조회 (검색 조건 포함)
const getWrhousZoneAll = `
SELECT 
  wz.ZONE_ID as zone_id,
  wz.WRHOUS_ID as wrhous_id,
  w.WRHOUS_NM as wrhous_nm,
  wz.ITEM_TY as item_ty,
  wz.ZONE_NM as zone_nm,
  wz.ST as st,
  wz.RM as rm
FROM WRHOUS_ZONE wz
LEFT JOIN WRHOUS w ON wz.WRHOUS_ID = w.WRHOUS_ID
WHERE (? IS NULL OR ? = '' OR wz.ZONE_ID LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR wz.WRHOUS_ID LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR w.WRHOUS_NM LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR wz.ITEM_TY LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR wz.ZONE_NM LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR wz.ST = ?)
ORDER BY wz.ZONE_ID
`;

// 로케이션 단건 조회 (상세보기용)
const getWrhousZoneById = `
SELECT 
  wz.ZONE_ID as zone_id,
  wz.WRHOUS_ID as wrhous_id,
  w.WRHOUS_NM as wrhous_nm,
  wz.ITEM_TY as item_ty,
  wz.ZONE_NM as zone_nm,
  wz.ST as st,
  wz.RM as rm
FROM WRHOUS_ZONE wz
LEFT JOIN WRHOUS w ON wz.WRHOUS_ID = w.WRHOUS_ID
WHERE wz.ZONE_ID = ?
`;

// 로케이션 신규 등록
const insertWrhousZone = `
INSERT INTO WRHOUS_ZONE (
  ZONE_ID,
  WRHOUS_ID,
  ITEM_TY,
  ZONE_NM,
  ST,
  RM
) VALUES (?, ?, ?, ?, ?, ?)
`;

// 로케이션 정보 수정
const updateWrhousZone = `
UPDATE WRHOUS_ZONE SET
  WRHOUS_ID = ?,
  ITEM_TY = ?,
  ZONE_NM = ?,
  ST = ?,
  RM = ?
WHERE ZONE_ID = ?
`;

// 로케이션 삭제
const deleteWrhousZone = `
DELETE FROM WRHOUS_ZONE
WHERE ZONE_ID = ?
`;

// 로케이션 ID 중복 체크
const checkWrhousZoneIdExists = `
SELECT COUNT(*) as count
FROM WRHOUS_ZONE
WHERE ZONE_ID = ?
`;

// 창고 목록 조회 (로케이션 등록시 선택용)
const getWrhousForZone = `
SELECT 
  WRHOUS_ID as wrhous_id,
  WRHOUS_NM as wrhous_nm
FROM WRHOUS
WHERE ST = 'M1'
ORDER BY WRHOUS_ID
`;

// 창고별 로케이션 목록 조회 (로케이션이 없는 창고도 포함)
const getWrhousWithZones = `
SELECT 
  w.WRHOUS_ID as wrhous_id,
  w.WRHOUS_NM as wrhous_nm,
  wz.ZONE_ID as zone_id,
  wz.ZONE_NM as zone_nm,
  w.ITEM_TY as item_ty,
  w.ST as st,
  w.RM as rm
FROM WRHOUS w
LEFT JOIN WRHOUS_ZONE wz ON w.WRHOUS_ID = wz.WRHOUS_ID
WHERE w.ST = 'M1'
  AND (? IS NULL OR ? = '' OR wz.ZONE_ID LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR w.WRHOUS_ID LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR w.WRHOUS_NM LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR wz.ITEM_TY LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR wz.ZONE_NM LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR wz.ST = ?)
ORDER BY w.WRHOUS_ID, wz.ZONE_ID
`;

module.exports = {
  zoneCreateId,
  getWrhousZoneAll,
  getWrhousZoneById,
  insertWrhousZone,
  updateWrhousZone,
  deleteWrhousZone,
  checkWrhousZoneIdExists,
  getWrhousForZone,
  getWrhousWithZones
};