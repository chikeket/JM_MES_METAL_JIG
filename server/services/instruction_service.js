const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

const addNewInstruction = async (Info) => {
    let insertColumns = [
        'PROD_DRCT_ID', 'PROD_DRCT_NM', 'EMP_ID', 'PROD_DRCT_FR_DT', 'PROD_DRCT_TO_DT', 'REG_DT', 'RM'
    ];
    let data = convertObjToAry(Info, insertColumns);

    let resInfo = await mariadb
        .query("instructionInsert", data)
        .catch((err) => console.log(err));

    let result = null;
    if (resInfo.affectedRows > 0) {
        // 정상적으로 등록된 경우
        result = {
            isSuccessed: true,
        };
    } else {
        // 등록되지 않은 경우
        result = {
            isSuccessed: false,
        };
    }
    return result;
};

const addNewInstructionDeta = async (Info) => {
    let insertColumns = [
        'PROD_DRCT_ID', 'PROD_PLAN_DETA_ID', 'PRDT_ID', 'PRDT_OPT_ID', 'DRCT_QY', 'PRIORT', 'RM'
    ];
    let data = convertObjToAry(Info, insertColumns);
    // console.log(Info)
    let resInfo = await mariadb
        .query("instructionInsertDetail", data)
        .catch((err) => console.log(err));

    let result = null;
    if (resInfo.affectedRows > 0) {
        // 정상적으로 등록된 경우
        result = {
            isSuccessed: true,
        };
    } else {
        // 등록되지 않은 경우
        result = {
            isSuccessed: false,
        };
    }
    return result;
};
module.exports = {

    addNewInstruction,
    addNewInstructionDeta,
};