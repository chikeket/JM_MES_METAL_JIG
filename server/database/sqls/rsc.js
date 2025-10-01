//제품
const rscSelect =
  //
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
