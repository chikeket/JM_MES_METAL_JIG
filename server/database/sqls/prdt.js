//제품
const prdtSelect =
  //
  `SELECT 
          PRDT_ID ,
          PRDT_NM,
          SPEC,
          UNIT,
          PRDT_ST,
          RM
  FROM PRDT `;

module.exports = {
  prdtSelect,
};
