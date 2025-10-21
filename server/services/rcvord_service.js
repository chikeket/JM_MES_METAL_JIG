const mariadb = require("../database/mapper.js");

// 모달창 (수주 조회)
// 아주 기본적인 목록 조회: 검색어가 있으면 LIKE 검색, 없으면 전체
async function getRcvordList(searchId) {
  const rcvordId = (searchId ?? "").trim();
  const rows = await mariadb.query("modalRcvordFind", [rcvordId]);
  // 여기서는 별도 가공 없이 그대로 반환 (total_qty 컬럼 명 일치 주의)
  return rows.map((r) => ({
    ...r,
    // 쿼리에서 계산된 status 사용 (모든 라인 st='J3'이면 '출고 완료', 아니면 '진행 중')
    status: r.status || "진행 중",
  }));
}

module.exports = {
  getRcvordList,
  async getRcvordHeader(id) {
    if (!id) return null;
    const rows = await mariadb.query("rcvordFindHeader", [id]);
    if (!rows.length) return null;
    const h = rows[0];
    // 쿼리에서 계산된 status 사용
    return { ...h, status: h.status || "진행 중" };
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
  // 저장 (신규 + 수정 공통) - 트랜잭션 + 라인 upsert(diff)로 FK 안전성 보장
  async saveRcvord(header, lines) {
    if (!header) throw new Error("header 누락");
    if (!Array.isArray(lines)) throw new Error("lines 형식 오류");
    header.reg_dt = header.reg_dt || today();

    const conn = await mariadb.getConnection();
    try {
      await conn.beginTransaction();

      // 이름 -> ID 매핑
      if (!header.co_id && header.co_nm) {
        const coRows = await conn.query("SELECT co_id, co_nm FROM co");
        const found = coRows.find((r) => r.co_nm === header.co_nm);
        if (found) header.co_id = found.co_id;
      }
      if (!header.emp_id && header.emp_nm) {
        const exact = await conn.query(
          "SELECT emp_id, emp_nm FROM emp WHERE emp_nm = ?",
          [header.emp_nm]
        );
        if (exact.length) header.emp_id = exact[0].emp_id;
        else {
          const like = await conn.query(
            "SELECT emp_id, emp_nm FROM emp WHERE emp_nm LIKE CONCAT('%', ?, '%')",
            [header.emp_nm]
          );
          if (like.length === 1) header.emp_id = like[0].emp_id;
        }
      }
      if (!header.co_id) header.co_id = "co001";
      if (!header.emp_id) header.emp_id = "emp001";

      // 수주 ID 발급(신규)
      if (!header.rcvord_id) {
        const idRows = await conn.query(
          require("../database/sqlList.js").rcvordNewId
        );
        header.rcvord_id = idRows[0]?.new_id;
      }
      const rcvordId = header.rcvord_id;

      // 헤더 upsert
      const exists = await conn.query(
        require("../database/sqlList.js").rcvordExists,
        [rcvordId]
      );
      if (exists.length) {
        await conn.query(require("../database/sqlList.js").rcvordUpdate, [
          header.co_id,
          header.emp_id,
          header.reg_dt,
          header.rm || null,
          rcvordId,
        ]);
      } else {
        await conn.query(require("../database/sqlList.js").rcvordInsert, [
          rcvordId,
          header.co_id,
          header.emp_id,
          header.reg_dt,
          header.rm || null,
        ]);
      }

      // 기존 라인 목록
      const existLines = await conn.query(
        require("../database/sqlList.js").rcvordFindLinesByDoc,
        [rcvordId]
      );
      const existById = new Map(existLines.map((r) => [r.rcvord_deta_id, r]));
      // 추가: prdt_id+prdt_opt_id 로 기존 라인을 찾아 업데이트 가능하도록 맵 생성
      const existByPrdtKey = new Map();
      for (const r of existLines) {
        const key = `${r.prdt_id}||${r.prdt_opt_id}`;
        if (!existByPrdtKey.has(key)) {
          existByPrdtKey.set(key, r.rcvord_deta_id);
        }
      }

      // upsert
      for (const ln of lines) {
        if (!ln.prdt_id || !ln.prdt_opt_id) {
          throw new Error("라인 필수값 누락(prdt_id/prdt_opt_id)");
        }
        let detId = ln.rcvord_deta_id && String(ln.rcvord_deta_id).trim();
        // 만약 detId가 없지만 동일 prdt/prdt_opt 조합이 기존에 있으면 해당 detId로 업데이트 처리
        if (!detId) {
          const key = `${ln.prdt_id}||${ln.prdt_opt_id}`;
          if (existByPrdtKey.has(key)) {
            detId = existByPrdtKey.get(key);
          }
        }

        // detId가 존재하지만 맵에 없을 수 있음(타입/포맷 이슈). 실제 DB에서 존재하는지 확인하여
        // 존재하면 UPDATE 경로로, 존재하지 않으면 새로 생성하도록 detId를 제거
        if (detId && !existById.has(detId)) {
          const existsCheck = await conn.query(
            "SELECT 1 FROM rcvord_deta WHERE rcvord_deta_id = ? LIMIT 1",
            [detId]
          );
          if (existsCheck.length === 0) {
            // DB에 실제로 없는 ID였다면 신규로 처리하도록 detId 무시
            detId = null;
          }
        }

        if (detId && existById.has(detId)) {
          // update path
          await conn.query(require("../database/sqlList.js").rcvordUpdateLine, [
            ln.prdt_id,
            ln.prdt_opt_id,
            Number(ln.rcvord_qy || 0),
            ln.paprd_dt || header.reg_dt,
            ln.rm || null,
            detId,
          ]);
          existById.delete(detId);
          // prdtKey 맵에서도 제거
          const delKey = `${ln.prdt_id}||${ln.prdt_opt_id}`;
          if (
            existByPrdtKey.has(delKey) &&
            existByPrdtKey.get(delKey) === detId
          ) {
            existByPrdtKey.delete(delKey);
          }
        } else {
          // insert path
          // 안전한 신규 ID 생성: detId가 남아있다면(드물게) DB에 존재하는지 재확인, 그렇다면 새 ID로 변경
          let newId = detId || null;
          if (newId) {
            const existsCheck = await conn.query(
              "SELECT 1 FROM rcvord_deta WHERE rcvord_deta_id = ? LIMIT 1",
              [newId]
            );
            if (existsCheck.length > 0) {
              // 이미 존재하므로 새 ID를 발급받도록 초기화
              newId = null;
            }
          }
          // 발급 루프(충돌 가능성 대비, 다중 동시 삽입차 대비 최대 5번 시도)
          if (!newId) {
            for (let attempt = 0; attempt < 5; attempt++) {
              const lineRows = await conn.query(
                require("../database/sqlList.js").rcvordDetaNewId
              );
              newId = lineRows[0]?.new_id;
              if (!newId) continue;
              const dup = await conn.query(
                "SELECT 1 FROM rcvord_deta WHERE rcvord_deta_id = ? LIMIT 1",
                [newId]
              );
              if (dup.length === 0) break; // 유일한 ID 확보
              newId = null; // 중복이면 재시도
            }
            if (!newId)
              throw new Error("rcvord_deta 신규 ID 생성 실패(충돌 반복)");
          }

          await conn.query(require("../database/sqlList.js").rcvordInsertLine, [
            newId,
            rcvordId,
            ln.prdt_id,
            ln.prdt_opt_id,
            Number(ln.rcvord_qy || 0),
            ln.paprd_dt || header.reg_dt,
            ln.rm || null,
          ]);
        }
      }

      // 남은 기존 라인(프론트에서 제거된 것으로 간주) 삭제 시도
      for (const [leftId] of existById) {
        try {
          await conn.query(
            require("../database/sqlList.js").rcvordDeleteLineById,
            [leftId]
          );
        } catch (err) {
          // FK 참조 시 409를 유도하기 위해 에러 rethrow
          const msg = String((err && err.message) || "");
          if (
            msg.includes("ER_ROW_IS_REFERENCED_2") ||
            msg.toLowerCase().includes("foreign key")
          ) {
            throw new Error(
              `외부 참조로 인해 라인(${leftId})을 삭제할 수 없습니다.`
            );
          }
          throw err;
        }
      }

      await conn.commit();
      return { ok: true, rcvord_id: rcvordId };
    } catch (err) {
      try {
        await conn.rollback();
      } catch (_) {}
      throw err;
    } finally {
      if (conn) conn.release();
    }
  },
};

// 간단 날짜 함수
function today() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
