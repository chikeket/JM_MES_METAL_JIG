const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

console.log('qltyItemUpdate 존재 여부:', !!sqlList.qltyItemUpdate);
console.log('사용 가능한 쿼리들:', Object.keys(sqlList).filter(k => k.toLowerCase().includes('qlty')));

const getQltyItemList = async (filters) => {
  try {
    const params = [
      filters.qlty_item_mng_id || '',
      filters.insp_item_nm || '',
      filters.ty || '',
      filters.ty || ''
    ];
    console.log('📋 서비스 파라미터:', params);
    let list = await mariadb.query("qltyItemManageSelect", params);
    return list || [];
  } catch (err) {
    console.error("getQltyItemList 오류:", err);
    throw err;
  }
};

const insertQltyItem = async (data) => {
  try {
    // 날짜 포맷 변환
    let regDate = null;
    if (data.reg_dt) {
      const date = new Date(data.reg_dt);
      regDate = date.toISOString().split('T')[0];
    }
    
    let params = [
      data.insp_item_nm,
      data.ty || '',
      data.ver || '',
      data.st || 'ACT',
      data.basi_val || '',
      data.spec || '',
      data.unit || '',
      data.eror_scope_min || '',
      data.eror_scope_max || '',
      regDate,
      data.rm || ''
    ];
    
    console.log('➕ INSERT 파라미터:', params);
    let result = await mariadb.query("qltyItemInsert", params);
    return result;
  } catch (err) {
    console.error("insertQltyItem 오류:", err);
    throw err;
  }
};

const updateQltyItem = async (data) => {
  try {
    let regDate = null;
    if (data.reg_dt) {
      const date = new Date(data.reg_dt);
      regDate = date.toISOString().split('T')[0];
    }
    
    let params = [
      data.insp_item_nm,
      data.ty,
      data.ver,
      data.st,
      data.basi_val,
      data.spec,
      data.unit,
      data.eror_scope_min,
      data.eror_scope_max,
      regDate,
      data.rm,
      data.original_qlty_item_mng_id || data.qlty_item_mng_id
    ];
    
    console.log('✏️ UPDATE 파라미터:', params);
    let result = await mariadb.query("qltyItemUpdate", params);
    console.log('✅ UPDATE 결과:', result);  // ← 추가
    console.log('📊 영향받은 행:', result.affectedRows);  // ← 추가
    return result;
  } catch (err) {
    console.error("updateQltyItem 오류:", err);
    throw err;
  }
};

const deleteQltyItem = async (id) => {
  try {
    console.log('🗑️ DELETE ID:', id);
    let result = await mariadb.query("qltyItemDelete", [id]);
    return result;
  } catch (err) {
    console.error("deleteQltyItem 오류:", err);
    throw err;
  }
};

module.exports = {
  getQltyItemList,
  insertQltyItem,
  updateQltyItem,
  deleteQltyItem,
};