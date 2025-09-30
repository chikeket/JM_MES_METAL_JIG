const instructionInsert =
    //
    `INSERT INTO PROD_DRCT (PROD_DRCT_ID, PROD_DRCT_NM, EMP_ID, PROD_DRCT_FR_DT, PROD_DRCT_TO_DT, REG_DT, RM)
VALUES (?, ?, ?, ?, ?, ?, ?)`;

const instructionInsertDetail =
    //
    `INSERT INTO PROD_DRCT_DETA (PROD_DRCT_DETA_ID, PROD_DRCT_ID, PROD_PLAN_DETA_ID, PRDT_ID, PRDT_OPT_ID, DRCT_QY, PRIORT, RM)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;