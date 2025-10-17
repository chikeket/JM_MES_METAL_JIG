const prodDrctInquiryList = `
SELECT
  a.PROD_DRCT_ID as code,
  a.PROD_DRCT_NM as productName,
  IFNULL(b.PRDT_NM, '') as spec,
  IFNULL(b.UNIT_ID, '') as unit,
  0 as planQty,
  0 as drctQty,
  0 as alreadyDrctQty,
  0 as notDrctQty,
  0 as priority,
  a.RM as remark
FROM PROD_DRCT a
LEFT JOIN PRDT b ON a.PROD_DRCT_ID = b.PRDT_ID
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

module.exports = {
  prodDrctInquiryList,
};