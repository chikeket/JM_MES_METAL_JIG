const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

//rscOrdrModal.vue 자재품질상세리스트 검색
const rscQltyDetaData = async (Info) => {
    console.log('서비스쪽')
    console.log(Info)
    let result = null;

    result = await mariadb
        .query("selectRscOrdrDeta", [Info.rsc_id])
    return result;
}

// 선택된 실적대기제품에 대해 제품 품질항목 조회
const waitingPrdtQltyDeta = async (Info) => {
    let insertColumns = ["prdt_id", "prdt_opt_id"];
    // console.log("클라에서들어가는값 서비스");
    // console.log(Info);
    let data = convertObjToAry(Info, insertColumns);
    // console.log("service쪽");
    console.log(data);
    let list = await mariadb
        .query("prdtQltyDeta", data)
        .catch((err) => console.log(err));
    // console.log("조회 결과:", list);
    return list;
};

// 품질검사 조회페이지 검색
const qltyBoardListSearch = async (Info) => {
    console.log('서비스쪽임');
    console.log(Info);
    const origin = Info;
    const { type, ...filtered } = origin
    let querys = '';
    if (Info.type == '자재') {
        querys = 'rscQltyBoardList'
    } else if (Info.type == '완제품') {
        querys = 'endPrdtQltyBoardList'
    } else {
        querys = 'semiPrdtQltyBoardList'
    }
    console.log(filtered)
    const arr = [...Object.values(filtered)];
    console.log(arr)
    let list = await mariadb
        .query(querys, arr)
        .catch((err) => console.log(err));
    // console.log("조회 결과:", list);
    return list;
};

module.exports = {
    rscQltyDetaData,
    waitingPrdtQltyDeta,
    qltyBoardListSearch,
};