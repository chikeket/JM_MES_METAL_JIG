// 모달창 (수주 조회)
// 수주 마스터 정보는 있지만 상세 정보가 없는것도 조회하기 위해서 LEFT JOIN 사용
const modalRcvordFind = `SELECT
  r.rcvord_id,
  c.co_nm,
  e.emp_nm,
  IFNULL(SUM(rd.rcvord_qy),0) AS total_qty,
  r.reg_dt,
  r.rm,
  CASE WHEN COUNT(rd.rcvord_deta_id) > 0 AND SUM(CASE WHEN rd.st = 'J3' THEN 1 ELSE 0 END) = COUNT(rd.rcvord_deta_id)
       THEN '출고 완료' ELSE '진행 중' END AS status
FROM rcvord r
  JOIN co c ON (r.co_id = c.co_id)
  JOIN emp e ON (r.emp_id = e.emp_id)
  LEFT JOIN rcvord_deta rd ON (r.rcvord_id = rd.rcvord_id)
GROUP BY r.rcvord_id
HAVING r.rcvord_id LIKE CONCAT('%', ?, '%')
ORDER BY r.rcvord_id DESC`;

// 수주 헤더 단건 (원본 컬럼 유지)
const rcvordFindHeader = `SELECT
  r.rcvord_id,
  r.co_id,
  c.co_nm,
  r.emp_id,
  e.emp_nm,
  r.reg_dt,
  r.rm,
  (
    SELECT CASE WHEN COUNT(*) > 0 AND SUM(CASE WHEN d.st = 'J3' THEN 1 ELSE 0 END) = COUNT(*)
                THEN '출고 완료' ELSE '진행 중' END
    FROM rcvord_deta d WHERE d.rcvord_id = r.rcvord_id
  ) AS status
FROM rcvord r
  JOIN co c ON c.co_id = r.co_id
  JOIN emp e ON e.emp_id = r.emp_id
WHERE r.rcvord_id = ?`;

// 수주 상세 라인 목록
const rcvordFindLines = `SELECT
  d.rcvord_deta_id,
  d.rcvord_id,
  d.prdt_id,
  p.prdt_nm,
  p.spec,
  p.unit,
  p.prdt_st,
  sc_pst.sub_code_nm AS prdt_st_nm,
  d.prdt_opt_id,
  o.opt_nm,
  d.rcvord_qy,
  d.paprd_dt,
  d.st,
  sc_dst.sub_code_nm AS deta_st_nm,
  d.rm
FROM rcvord_deta d
  JOIN prdt p ON p.prdt_id = d.prdt_id
  JOIN prdt_opt o ON o.prdt_opt_id = d.prdt_opt_id
  LEFT JOIN sub_code sc_pst ON sc_pst.sub_code_id = p.prdt_st
  LEFT JOIN sub_code sc_dst ON sc_dst.sub_code_id = d.st
WHERE d.rcvord_id = ?
ORDER BY d.rcvord_deta_id DESC`;

// 저장 관련 (아주 기본 형태)
// 존재 여부 확인
const rcvordExists = `SELECT 1 FROM rcvord WHERE rcvord_id = ? LIMIT 1`;
// 헤더 insert / update
const rcvordInsert = `INSERT INTO rcvord (rcvord_id, co_id, emp_id, reg_dt, rm) VALUES (?, ?, ?, ?, ?)`;
const rcvordUpdate = `UPDATE rcvord SET co_id = ?, emp_id = ?, reg_dt = ?, rm = ? WHERE rcvord_id = ?`;
// 라인 재작성 (전체 삭제 후 다시 insert)
const rcvordDeleteLines = `DELETE FROM rcvord_deta WHERE rcvord_id = ?`;
const rcvordInsertLine = `INSERT INTO rcvord_deta (rcvord_deta_id, rcvord_id, prdt_id, prdt_opt_id, rcvord_qy, paprd_dt, rm) VALUES (?, ?, ?, ?, ?, ?, ?)`;
// 라인 단건 업데이트/조회/삭제
const rcvordUpdateLine = `UPDATE rcvord_deta SET prdt_id = ?, prdt_opt_id = ?, rcvord_qy = ?, paprd_dt = ?, rm = ? WHERE rcvord_deta_id = ?`;
const rcvordFindLinesByDoc = `SELECT rcvord_deta_id, rcvord_id, prdt_id, prdt_opt_id, rcvord_qy, paprd_dt, rm FROM rcvord_deta WHERE rcvord_id = ?`;
const rcvordDeleteLineById = `DELETE FROM rcvord_deta WHERE rcvord_deta_id = ?`;
// 헤더 삭제 (라인 먼저 삭제 후 호출)
const rcvordDeleteHeader = `DELETE FROM rcvord WHERE rcvord_id = ?`;

// ID 생성 (월별 증가) - 형식: YYYYMMNNN (예: 202510001)
// 현재 월에 해당하는 기존 rcvord_id의 마지막 3자리 시퀀스를 찾아 +1
const rcvordNewId = `
  SELECT CONCAT(
           'RO',
           DATE_FORMAT(NOW(), '%Y%m'),
           LPAD(IFNULL(MAX(CAST(SUBSTR(rcvord_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')
         ) AS new_id
  FROM rcvord
  WHERE (
    SUBSTR(rcvord_id, 1, 6) = DATE_FORMAT(NOW(), '%Y%m') -- 무접두 형식(YYYYMMNNN)
    OR SUBSTR(rcvord_id, 3, 6) = DATE_FORMAT(NOW(), '%Y%m') -- 'RO' 접두 형식(ROYYYYMMNNN)
  )
`;
const rcvordDetaNewId = `
  SELECT CONCAT(
           'ROD',
           DATE_FORMAT(NOW(), '%Y%m'),
           LPAD(IFNULL(MAX(CAST(SUBSTR(rcvord_deta_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')
         ) AS new_id
  FROM rcvord_deta
  WHERE SUBSTR(rcvord_deta_id, 4, 6) = DATE_FORMAT(NOW(), '%Y%m')
`;

// 수주 검색 (상세 라인 기준으로 헤더+라인 조인, 헤더만 있는 건도 LEFT JOIN으로 포함)
const rcvordSearchList = `
  SELECT
    R.rcvord_id,
    E.emp_nm,
    C.co_nm,
    P.prdt_nm,
    O.opt_nm,
    P.spec,
    P.unit,
    D.rcvord_qy,
    R.reg_dt,
    D.paprd_dt,
    SC.sub_code_nm AS st_nm,
    R.rm
  FROM rcvord R
    JOIN co C ON C.co_id = R.co_id
    JOIN emp E ON E.emp_id = R.emp_id
    JOIN rcvord_deta D ON D.rcvord_id = R.rcvord_id
    JOIN prdt P ON P.prdt_id = D.prdt_id
    JOIN prdt_opt O ON O.prdt_opt_id = D.prdt_opt_id
    AND O.prdt_id = D.prdt_id
    JOIN sub_code SC ON SC.sub_code_id = D.st
  WHERE
    (? = '' OR R.rcvord_id LIKE CONCAT('%', ?, '%'))
    AND (? = '' OR C.co_nm LIKE CONCAT('%', ?, '%'))
    AND (? = '' OR E.emp_nm LIKE CONCAT('%', ?, '%'))
    AND (? = '' OR R.reg_dt >= ?)
    AND (? = '' OR R.reg_dt <= ?)
  ORDER BY R.rcvord_id DESC, D.rcvord_deta_id DESC
`;

// 수주서 모달에서 수주서 마스터테이블 조회(윤기가 쓰는 쿼리)
const rcvordMykMasterSearch = `
  select
 a.rcvord_id
 ,b.co_nm
 ,c.emp_nm
 ,a.reg_dt "reg_dtt"
from rcvord a
join co b
on a.co_id = b.co_id
join emp c
on a.emp_id = c.emp_id
where a.rcvord_id IN(
					select
					 ae.rcvord_id
					from (
							select
							 a.rcvord_id
							 ,b.prdt_id
							 ,b.prdt_opt_id
							 ,b.rcvord_qy
							 ,COALESCE(c.plan_qy, 0) AS plan_qy
							from rcvord a
							join rcvord_deta b
							on a.rcvord_id = b.rcvord_id
							left join (
									select
									 a.rcvord_id
									 ,b.prdt_id
									 ,b.prdt_opt_id
									 ,SUM(b.plan_qy) "plan_qy"
									from prod_plan a
									join prod_plan_deta b
									on a.prod_plan_id = b.prod_plan_id
									group by a.rcvord_id ,b.prdt_id ,b.prdt_opt_id ) c
							on a.rcvord_id = c.rcvord_id
							and b.prdt_id = c.prdt_id
							and b.prdt_opt_id = c.prdt_opt_id
							and b.rcvord_qy > c.plan_qy
							order by a.reg_dt desc) ae)
and a.rcvord_id LIKE CONCAT('%', ?,'%')
and b.co_nm LIKE CONCAT('%', ?,'%')
and c.emp_nm LIKE CONCAT('%', ?,'%')
and a.reg_dt > ?
`;

// 수주서 모달에서 수주서 상세테이블 조회(윤기가 쓰는 쿼리)
const rcvordMykDetaSearch = `
  select
 a.rcvord_id
 ,b.prdt_id
 ,b.prdt_opt_id
 ,d.prdt_nm
 ,e.opt_nm
 ,d.spec
 ,d.unit 
 ,CASE
  WHEN b.rcvord_qy - COALESCE(c.plan_qy, 0) < 0 THEN 0
  ELSE b.rcvord_qy - COALESCE(c.plan_qy, 0)
END AS plan_qy
 ,b.paprd_dt  
from rcvord a
join rcvord_deta b
on a.rcvord_id = b.rcvord_id
left join (
		select
		 a.rcvord_id
		 ,b.prdt_id
		 ,b.prdt_opt_id
		 ,SUM(b.plan_qy) "plan_qy"
		from prod_plan a
		join prod_plan_deta b
		on a.prod_plan_id = b.prod_plan_id
		group by a.rcvord_id ,b.prdt_id ,b.prdt_opt_id ) c
on a.rcvord_id = c.rcvord_id
and b.prdt_id = c.prdt_id
and b.prdt_opt_id = c.prdt_opt_id
and b.st = 'J2'
join prdt d
on b.prdt_id = d.prdt_id
join prdt_opt e
on b.prdt_opt_id = e.prdt_opt_id
and b.prdt_id = e.prdt_id
where a.rcvord_id = ?
order by a.reg_dt desc
`;

module.exports = {
  modalRcvordFind,
  rcvordFindHeader,
  rcvordFindLines,
  rcvordExists,
  rcvordInsert,
  rcvordUpdate,
  rcvordDeleteLines,
  rcvordInsertLine,
  rcvordUpdateLine,
  rcvordFindLinesByDoc,
  rcvordDeleteLineById,
  rcvordDeleteHeader,
  rcvordNewId,
  rcvordDetaNewId,
  rcvordSearchList,
  rcvordMykMasterSearch,
  rcvordMykDetaSearch,
};
