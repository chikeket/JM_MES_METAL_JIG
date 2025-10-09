const mariadb = require("../database/mapper.js");

// 모달창 (수주 조회)
// 아주 기본적인 목록 조회: 검색어가 있으면 LIKE 검색, 없으면 전체
async function getRcvordList(searchId) {
  const rcvordId = (searchId ?? "").trim();
  const rows = await mariadb.query("modalRcvordFind", [rcvordId]);
  // 여기서는 별도 가공 없이 그대로 반환 (total_qty 컬럼 명 일치 주의)
  return rows.map((r) => ({
    ...r,
    status: r.st_nm || r.st, // 코드명 우선 사용
  }));
}

module.exports = {
  getRcvordList,
  async getRcvordHeader(id) {
    if (!id) return null;
    const rows = await mariadb.query("rcvordFindHeader", [id]);
    if (!rows.length) return null;
    const h = rows[0];
    // status: 표시용 명칭, st: 코드 그대로
    return { ...h, status: h.st_nm || h.st };
  },
  async getRcvordLines(id) {
    if (!id) return [];
    const ls = await mariadb.query("rcvordFindLines", [id]);
    return ls.map((l) => ({ ...l, prdt_st_nm: l.prdt_st_nm || l.prdt_st }));
  },
  // 삭제 (라인 -> 헤더 순서)
  async deleteRcvord(id) {
    if (!id) throw new Error("id 누락");
    await mariadb.query("rcvordDeleteLines", [id]);
    await mariadb.query("rcvordDeleteHeader", [id]);
    return { ok: true };
  },
  // 저장 (신규 + 수정 공통) - 트랜잭션 없이 단순 구현 (학습용)
  async saveRcvord(header, lines) {
    if (!header) throw new Error("header 누락");
    if (!Array.isArray(lines)) throw new Error("lines 형식 오류");
    header.st = header.st || "J2";
    header.reg_dt = header.reg_dt || today();

    // 이름만 들어온 경우( co_id, emp_id 없음 ) 이름 -> ID 매핑 시도
    // 안전하게: 둘 다 비어있을 때만 기본값 적용
    if (!header.co_id && header.co_nm) {
      const coRows = await mariadb.query("coFindAll"); // 단순 전체 후 필터 (소규모 가정)
      const found = coRows.find((r) => r.co_nm === header.co_nm);
      if (found) header.co_id = found.co_id;
    }
    if (!header.emp_id && header.emp_nm) {
      // 우선 정확히 일치 검색
      const exact = await mariadb.query("empFindByName", [header.emp_nm]);
      if (exact.length) header.emp_id = exact[0].emp_id;
      else {
        const like = await mariadb.query("empFindByNameLike", [header.emp_nm]);
        if (like.length === 1) header.emp_id = like[0].emp_id; // 애매하면 자동선택하지 않음
      }
    }
    // 그래도 없으면 (신규 Insert 시) 기본값으로 fallback
    if (!header.co_id) header.co_id = "co001";
    if (!header.emp_id) header.emp_id = "emp001";

    // 수주 ID 없으면 생성
    if (!header.rcvord_id) {
      const idRows = await mariadb.query("rcvordNewId");
      header.rcvord_id = idRows[0]?.new_id;
    }
    const rcvordId = header.rcvord_id;

    // 존재 여부
    const exists = await mariadb.query("rcvordExists", [rcvordId]);
    if (exists.length) {
      await mariadb.query("rcvordUpdate", [
        header.co_id,
        header.emp_id,
        header.reg_dt,
        header.st,
        header.rm || null,
        rcvordId,
      ]);
    } else {
      await mariadb.query("rcvordInsert", [
        rcvordId,
        header.co_id,
        header.emp_id,
        header.reg_dt,
        header.st,
        header.rm || null,
      ]);
    }

    // 라인 재작성
    await mariadb.query("rcvordDeleteLines", [rcvordId]);
    for (const ln of lines) {
      if (!ln.prdt_id || !ln.prdt_opt_id) {
        throw new Error("라인 필수값 누락(prdt_id/prdt_opt_id)");
      }
      let lineId = ln.rcvord_deta_id;
      if (!lineId) {
        const lineRows = await mariadb.query("rcvordDetaNewId");
        lineId = lineRows[0]?.new_id;
      }
      await mariadb.query("rcvordInsertLine", [
        lineId,
        rcvordId,
        ln.prdt_id,
        ln.prdt_opt_id,
        Number(ln.rcvord_qy || 0),
        ln.paprd_dt || header.reg_dt,
        ln.rm || null,
      ]);
    }
    return { ok: true, rcvord_id: rcvordId };
  },
};

// 간단 날짜 함수
function today() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
