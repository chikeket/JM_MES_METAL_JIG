//제품
const prdtSelect =
  //
  `SELECT
      a.prdt_id,
      a.prdt_nm,
      a.spec,
      a.unit,
      a.prdt_st,
      sc_pst.sub_code_nm AS prdt_st_nm,
      a.rm,
      b.prdt_opt_id,
      b.opt_nm
FROM prdt a
JOIN prdt_opt b ON a.prdt_id = b.prdt_id
LEFT JOIN sub_code sc_pst ON sc_pst.sub_code_id = a.prdt_st
WHERE a.prdt_st = 'K1'
  AND b.st = 'M1'
  AND a.prdt_id LIKE CONCAT('%', ?, '%')
  AND a.prdt_nm LIKE CONCAT('%', ?, '%')
  AND a.spec LIKE CONCAT('%', ?, '%')
  AND b.opt_nm LIKE CONCAT('%', ?, '%')`;

module.exports = {
  prdtSelect,
};

// //제품
// const prdtSelect =
//   //
//   `SELECT
//         a.prdt_id ,
//         a.prdt_nm,
//         a.spec,
//         a.unit,
//         a.prdt_st,
//         a.rm,
//         b.prdt_opt_id,
//         b.opt_nm
// FROM prdt a
// JOIN prdt_opt b
// ON a.prdt_id = b.prdt_id
// WHERE a.prdt_st = 'P1'
//   AND b.st = 'M1'
//   AND a.prdt_id LIKE CONCAT('%', ?, '%')
//   AND a.prdt_nm LIKE CONCAT('%', ?, '%')
//   AND a.spec LIKE CONCAT('%', ?, '%')
//   AND b.opt_nm LIKE CONCAT('%', ?, '%')`;

// module.exports = {
//   prdtSelect,
// };
