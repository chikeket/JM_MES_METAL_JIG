// 자재 테이블 관련 SQL 쿼리들

// 자재 전체 목록 조회 (자재 ID 순으로 정렬)
const rscSelect =
  `SELECT
        rsc_id ,
        rsc_clsf_id,
        rsc_nm,
        spec,
        unit,
        rm
FROM rsc`;

module.exports = {
  rscSelect,
};
