// MariaDB 데이터베이스 연결 및 쿼리 실행 모듈
const mariadb = require("mariadb");
// SQL 쿼리문들을 모아놓은 별도 파일
const sqlList = require("./sqlList.js");

// 데이터베이스 연결 풀 생성 (성능 최적화를 위한 연결 재사용)
const connectionPool = mariadb.createPool({
  // 데이터베이스 접속 정보 (환경변수에서 가져옴)
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10, // 최대 연결 수 제한

  // 객체의 필드 정보를 SQL의 '?' 플레이스홀더에 자동 매핑 설정
  permitSetMultiParamEntries: true,
  // INSERT/UPDATE/DELETE 실행 시 반환되는 insertId를 Number 타입으로 자동 변환
  insertIdAsNumber: true,
  // MariaDB의 bigInt 타입을 JavaScript Number 타입으로 자동 변환
  // (JavaScript에서는 bigInt를 자동으로 변환하지 못하기 때문)
  bigIntAsNumber: true,
  // 로거 설정 (디버깅 및 모니터링 용)
  logger: {
    // 실행되는 SQL문을 콘솔에 출력
    query: console.log,
    // 에러 발생 시 처리 함수
    error: console.log,
  },
});

// SQL 쿼리 실행 함수 (별칭으로 쿼리를 찾아서 실행)
const query = async (alias, values) => {
  let conn = null;
  try {
    conn = await connectionPool.getConnection();

    const sql = sqlList[alias]; // 별칭으로 SQL 쿼리 찾기
    const result = await conn.query(sql, values);
    return result;
  } finally {
    // 연결 리소스 정리 (반드시 실행)
    if (conn) conn.release();
  }
};

// 직접 연결 객체 반환 함수 (트랜잭션 등 고급 기능 사용 시)
let getConnection = async () => {
  return await connectionPool.getConnection();
};

module.exports = {
  query,
  getConnection,
};
