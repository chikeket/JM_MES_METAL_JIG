const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require("../utils/converts.js");

let rscSelectColumns = [
  "mtrl_nm", "mtrl_nm",
  "mtrl_ty", "mtrl_ty"
];

let rscInsertColumns = [
  "mtrl_cd",
  "mtrl_ty",
  "mtrl_nm",
  "spec",
  "unit",
  "rmrk"
];

const rscListView = async (info) => {
  console.log('서비스 - 자재 조회');
  let data = convertObjToAry(info, rscSelectColumns);
  let result = await mariadb.query("rscListView", data);
  return result;
};

const rscInsert = async (info) => {
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    
    if (!info.mtrl_cd) {
      let createId = await mariadb.query("rscCreateId", [], conn);
      info.mtrl_cd = createId[0].mtrl_cd;
    }
    
    let data = convertObjToAry(info, rscInsertColumns);
    await mariadb.query("rscInsert", data, conn);
    await conn.commit();

    return { isSuccessed: true, message: "자재가 등록되었습니다." };
  } catch (err) {
    console.error(err);
    if (conn) await conn.rollback();
    return { isSuccessed: false, message: "자재 등록 중 오류가 발생했습니다." };
  } finally {
    if (conn) conn.release();
  }
};

const rscUpdate = async (info) => {
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    
    const originalId = info.original_mtrl_cd || info.mtrl_cd;

    if (originalId !== info.mtrl_cd) {
      let checkDuplicate = await mariadb.query("rscCheckDuplicate", [info.mtrl_cd], conn);
      if (checkDuplicate.length > 0) {
        await conn.rollback();
        return { isSuccessed: false, message: `자재 코드 "${info.mtrl_cd}"는 이미 존재합니다.` };
      }
    }

    let updateColumns = [
      "mtrl_cd", "mtrl_ty", "mtrl_nm", "spec", "unit", "rmrk", "original_mtrl_cd"
    ];
    info.original_mtrl_cd = originalId;
    let data = convertObjToAry(info, updateColumns);
    
    await mariadb.query("rscUpdate", data, conn);
    await conn.commit();

    return { isSuccessed: true, message: "자재가 수정되었습니다." };
  } catch (err) {
    console.error(err);
    if (conn) await conn.rollback();
    return { isSuccessed: false, message: "자재 수정 중 오류가 발생했습니다." };
  } finally {
    if (conn) conn.release();
  }
};

const rscDelete = async (info) => {
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    
    await mariadb.query("rscDelete", [info.mtrl_cd], conn);
    await conn.commit();

    return { isSuccessed: true, message: "자재가 삭제되었습니다." };
  } catch (err) {
    console.error(err);
    if (conn) await conn.rollback();
    return { isSuccessed: false, message: "자재 삭제 중 오류가 발생했습니다." };
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  rscListView,
  rscInsert,
  rscUpdate,
  rscDelete
};