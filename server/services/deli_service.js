const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

module.exports = {
  // 모달 목록: 검색어(optional)
  async getDeliList(searchId) {
    const kw = (searchId ?? "").trim();
    // deliModalFind는 (?='', OR LIKE) 패턴으로 전체/검색을 처리
    return await mariadb.query("deliModalFind", [kw, kw]);
  },
  // 단건 헤더 + 라인
  async getDeliDetail(deliId) {
    if (!deliId) throw new Error("deliId 누락");
    const headerRows = await mariadb.query("deliFindHeader", [deliId]);
    if (!headerRows.length) return null;
    const header = headerRows[0];
    // deliFindLines: [cur.deli_id, doc.deli_id, WHERE dd.deli_id]
    const lines = await mariadb.query("deliFindLines", [
      deliId,
      deliId,
      deliId,
    ]);
    return { header, lines };
  },
  // 삭제 (헤더 삭제, 상세는 FK CASCADE 가정)
  async deleteDeli(deliId) {
    if (!deliId) throw new Error("deliId 누락");
    let conn;
    try {
      conn = await mariadb.getConnection();
      await conn.beginTransaction();
      // 상세 먼저 삭제 후 헤더 삭제
      await conn.query(sqlList.deliDeleteLines, [deliId]);
      await conn.query(sqlList.deliDeleteHeader, [deliId]);
      await conn.commit();
      return { ok: true };
    } catch (err) {
      if (conn)
        try {
          await conn.rollback();
        } catch (_) {}
      throw err;
    } finally {
      if (conn) conn.release();
    }
  },
  // 저장 (신규/수정) - 기본 구현
  async saveDeli(header, lines) {
    if (!header) throw new Error("header 누락");
    if (!Array.isArray(lines)) throw new Error("lines 형식 오류");

    // 트랜잭션 시작
    const conn = await mariadb.getConnection();
    try {
      await conn.beginTransaction();

      // emp_nm -> emp_id 매핑 (없으면 기본값)
      if (!header.emp_id && header.emp_nm) {
        const exact = await conn.query(sqlList.empFindByName, [header.emp_nm]);
        if (exact.length) header.emp_id = exact[0].emp_id;
        else {
          const like = await conn.query(sqlList.empFindByNameLike, [
            header.emp_nm,
          ]);
          if (like.length === 1) header.emp_id = like[0].emp_id;
        }
      }
      if (!header.emp_id) header.emp_id = "emp001";

      // 날짜/시간 기본값 및 정규화: 화면은 날짜만 입력해도 DB에는 초까지 저장
      header.deli_dt = normalizeDateTime(header.deli_dt);

      // (우선 header/deli upsert 이전에 재고 검증을 완료한다)
      // 기존 라인 조회는 header 존재 여부와 무관하게 현재 문서 기준으로 조회해야 하므로,
      // deli_id가 없다면 임시로 현재 헤더의 deli_id를 생성만 하고(쓰기 없음) 사용
      if (!header.deli_id) {
        const idRows = await conn.query(sqlList.deliNewId);
        header.deli_id = idRows[0]?.new_id;
      }
      const deliId = header.deli_id;

      // 기존 라인 조회 (라인 upsert를 위해)
      const existing = await conn.query(sqlList.deliFindLinesByDoc, [deliId]);
      const byId = new Map(existing.map((r) => [r.deli_deta_id, r]));
      const byRcv = new Map(existing.map((r) => [r.rcvord_deta_id, r]));

      // 동일 rcvord_deta_id 기준으로 중복 라인 병합 (입력 수량 합산; 입력 없음은 null 유지)
      const merged = new Map();
      for (const row of lines) {
        if (!row) continue;
        const key = row.rcvord_deta_id || null;
        if (!key) continue;
        const raw = row.requestQty;
        const hasInput = raw !== undefined && raw !== null && raw !== "";
        const qty =
          hasInput && Number.isFinite(Number(raw)) ? Number(raw) : null;
        // delivered_qty는 화면 표시용 누계이며 저장 값 계산에 사용하지 않음
        const delivered = Number(row.delivered_qty || 0);
        if (!merged.has(key)) {
          merged.set(key, {
            rcvord_deta_id: key,
            deli_deta_id: row.deli_deta_id || null,
            requestQty: qty, // null이면 입력 없음
            delivered_qty: delivered,
            remark: row.remark || row.rm || null,
          });
        } else {
          const acc = merged.get(key);
          if (qty !== null) {
            acc.requestQty = Number.isFinite(Number(acc.requestQty))
              ? Number(acc.requestQty) + qty
              : qty;
          }
          // delivered는 그리드 표시 누계이므로 병합 시 최대값 유지(동일 키에서 값이 다를 일은 드묾)
          if (!Number.isFinite(Number(acc.delivered_qty)))
            acc.delivered_qty = 0;
          acc.delivered_qty = Math.max(
            Number(acc.delivered_qty || 0),
            delivered
          );
        }
      }

      // 저장 전에 재고 검증: rcvord_deta_id -> prdt_id, prdt_opt_id 매핑 후 품목별 요청합이 재고 이하인지 체크
      {
        const targetIds = Array.from(merged.values())
          .map((m) => m.rcvord_deta_id)
          .filter(Boolean);
        if (targetIds.length) {
          // 수주상세 → 제품/옵션 매핑 조회
          const mapRows = await conn.query(
            sqlList.selectPrdtAndOptByRcvordDetaIds,
            [targetIds]
          );
          const idToItem = new Map();
          for (const r of mapRows || []) {
            idToItem.set(r.rcvord_deta_id, {
              prdt_id: r.prdt_id,
              prdt_opt_id: r.prdt_opt_id,
            });
          }
          // 제품/옵션별 요청 수량 합계 집계
          const reqByItem = new Map(); // key: prdt_id|prdt_opt_id, val: sum qty
          for (const m of merged.values()) {
            const map = idToItem.get(m.rcvord_deta_id);
            if (!map) continue;
            const key = `${map.prdt_id}|${map.prdt_opt_id}`;
            const add = Number(m.requestQty || 0);
            if (!Number.isFinite(add) || add <= 0) continue;
            reqByItem.set(key, (reqByItem.get(key) || 0) + add);
          }
          // 각 품목 재고 조회 및 비교
          for (const [key, reqSum] of reqByItem.entries()) {
            const [pid, opt] = key.split("|");
            const rows = await conn.query(sqlList.selectNowStockByPrdtOpt, [
              pid,
              opt,
            ]);
            const nowStock = Number(rows?.[0]?.now_stock || 0);
            if (reqSum > nowStock) {
              // 트랜잭션 롤백 후 에러
              throw new Error("재고가 부족합니다.");
            }
          }
        }
      }

      // 재고 검증 통과 후에 헤더 upsert 수행
      const exists = await conn.query(sqlList.deliExists, [deliId]);
      if (exists.length) {
        await conn.query(sqlList.deliUpdate, [
          header.emp_id,
          header.deli_dt,
          header.rm || null,
          deliId,
        ]);
      } else {
        await conn.query(sqlList.deliInsert, [
          deliId,
          header.emp_id,
          header.deli_dt,
          header.rm || null,
        ]);
      }

      for (const ln of merged.values()) {
        if (!ln.rcvord_deta_id)
          throw new Error("라인 필수값 누락(rcvord_deta_id)");

        const base = byRcv.get(ln.rcvord_deta_id);
        const hasInput =
          ln.requestQty !== undefined &&
          ln.requestQty !== null &&
          ln.requestQty !== "";
        const addQty =
          hasInput && Number.isFinite(Number(ln.requestQty))
            ? Number(ln.requestQty)
            : 0;
        // 최종 정책: 현재 문서의 라인 수량만 저장(deli_deta.deli_qy)
        // - 기존 라인이 있으면 입력이 있을 때 해당 값으로 UPDATE
        // - 기존 라인이 없으면 입력이 있을 때만 INSERT
        const nextQty = hasInput ? addQty : Number(base?.deli_qy || 0);

        // 우선순위: base에 식별자가 있으면 그걸 사용
        let lineId = base?.deli_deta_id || ln.deli_deta_id || null;

        if (base) {
          // 기존 라인 보존: 삭제 대상에서 제거
          if (lineId && byId.has(lineId)) byId.delete(lineId);
          // 수량 입력이 없어도 비고 변경(또는 비우기/null)만으로 업데이트 가능해야 함
          const newRm = ln.remark !== undefined ? ln.remark : base.rm || null;
          await conn.query(sqlList.deliUpdateLine, [
            ln.rcvord_deta_id,
            nextQty,
            newRm,
            lineId,
          ]);
        } else {
          // 기존 라인이 없으면, 입력이 있는 경우에만 신규 생성
          if (hasInput) {
            if (!lineId) {
              const lineRows = await conn.query(sqlList.deliDetaNewId);
              lineId = lineRows[0]?.new_id;
            }
            await conn.query(sqlList.deliInsertLine, [
              lineId,
              deliId,
              ln.rcvord_deta_id,
              nextQty, // base가 없으므로 addQty와 동일
              ln.remark || null,
            ]);
          }
        }
      }

      // 남은 기존 라인은 삭제 (그리드에서 제거된 것으로 간주)
      for (const [leftId] of byId) {
        await conn.query("DELETE FROM deli_deta WHERE deli_deta_id = ?", [
          leftId,
        ]);
      }

      await conn.commit();
      return { ok: true, deli_id: header.deli_id };
    } catch (err) {
      try {
        await conn.rollback();
      } catch (_) {}
      throw err;
    } finally {
      if (conn) conn.release();
    }
  },
  // 기납품 누계 조회: rcvord_deta_id 배열을 받아 합계를 맵으로 반환
  async getDeliveredSumByRcvDetaIds(ids = []) {
    const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!list.length) return {};
    const rows = await mariadb.query("deliDeliveredSumByRcvDetaList", [list]);
    const map = {};
    for (const r of rows) map[r.rcvord_deta_id] = Number(r.sum_qty || 0);
    return map;
  },
  // 기준일시 이전의 누계 조회 (예: 현재 문서 등록일시 이전 합계)
  async getDeliveredSumByRcvDetaIdsBefore(ids = [], cutoffDt) {
    const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!list.length) return {};
    // cutoffDt가 비어있으면 전체 누계와 동일하므로 기본 API 사용
    if (!cutoffDt) return await this.getDeliveredSumByRcvDetaIds(list);
    const rows = await mariadb.query("deliDeliveredSumByRcvDetaListBeforeDt", [
      cutoffDt,
      list,
    ]);
    const map = {};
    for (const r of rows) map[r.rcvord_deta_id] = Number(r.sum_qty || 0);
    return map;
  },
};

function nowString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

function normalizeDateTime(input) {
  try {
    if (!input) return nowString();
    if (typeof input === "string") {
      // YYYY-MM-DD 형식만 들어오면 현재 시각을 붙여 저장
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        return `${input} ${hh}:${mm}:${ss}`;
      }
      // 그 외 문자열은 Date 파싱 후 표준 포맷으로 변환
      const d = new Date(input);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");
        return `${y}-${m}-${day} ${hh}:${mi}:${ss}`;
      }
    }
  } catch (_) {}
  return nowString();
}
