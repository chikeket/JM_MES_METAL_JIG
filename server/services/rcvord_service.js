const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
//const { convertObjToAry } = require("../utils/converts.js");

// 조건 없이 전체조회
const rcvordFindAll = async () => {
  let list = await mariadb
    .query("rcvordFindAll")
    .catch((err) => console.log(err));
  console.log("조회 결과:", list);
  return list;
};

module.exports = {
  rcvordFindAll,
};
