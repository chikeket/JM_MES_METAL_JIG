const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

// 완제품 품질 실적대기완제품 조회
const waitingFinishedPrdt = async (Info) => {
    let insertColumns = ["prdt_nm", "pass_qy", "wk_to_dt"];
    // console.log("클라에서들어가는값 서비스");
    // console.log(Info);
    let data = convertObjToAry(Info, insertColumns);
    // console.log("service쪽");
    console.log(data);
    let list = await mariadb
        .query("waitingFinishedPrdt", data)
        .catch((err) => console.log(err));
    // console.log("조회 결과:", list);
    return list;
};

// 완제품 품질 실적대기완제품 조회
const waitingEndPrdtQltyDeta = async (Info) => {
    let insertColumns = ["prdt_id", "prdt_opt_id"];
    // console.log("클라에서들어가는값 서비스");
    // console.log(Info);
    let data = convertObjToAry(Info, insertColumns);
    // console.log("service쪽");
    console.log(data);
    let list = await mariadb
        .query("endPrdtQltyDeta", data)
        .catch((err) => console.log(err));
    // console.log("조회 결과:", list);
    return list;
};

module.exports = {
    waitingFinishedPrdt,
    waitingEndPrdtQltyDeta,
};
