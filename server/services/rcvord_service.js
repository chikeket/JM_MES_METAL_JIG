const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
//const { convertObjToAry } = require("../utils/converts.js");

// 업체 + 집계(total_qty, due_date)
const rcvordFindAllWithAgg = async () => {
  const list = await mariadb.query("rcvordFindAllWithAgg").catch((err) => {
    console.log(err);
    throw err;
  });
  return list;
};

// 헤더 단건 (합계/납기 포함)
const rcvordFindHeader = async (ordrId) => {
  const list = await mariadb
    .query("rcvordFindHeader", [ordrId])
    .catch((err) => {
      console.log(err);
      throw err;
    });
  return list[0] || null;
};

// 라인 목록 (제품/옵션)
const rcvordFindLines = async (ordrId) => {
  const list = await mariadb.query("rcvordFindLines", [ordrId]).catch((err) => {
    console.log(err);
    throw err;
  });
  return list;
};

// 저장 (존재 여부 판단 후 INSERT/UPDATE, 라인 재작성)
// header: { rcvord_id, co_id, emp_id, reg_dt, st, rm }
// lines: [{ rcvord_deta_id, prdt_id, prdt_opt_id, rcvord_qy, paprd_dt, rm }]
async function rcvordSave(header, lines) {
  const exists = await mariadb.query("rcvordExists", [header.rcvord_id]);
  if (exists && exists.length) {
    await mariadb.query("rcvordUpdate", [
      header.co_id,
      header.emp_id,
      header.reg_dt,
      header.st,
      header.rm,
      header.rcvord_id,
    ]);
  } else {
    await mariadb.query("rcvordInsert", [
      header.rcvord_id,
      header.co_id,
      header.emp_id,
      header.reg_dt,
      header.st,
      header.rm,
    ]);
  }
  await mariadb.query("rcvordDeleteLines", [header.rcvord_id]);
  for (const ln of lines) {
    await mariadb.query("rcvordInsertLine", [
      ln.rcvord_deta_id,
      header.rcvord_id,
      ln.prdt_id,
      ln.prdt_opt_id,
      ln.rcvord_qy,
      ln.paprd_dt,
      ln.rm,
    ]);
  }
  return { ok: true };
}

module.exports = {
  rcvordFindAllWithAgg,
  rcvordFindHeader,
  rcvordFindLines,
  rcvordSave,
};
