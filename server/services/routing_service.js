const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// 라우팅 상세 행 저장 (INSERT 또는 UPDATE)
const saveRoutingDetaRows = async (prdt_id, prdt_opt_id, rows) => {
  const conn = await mariadb.getConnection();
  try {
    // 1. routing에서 prcs_routing_id 조회
    let [routing] = await conn.query(
      "SELECT prcs_routing_id FROM routing WHERE prdt_id = ? AND prdt_opt_id = ?",
      [prdt_id, prdt_opt_id]
    );
    let prcs_routing_id;
    if (!routing) {
      // routing 마스터가 없으면 생성
      const idRows = await conn.query(
        require("../database/sqlList.js").routingNewId
      );
      prcs_routing_id = idRows[0]?.new_id;
      await conn.query(
        "INSERT INTO routing (prcs_routing_id, prdt_id, prdt_opt_id) VALUES (?, ?, ?)",
        [prcs_routing_id, prdt_id, prdt_opt_id]
      );
    } else {
      prcs_routing_id = routing.prcs_routing_id;
    }

    let affected = 0;
    for (const row of rows) {
      // 2. 해당 행의 ID가 있으면 UPDATE, 없으면 INSERT
      let prcs_routing_deta_id = row.prcs_routing_deta_id;
      if (prcs_routing_deta_id && prcs_routing_deta_id.trim()) {
        // UPDATE: 공정 순서만 변경
        const result = await conn.query(
          "UPDATE routing_deta SET prcs_ord = ? WHERE prcs_routing_deta_id = ?",
          [row.prcs_ord, prcs_routing_deta_id]
        );
        affected += result.affectedRows || 0;
      } else {
        // INSERT: 신규 ID 생성 (routing_detaYYYYMMNNN)
        const idRows = await conn.query(
          require("../database/sqlList.js").routingDetaNewId
        );
        prcs_routing_deta_id = idRows[0]?.new_id;
        // PRCS_REG_DT를 허용하도록 데이터 포함
        const prcs_reg_dt =
          row.prcs_reg_dt || new Date().toISOString().split("T")[0];
        const result = await conn.query(
          "INSERT INTO routing_deta (prcs_routing_deta_id, prcs_routing_id, prcs_id, prcs_ord, prcs_reg_dt) VALUES (?, ?, ?, ?, ?)",
          [
            prcs_routing_deta_id,
            prcs_routing_id,
            row.prcs_id,
            row.prcs_ord,
            prcs_reg_dt,
          ]
        );
        affected += result.affectedRows || 0;
      }
    }
    return affected;
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

// 라우팅 상세 행 여러개 삭제
const deleteRoutingDetaRows = async (prdt_id, prdt_opt_id, rows) => {
  const conn = await mariadb.getConnection();
  try {
    await conn.beginTransaction();
    // 1. routing에서 prcs_routing_id 조회
    const [routing] = await conn.query(
      "SELECT prcs_routing_id FROM routing WHERE prdt_id = ? AND prdt_opt_id = ?",
      [prdt_id, prdt_opt_id]
    );
    if (!routing) throw new Error("해당 제품/옵션의 라우팅 정보가 없습니다.");
    const prcs_routing_id = routing.prcs_routing_id;

    // 2. rows 배열의 각 행을 prcs_routing_deta_id로 삭제 가능하면 그걸로, 아니면 prcs_id+prcs_ord로 삭제
    let deleted = 0;
    for (const row of rows) {
      if (row.prcs_routing_deta_id && row.prcs_routing_deta_id.trim()) {
        const result = await conn.query(
          "DELETE FROM routing_deta WHERE prcs_routing_deta_id = ?",
          [row.prcs_routing_deta_id]
        );
        deleted += result.affectedRows || 0;
      } else {
        const result = await conn.query(
          "DELETE FROM routing_deta WHERE prcs_routing_id = ? AND prcs_id = ? AND prcs_ord = ?",
          [prcs_routing_id, row.prcs_id, row.prcs_ord]
        );
        deleted += result.affectedRows || 0;
      }
    }
    await conn.commit();
    return deleted;
  } catch (error) {
    try {
      await conn.rollback();
    } catch (e) {
      console.error("rollback error", e);
    }
    throw error;
  } finally {
    conn.release();
  }
};

// 제품조회
const getRoutingInfo = async (prdt_cd) => {
  try {
    const result = await mariadb.query("selectPrcs", [prdt_cd]);
    return result;
  } catch (error) {
    console.error("라우팅정보가 아니얌", error);
    throw error;
  }
};

// 공정 모달 조회
const getPrcsModal = async (
  prcs_id,
  prcs_nm,
  eqm_grp_nm,
  lead_tm,
  mold_use_at
) => {
  try {
    const result = await mariadb.query("selectPrcsModal", [
      prcs_id,
      prcs_nm,
      eqm_grp_nm,
      lead_tm,
      mold_use_at,
    ]);
    return result;
  } catch (error) {
    console.error("공정 모달 조회 에러", error);
    throw error;
  }
};

// 제품에 관련 된 공정라우팅 조회
const selectPrcs = async (prdt_id, prdt_opt_id) => {
  try {
    const result = await mariadb.query("selectPrcs", [prdt_id, prdt_opt_id]);
    return result;
  } catch (error) {
    console.error("제품 공정 조회 에러", error);
    throw error;
  }
};

// 라우팅 전용 제품+옵션 목록 조회 (제품명, 옵션ID)
const searchPrdtForRouting = async (prdt_nm = "", prdt_opt_id = "") => {
  try {
    const result = await mariadb.query("routingPrdtSearch", [
      prdt_nm,
      prdt_opt_id,
    ]);
    // Ensure each product+option combination has a routing master row
    if (Array.isArray(result) && result.length > 0) {
      const conn = await mariadb.getConnection();
      try {
        for (const row of result) {
          const prdtId = row.prdt_id;
          const prdtOptId = row.prdt_opt_id;
          const [existing] = await conn.query(
            "SELECT prcs_routing_id FROM routing WHERE prdt_id = ? AND prdt_opt_id = ?",
            [prdtId, prdtOptId]
          );
          if (!existing) {
            // generate new routing id and insert master row
            const idRows = await conn.query(
              require("../database/sqlList.js").routingNewId
            );
            const newRoutingId = idRows[0]?.new_id;
            await conn.query(
              "INSERT INTO routing (prcs_routing_id, prdt_id, prdt_opt_id) VALUES (?, ?, ?)",
              [newRoutingId, prdtId, prdtOptId]
            );
            // attach generated id to returned row for convenience
            row.prcs_routing_id = newRoutingId;
          }
        }
      } catch (e) {
        console.error("[routing_service] routing master 자동 생성 중 오류:", e);
        // non-fatal: continue returning product list even if insert fails
      } finally {
        try {
          conn.release();
        } catch (e) {}
      }
    }
    return result;
  } catch (error) {
    console.error("라우팅 전용 제품 조회 에러", error);
    throw error;
  }
};

module.exports = {
  getRoutingInfo,
  getPrcsModal,
  selectPrcs,
  searchPrdtForRouting,
  deleteRoutingDetaRows,
  saveRoutingDetaRows,
};
