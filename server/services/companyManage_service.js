const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

const companyManage = async (Info) => {
  let insertColumns = ["emp_nm", "insp_dt"];
  let data = convertObjToAry(Info, insertColumns);
  console.log("service쪽");
  console.log(data);
  let list = await mariadb
  .query("rscQltyInspSelect", data)
  .catch((err) => console.log(err));
  return list;
}


module.exports = {
};
