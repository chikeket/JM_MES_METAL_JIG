const mariadb = require("../database/mapper.js");

// 품목 유형에 따른 창고 목록 조회
const getWarehouseByItemType = async (Info) => {
  const itemType = Info?.item_type || "";

  console.log("[wrhous_service] getWarehouseByItemType - itemType:", itemType);

  const params = [itemType, itemType, itemType];

  try {
    const result = await mariadb.query("getWarehouseByItemType", params);
    console.log("[wrhous_service] 창고 조회 결과:", result?.length || 0, "건");
    return result || [];
  } catch (error) {
    console.error("[wrhous_service] 창고 조회 오류:", error);
    return [];
  }
};

// 품목 유형에 따른 로케이션 목록 조회
const getLocationByItemType = async (Info) => {
  const itemType = Info?.item_type || "";
  const warehouseId = Info?.warehouse_id || "";

  console.log(
    "[wrhous_service] getLocationByItemType - itemType:",
    itemType,
    "warehouseId:",
    warehouseId
  );

  const params = [
    itemType,
    itemType,
    itemType,
    warehouseId,
    warehouseId,
    warehouseId,
  ];

  try {
    const result = await mariadb.query("getLocationByItemType", params);
    console.log(
      "[wrhous_service] 로케이션 조회 결과:",
      result?.length || 0,
      "건"
    );
    return result || [];
  } catch (error) {
    console.error("[wrhous_service] 로케이션 조회 오류:", error);
    return [];
  }
};

// 모든 창고 목록 조회
const getAllWarehouses = async () => {
  try {
    const result = await mariadb.query("getAllWarehouses", []);
    console.log(
      "[wrhous_service] 전체 창고 조회 결과:",
      result?.length || 0,
      "건"
    );
    return result || [];
  } catch (error) {
    console.error("[wrhous_service] 전체 창고 조회 오류:", error);
    return [];
  }
};

// 모든 로케이션 목록 조회
const getAllLocations = async () => {
  try {
    const result = await mariadb.query("getAllLocations", []);
    console.log(
      "[wrhous_service] 전체 로케이션 조회 결과:",
      result?.length || 0,
      "건"
    );
    return result || [];
  } catch (error) {
    console.error("[wrhous_service] 전체 로케이션 조회 오류:", error);
    return [];
  }
};

// 특정 창고의 로케이션 목록 조회
const getLocationsByWarehouse = async (Info) => {
  const warehouseId = Info?.warehouse_id || "";

  console.log(
    "[wrhous_service] getLocationsByWarehouse - warehouseId:",
    warehouseId
  );

  const params = [warehouseId];

  try {
    const result = await mariadb.query("getLocationsByWarehouse", params);
    console.log(
      "[wrhous_service] 창고별 로케이션 조회 결과:",
      result?.length || 0,
      "건"
    );
    return result || [];
  } catch (error) {
    console.error("[wrhous_service] 창고별 로케이션 조회 오류:", error);
    return [];
  }
};

module.exports = {
  getWarehouseByItemType,
  getLocationByItemType,
  getAllWarehouses,
  getAllLocations,
  getLocationsByWarehouse,
};
