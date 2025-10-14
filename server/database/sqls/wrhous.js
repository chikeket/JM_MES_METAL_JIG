// 창고 관리 관련 쿼리들

// 품목 유형에 따른 창고 목록 조회
const getWarehouseByItemType = `
SELECT 
  w.wrhous_id as warehouse_id,
  w.wrhous_nm as warehouse_name,
  w.item_ty as item_type,
  w.stats as status,
  w.rm as remark
FROM wrhous w
WHERE (? IS NULL OR ? = '' OR w.item_ty = ?)
AND w.stats = '활성화'
ORDER BY w.wrhous_id
`;

// 품목 유형에 따른 로케이션 목록 조회
const getLocationByItemType = `
SELECT 
  l.wrhous_lctn_id as location_id,
  l.wrhous_lctn_nm as location_name,
  l.wrhous_id as warehouse_id,
  w.wrhous_nm as warehouse_name,
  l.item_ty as item_type,
  l.stats as status,
  l.rm as remark
FROM wrhous_lctn l
JOIN wrhous w ON l.wrhous_id = w.wrhous_id
WHERE (? IS NULL OR ? = '' OR l.item_ty = ?)
AND (? IS NULL OR ? = '' OR l.wrhous_id = ?)
AND l.stats = '활성화'
AND w.stats = '활성화'
ORDER BY l.wrhous_id, l.wrhous_lctn_id
`;

// 모든 창고 목록 조회
const getAllWarehouses = `
SELECT 
  w.wrhous_id as warehouse_id,
  w.wrhous_nm as warehouse_name,
  w.item_ty as item_type,
  w.stats as status,
  w.rm as remark
FROM wrhous w
WHERE w.stats = '활성화'
ORDER BY w.wrhous_id
`;

// 모든 로케이션 목록 조회
const getAllLocations = `
SELECT 
  l.wrhous_lctn_id as location_id,
  l.wrhous_lctn_nm as location_name,
  l.wrhous_id as warehouse_id,
  w.wrhous_nm as warehouse_name,
  l.item_ty as item_type,
  l.stats as status,
  l.rm as remark
FROM wrhous_lctn l
JOIN wrhous w ON l.wrhous_id = w.wrhous_id
WHERE l.stats = '활성화'
AND w.stats = '활성화'
ORDER BY l.wrhous_id, l.wrhous_lctn_id
`;

// 특정 창고의 로케이션 목록 조회
const getLocationsByWarehouse = `
SELECT 
  l.wrhous_lctn_id as location_id,
  l.wrhous_lctn_nm as location_name,
  l.wrhous_id as warehouse_id,
  w.wrhous_nm as warehouse_name,
  l.item_ty as item_type,
  l.stats as status,
  l.rm as remark
FROM wrhous_lctn l
JOIN wrhous w ON l.wrhous_id = w.wrhous_id
WHERE l.wrhous_id = ?
AND l.stats = '활성화'
AND w.stats = '활성화'
ORDER BY l.wrhous_lctn_id
`;

module.exports = {
  getWarehouseByItemType,
  getLocationByItemType,
  getAllWarehouses,
  getAllLocations,
  getLocationsByWarehouse,
};
