const mariadb = require("../database/mapper.js");

const getProdDrctInquiryList = async (filters) => {
  try {
    const prodDrctInquiryList = `
    SELECT
      a.PROD_DRCT_ID as code,
      a.PROD_DRCT_NM as productName,
      IFNULL(b.spec, '') as spec,
      IFNULL(b.unit, '') as unit,
      0 as planQty,
      0 as drctQty,
      0 as alreadyDrctQty,
      0 as notDrctQty,
      0 as priority,
      a.RM as remark
    FROM PROD_DRCT a
    LEFT JOIN PRDT b ON a.PROD_DRCT_ID = b.prdt_id
    WHERE 1=1
      AND a.PROD_DRCT_NM LIKE CONCAT('%', ?, '%')
      AND a.PROD_DRCT_ID LIKE CONCAT('%', ?, '%')
      AND a.EMP_ID LIKE CONCAT('%', ?, '%')
      AND (? = '' OR DATE(a.PROD_DRCT_FR_DT) >= DATE(?))
      AND (? = '' OR DATE(a.PROD_DRCT_FR_DT) <= DATE(?))
      AND (? = '' OR DATE(a.PROD_DRCT_TO_DT) >= DATE(?))
      AND (? = '' OR DATE(a.PROD_DRCT_TO_DT) <= DATE(?))
    ORDER BY a.PROD_DRCT_ID DESC
    LIMIT 100`;

    const params = [
      filters.drctName || '',
      filters.drctCode || '',
      filters.managerName || '',
      filters.drctDateStart || '',
      filters.drctDateStart || '',
      filters.drctDateEnd || '',
      filters.drctDateEnd || '',
      filters.prodDateStart || '',
      filters.prodDateStart || '',
      filters.prodDateEnd || '',
      filters.prodDateEnd || '',
    ];

    console.log('📋 서비스 파라미터:', params);
    
    let conn = await mariadb.getConnection();
    let result = await conn.query(prodDrctInquiryList, params);
    conn.release();
    
    return result || [];
  } catch (err) {
    console.error("getProdDrctInquiryList 오류:", err);
    throw err;
  }
};

module.exports = {
  getProdDrctInquiryList,
};