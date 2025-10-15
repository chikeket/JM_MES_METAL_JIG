module.exports = {
  rscListView: `
    SELECT mtrl_cd, mtrl_ty, mtrl_nm, spec, unit, rmrk
    FROM MTRL_MST
    WHERE 1=1
      AND (? IS NULL OR ? = '' OR mtrl_nm LIKE CONCAT('%', ?, '%'))
      AND (? IS NULL OR ? = '' OR mtrl_ty LIKE CONCAT('%', ?, '%'))
    ORDER BY mtrl_cd
  `,

  rscCreateId: `
    SELECT CONCAT('M', LPAD(IFNULL(MAX(CAST(SUBSTRING(mtrl_cd, 2) AS UNSIGNED)), 0) + 1, 3, '0')) AS mtrl_cd
    FROM MTRL_MST
  `,

  rscCheckDuplicate: `
    SELECT mtrl_cd FROM MTRL_MST WHERE mtrl_cd = ?
  `,

  rscInsert: `
    INSERT INTO MTRL_MST (mtrl_cd, mtrl_ty, mtrl_nm, spec, unit, rmrk)
    VALUES (?, ?, ?, ?, ?, ?)
  `,

  rscUpdate: `
    UPDATE MTRL_MST
    SET mtrl_cd = ?, mtrl_ty = ?, mtrl_nm = ?, spec = ?, unit = ?, rmrk = ?
    WHERE mtrl_cd = ?
  `,

  rscDelete: `
    DELETE FROM MTRL_MST WHERE mtrl_cd = ?
  `
}