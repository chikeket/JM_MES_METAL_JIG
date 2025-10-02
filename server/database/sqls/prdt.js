//제품
const prdtSelect =
  //
  `SELECT
        a.prdt_id ,
        a.prdt_nm,
        a.spec,
        a.unit,
        a.prdt_st,
        a.rm,
        b.prdt_opt_id,
        b.opt_nm
FROM prdt a 
JOIN prdt_opt b
ON a.prdt_id = b.prdt_id
WHERE b.st = '사용'
AND a.prdt_id LIKE CONCAT('%', ?, '%')
AND a.prdt_nm LIKE CONCAT('%', ?, '%')
AND a.spec LIKE CONCAT('%', ?, '%')
AND b.opt_nm LIKE CONCAT('%', ?, '%')`;

module.exports = {
  prdtSelect,
};
