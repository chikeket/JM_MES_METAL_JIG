const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

let rscQltyInspInsertColumns = [
  'rm',
  'rsc_ordr_deta_id',
  'emp_id',
  'rtngud_qy',
  'pass_qy',
  'insp_qy',
  'insp_dt',
  'rsc_qlty_insp_id',
];

//rscQltyinsp.vue 자재품질검수 인서트
const rscQltyInspInsert = async (Info) => {
  console.log('서비스쪽')
  console.log(Info)
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    let createId = null;
    createId = await mariadb
      .query("rscQltyInspCreateId")
    console.log('서비스쪽 id생성쿼리후')
    console.log(createId)
    let queryResult = null;
    let beforeData = { ...Info, ...createId[0] };
    console.log(beforeData)
    let data = convertObjToAry(beforeData, rscQltyInspInsertColumns);
    console.log(data)
    queryResult = await mariadb
      .query("rscQltyInspInsert", data)

    await conn.commit();
    let result = null;
    result = {
      isSuccessed: true,
    };
    return result;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    result = {
      isSuccessed: false,
    };
    return result;
  } finally {
    if (conn) {
      conn.release();
    }
  }

}


module.exports = {
  rscQltyInspInsert,
};
