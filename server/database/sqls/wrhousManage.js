// 창고 관리 기준정보 관련 쿼리들

// 창고 ID 자동 생성 (예: WR_251001)
const wrhousCreateId = `
SELECT CONCAT('WR_', CONCAT(DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(wrhous_id, -3)), 0) + 1, 3, '0'))) as wrhous_id
FROM WRHOUS
WHERE SUBSTR(wrhous_id, 4, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

// 창고 목록 조회 (검색 조건 포함)
const getWrhousAll = `
SELECT 
  w.WRHOUS_ID as wrhous_id,
  w.WRHOUS_NM as wrhous_nm,
  w.ITEM_TY as item_ty,
  w.ST as st,
  w.RM as rm
FROM WRHOUS w
WHERE (? IS NULL OR ? = '' OR w.WRHOUS_ID LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR w.WRHOUS_NM LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR w.ITEM_TY LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR w.ST = ?)
ORDER BY w.WRHOUS_ID
`;

// 창고 단건 조회 (상세보기용)
const getWrhousById = `
SELECT 
  w.WRHOUS_ID as wrhous_id,
  w.WRHOUS_NM as wrhous_nm,
  w.ITEM_TY as item_ty,
  w.ST as st,
  w.RM as rm
FROM WRHOUS w
WHERE w.WRHOUS_ID = ?
`;

// 창고 신규 등록
const insertWrhous = `
INSERT INTO WRHOUS (
  WRHOUS_ID,
  WRHOUS_NM,
  ITEM_TY,
  ST,
  RM
) VALUES (?, ?, ?, ?, ?)
`;

// 창고 정보 수정
const updateWrhous = `
UPDATE WRHOUS SET
  WRHOUS_NM = ?,
  ITEM_TY = ?,
  ST = ?,
  RM = ?
WHERE WRHOUS_ID = ?
`;

// 창고 삭제
const deleteWrhous = `
DELETE FROM WRHOUS
WHERE WRHOUS_ID = ?
`;

// 창고 ID 중복 체크
const checkWrhousIdExists = `
SELECT COUNT(*) as count
FROM WRHOUS
WHERE WRHOUS_ID = ?
`;



module.exports = {
  wrhousCreateId,
  getWrhousAll,
  getWrhousById,
  insertWrhous,
  updateWrhous,
  deleteWrhous,
  checkWrhousIdExists
};