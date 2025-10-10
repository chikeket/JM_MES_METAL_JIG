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

//rscOrdrModal.vue 자재품질상세리스트 검색
const rscQltyDetaData = async (Info) => {
  console.log('서비스쪽')
  console.log(Info)
  let result = null;

  result = await mariadb
    .query("selectRscOrdrDeta", [Info.rsc_id])
  return result;
}

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

// 다중조건 검색조회
const rscQltyInspSelect = async (Info) => {
  let insertColumns = ["emp_nm", "insp_dt"];
  // console.log("클라에서들어가는값 서비스");
  // console.log(Info);
  let data = convertObjToAry(Info, insertColumns);
  console.log("service쪽");
  console.log(data);
  let list = await mariadb
    .query("rscQltyInspSelect", data)
    .catch((err) => console.log(err));
  // console.log("조회 결과:", list);
  return list;
};

//rscQltyinsp.vue 자재품질검수 업데이트
const rscQltyInspUpdate = async (Info) => {
  console.log('서비스쪽')
  console.log(Info)
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let queryResult = null;

    let data = convertObjToAry(Info, rscQltyInspInsertColumns);
    console.log(data)
    queryResult = await mariadb
      .query("rscQltyInspUpdate", data)

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

//rscQltyinsp.vue 자재품질검수 삭제
const rscQltyInspDelete = async (Info) => {
  console.log('서비스쪽')
  console.log(Info)
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let queryResult = null;

    queryResult = await mariadb
      .query("rscQltyInspDelete", [Info.rsc_qlty_insp_id])

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
  rscQltyDetaData,
  rscQltyInspInsert,
  rscQltyInspSelect,
  rscQltyInspUpdate,
  rscQltyInspDelete,
};
