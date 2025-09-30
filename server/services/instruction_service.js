const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

const addNewInstruction = async (Info) => {
    // bookInfo : 사용자가 전달한 북정보, Object 타입

    // t_book_01 테이블에 등록하는 insert문에 정의된 컬럼들
    let insertColumns = [
        'PROD_DRCT_ID', 'PROD_DRCT_NM', 'EMP_ID', 'PROD_DRCT_FR_DT', 'PROD_DRCT_TO_DT', 'REG_DT', 'RM'
    ];
    // 사용자가 전달한 북정보 중 insert문에 정의된 컬럼들 기준으로 값을 선별 : 객체 -> 배열
    let data = convertObjToAry(Info, insertColumns);

    let resInfo = await mariadb
        .query("instructionInsert", data)
        .catch((err) => console.log(err));
    // mariadb 모듈은 DML(insert, update, delete)의 결과를 { affectedRows: 1, insertId: 1, warningStatus: 0 } 로 반환
    // affectedRows : 실제 실행된 행수 (default : 0)
    // insertId     : AUTO_INCREMENT를 사용하는 경우 자동 부여된 PRIMARY KEY를 가짐, 무조건 Number 타입 (default : 0)

    let result = null;
    if (resInfo.insertId > 0) {
        // 정상적으로 등록된 경우
        result = {
            isSuccessed: true,
            bookNo: resInfo.insertId,
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
};