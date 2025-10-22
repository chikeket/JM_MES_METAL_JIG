<template>
  <!-- rcvord 스타일을 재사용한 공정 제어 화면(UI만) -->
  <div class="procctrl-page">
    <!-- 1행: 생산 지시 ID, 생산 지시서 명, 공정 코드, 공정 명 -->
    <div class="grid grid-4">
      <div class="field-set">
        <div class="label">생산 지시 ID</div>
        <input type="text" v-model="form.prod_drct_id" readonly />
      </div>
      <div class="field-set">
        <div class="label">생산 지시 명</div>
        <input type="text" v-model="form.prod_drct_nm" readonly />
      </div>
      <div class="field-set">
        <div class="label">공정 ID</div>
        <input type="text" v-model="form.prcs_id" readonly />
      </div>
      <div class="field-set">
        <div class="label">공정 명</div>
        <input type="text" v-model="form.prcs_nm" readonly />
      </div>
    </div>

    <!-- 3행: 설비 코드, 설비 명, 금형 코드, 금형 명, 캐비티 -->
    <div class="grid grid-5">
      <div class="field-set">
        <div class="label">설비 ID</div>
        <input type="text" v-model="form.eqm_id" readonly />
      </div>
      <div class="field-set">
        <div class="label">설비 명</div>
        <input type="text" v-model="form.eqm_nm" readonly />
      </div>
      <div class="field-set">
        <div class="label">금형 ID</div>
        <input type="text" v-model="form.mold_id" readonly />
      </div>
      <div class="field-set">
        <div class="label">금형 명</div>
        <input type="text" v-model="form.mold_nm" readonly />
      </div>
      <div class="field-set">
        <div class="label">CAVITY</div>
        <input type="text" v-model="form.cavity" readonly />
      </div>
    </div>

    <!-- 2행: 제품 코드, 제품 명, 제품 옵션 코, 제품 옵션 명 -->
    <div class="grid grid-4">
      <div class="field-set">
        <div class="label">제품 ID</div>
        <input type="text" v-model="form.prdt_id" readonly />
      </div>
      <div class="field-set">
        <div class="label">제품 명</div>
        <input type="text" v-model="form.prdt_nm" readonly />
      </div>
      <div class="field-set">
        <div class="label">제품 옵션 ID</div>
        <input type="text" v-model="form.prdt_opt_id" readonly />
      </div>
      <div class="field-set">
        <div class="label">제품 옵션 명</div>
        <input type="text" v-model="form.opt_nm" readonly />
      </div>
    </div>

    <!-- 4행: 지시 수량, 미투입 수량, 기투입 수량, 당일 투입 -->
    <div class="grid grid-4">
      <div class="field-set">
        <div class="label">지시 수량</div>
        <input type="text" v-model="form.drct_qy" readonly />
      </div>
      <div class="field-set">
        <div class="label">기투입 수량</div>
        <input type="text" v-model="form.prev_inpt_qy" readonly />
      </div>
      <div class="field-set">
        <div class="label">미투입 수량</div>
        <input type="text" v-model="form.not_inpt_qy" readonly />
      </div>
      <div class="field-set">
        <div class="label">현투입 수량</div>
        <input
          type="number"
          v-model="form.curr_inpt_qy"
          :readonly="started"
          @blur="onCurrInptBlur"
        />
      </div>
    </div>

    <!-- 5행: 생산량, 불량량, 합격량 -->
    <div class="grid grid-3">
      <div class="field-set">
        <div class="label">생산량</div>
        <input type="number" v-model="form.prod_qy" :readonly="!ended" />
      </div>
      <div class="field-set">
        <div class="label">불량량</div>
        <input type="number" v-model="form.ng_qy" :readonly="!ended" />
      </div>
      <div class="field-set">
        <div class="label">합격량</div>
        <input type="text" :value="okQty" readonly />
      </div>
    </div>

    <!-- 6행: 작업자, 작업 시작 일시, 작업 종료 일시 -->
    <div class="grid grid-3">
      <div class="field-set">
        <div class="label">작업자</div>
        <input type="text" v-model="form.emp_nm" readonly />
      </div>
      <div class="field-set">
        <div class="label">작업 시작 일시</div>
        <input type="text" v-model="form.work_start_dt" readonly />
      </div>
      <div class="field-set">
        <div class="label">작업 종료 일시</div>
        <input type="text" v-model="form.work_end_dt" readonly />
      </div>
    </div>

    <!-- 하단 액션 버튼 -->
    <div class="actions-centered">
      <button
        class="btn btn-sm btn-outline-secondary"
        type="button"
        @click="startWork"
        :disabled="started"
      >
        작업 시작
      </button>
      <button class="btn btn-sm btn-outline-danger" type="button" @click="stopTimer">
        작업 종료
      </button>
      <button class="btn btn-sm btn-outline-secondary" type="button" @click="onSave">
        작업 저장
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

// 화면 상태
const form = reactive({
  prcs_prog_precon_id: '',
  prod_drct_id: '',
  prod_drct_nm: '',
  prcs_id: '',
  prcs_nm: '',
  prcs_ord: '',
  prdt_id: '',
  prdt_nm: '',
  prdt_opt_id: '',
  opt_nm: '',
  eqm_id: '',
  eqm_nm: '',
  mold_id: '',
  mold_nm: '',
  cavity: '',
  drct_qy: '',
  not_inpt_qy: '',
  prev_inpt_qy: '',
  curr_inpt_qy: '',
  prod_qy: '',
  ng_qy: '',
  ok_qy: '',
  emp_id: '',
  emp_nm: '',
  work_start_dt: '',
  work_end_dt: '',
})

const route = useRoute()
const router = useRouter()
const started = ref(false)
const ended = ref(false)

// 안전한 숫자 변환 유틸 (콤마 포함 문자열 처리)
function toNumber(val) {
  if (val === null || val === undefined) return NaN
  const s = String(val).replace(/,/g, '').trim()
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

function fillFromQuery() {
  const q = route.query || {}
  form.prcs_prog_precon_id = q.prcs_prog_precon_id || ''
  form.prod_drct_id = q.prod_drct_id || ''
  form.prod_drct_nm = q.prod_drct_nm || ''
  form.prcs_id = q.prcs_id || ''
  form.prcs_nm = q.prcs_nm || ''
  form.prcs_ord = q.prcs_ord || ''
  form.prdt_id = q.prdt_id || ''
  form.prdt_nm = q.prdt_nm || ''
  form.prdt_opt_id = q.prdt_opt_id || ''
  form.opt_nm = q.opt_nm || ''
  form.eqm_id = q.eqm_id || ''
  form.eqm_nm = q.eqm_nm || ''
  form.mold_id = q.mold_id || '-'
  form.mold_nm = q.mold_nm || '-'
  form.cavity = q.cavity || '-'
  form.drct_qy = q.drct_qy || ''
  form.prev_inpt_qy = q.prev_inpt_qy || ''
  // not_inpt_qy = 지시 수량 - 기투입 수량
  const d = Number(form.drct_qy)
  const p = Number(form.prev_inpt_qy)
  form.not_inpt_qy = Number.isFinite(d) && Number.isFinite(p) ? String(d - p) : ''
  // 초기 입력값
  form.curr_inpt_qy = ''
  form.prod_qy = ''
  form.ng_qy = ''
  form.ok_qy = ''
  form.emp_id = q.emp_id || ''
  form.emp_nm = q.emp_nm || ''
  form.work_start_dt = ''
  form.work_end_dt = ''
}

function nowStr() {
  const dt = new Date()
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  const hh = String(dt.getHours()).padStart(2, '0')
  const mm = String(dt.getMinutes()).padStart(2, '0')
  const ss = String(dt.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

let endTimer = null
async function startWork() {
  if (started.value) return
  // 선택 검증
  if (!form.curr_inpt_qy) {
    alert('현투입 수량을 선택하세요.')
    return
  }
  // 시작 전 한 번 더 제한 검증 (금형 여부에 따라 CAVITY 또는 미투입 수량 기준)
  {
    const curr = toNumber(form.curr_inpt_qy)
    const hasMold = !!(form.mold_id && form.mold_id !== '-')
    if (hasMold) {
      const cavity = toNumber(form.cavity)
      const notInpt = toNumber(form.not_inpt_qy)
      if (
        Number.isFinite(curr) &&
        ((Number.isFinite(cavity) && curr > cavity) || (Number.isFinite(notInpt) && curr > notInpt))
      ) {
        alert('최대 수량을 초과하였습니다.')
        resetCurrInptToPlaceholder()
        return
      }
    } else {
      const notInpt = toNumber(form.not_inpt_qy)
      if (Number.isFinite(curr) && Number.isFinite(notInpt) && curr > notInpt) {
        alert('최대 수량을 초과하였습니다.')
        resetCurrInptToPlaceholder()
        return
      }
    }
  }
  // 시작 전 중복 가드: ppp.st='J2' AND eqm.st='Q2' AND (if mold) mold.st='P2'
  try {
    await axios.post('/api/proc-ctrl/prestart-guard', {
      prcs_prog_precon_id: form.prcs_prog_precon_id,
      eqm_id: form.eqm_id || null,
      mold_id: form.mold_id && form.mold_id !== '-' ? form.mold_id : null,
    })
  } catch (e) {
    console.error('prestart-guard 실패', e)
    alert('정보 중복 오류')
    router.push({ path: '/prcsProgPrecon' })
    return
  }
  // 시작 시각 설정 및 타이머 시작
  // 금형이 있는 경우: mold 상태를 P1로 업데이트 (서버)
  if (form.mold_id && form.mold_id !== '-') {
    try {
      await axios.post('/api/proc-ctrl/mold/p1', { mold_id: form.mold_id })
    } catch (e) {
      console.error('금형 상태 변경(P1) 실패', e)
      alert('금형 상태 변경(P1)에 실패했습니다.')
      return
    }
  }
  // 설비가 있는 경우: eqm 상태를 Q1로 업데이트 (서버)
  if (form.eqm_id) {
    try {
      await axios.post('/api/proc-ctrl/eqm/q1', { eqm_id: form.eqm_id })
    } catch (e) {
      console.error('설비 상태 변경(Q1) 실패', e)
      alert('설비 상태 변경(Q1)에 실패했습니다.')
      return
    }
  }
  // 공정 진행 행 상태(st)를 NULL로 초기화 (리스트에서 제외되도록)
  if (!form.prcs_prog_precon_id) {
    alert('대상 prcs_prog_precon_id가 없습니다. 화면으로 돌아가 다시 시도해주세요.')
    return
  }
  try {
    await axios.post('/api/prcs-prog-precon/clear-status', {
      prcs_prog_precon_id: form.prcs_prog_precon_id,
    })
  } catch (e) {
    console.error('공정 상태 초기화 실패(st=NULL)', e)
    alert('공정 상태 초기화에 실패했습니다.')
    return
  }
  // UI 타이머 및 잠금 처리
  if (!form.work_start_dt) form.work_start_dt = nowStr()
  if (!endTimer) {
    endTimer = setInterval(() => {
      form.work_end_dt = nowStr()
    }, 1000)
  }
  // 현투입 수량 잠금
  started.value = true
  ended.value = false
}
function stopTimer() {
  // 아직 작업 시작 전인 경우: 공정 진행 화면으로 이동 (초기화 상태)
  if (!started.value) {
    router.push({ path: '/prcsProgPrecon' })
    return
  }
  // 1차 클릭: 종료 모드로 전환 (타이머 정지 및 입력 가능)
  if (!ended.value) {
    if (endTimer) {
      clearInterval(endTimer)
      endTimer = null
    }
    // 종료 시각을 즉시 최종값으로 고정
    form.work_end_dt = nowStr()
    // 생산/불량 입력 가능화 및 생산량 초기값 설정(= 현투입 수량)
    ended.value = true
    form.prod_qy = String(form.curr_inpt_qy || '0')
    return
  }
  // 2차 클릭: 서버에 UPDATE 적용 후, 공정 진행 화면으로 이동
  // 필수값 확인: 작업자/설비가 없으면 종료 불가
  if (!form.emp_id) {
    alert('작업자를 선택한 후 진행해 주세요.')
    router.push({ path: '/prcsProgPrecon' })
    return
  }
  if (!form.eqm_id) {
    alert('설비를 선택한 후 진행해 주세요.')
    router.push({ path: '/prcsProgPrecon' })
    return
  }
  // 공정 순서 값 확인
  const prcsOrdNum = Number(form.prcs_ord)
  if (!Number.isFinite(prcsOrdNum)) {
    alert('공정 순서(prcs_ord) 값이 올바르지 않습니다. 처음 화면으로 돌아갑니다.')
    router.push({ path: '/prcsProgPrecon' })
    return
  }
  const payload = {
    // proc_ctrl 저장용 전체 페이로드
    prcs_prog_precon_id: form.prcs_prog_precon_id || '',
    // 라우트 쿼리 대신 폼 상태에서 가져와 명확히 전달
    prcs_ord: prcsOrdNum,
    mold_id: form.mold_id && form.mold_id !== '-' ? form.mold_id : null,
    eqm_id: form.eqm_id || null,
    emp_id: form.emp_id || route.query?.emp_id || null,
    inpt_qy: Number(form.curr_inpt_qy || 0),
    prod_qy: Number(form.prod_qy || 0),
    infer_qy: Number(form.ng_qy || 0),
    pass_qy: Number(okQty.value || 0),
    wk_fr_dt: form.work_start_dt,
    wk_to_dt: form.work_end_dt,
  }
  // 1) proc_ctrl 완료행 INSERT
  axios
    .post('/api/proc-ctrl/finish', payload)
    .then(() => {
      // 2) PRCS_PROG_PRECON 수량 재계산(= proc_ctrl 합계)으로 UPDATE
      return axios.post('/api/prcs-prog-precon/recompute-quantities', {
        prcs_prog_precon_id: payload.prcs_prog_precon_id,
      })
    })
    .then(async () => {
      // 3) 설비/금형 상태 원복: eqm → Q2, mold → P2 (존재 시)
      try {
        if (form.eqm_id) {
          await axios.post('/api/proc-ctrl/eqm/q2', { eqm_id: form.eqm_id })
        }
        if (form.mold_id && form.mold_id !== '-') {
          await axios.post('/api/proc-ctrl/mold/p2', { mold_id: form.mold_id })
        }
      } catch (e) {
        console.error('설비/금형 상태 원복 실패', e)
        // 원복 실패는 치명적이지 않으므로 이동은 계속함
      }
    })
    .then(() => {
      // 4) 다음 공정(prcs_ord+1) drct_qy를 같은 deta의 생산합으로 설정하고 st='J2'
      return axios.post('/api/prcs-prog-precon/advance-next-step', {
        prcs_prog_precon_id: payload.prcs_prog_precon_id,
      })
    })
    .then(() => {
      router.push({ path: '/prcsProgPrecon' })
    })
    .catch((err) => {
      console.error('작업 종료 처리 실패', err)
      const msg = err?.response?.data?.message || err?.message || '작업 종료 처리에 실패했습니다.'
      alert(`작업 종료 처리에 실패했습니다.\n${msg}`)
    })
}

const okQty = computed(() => {
  const prod = Number(form.prod_qy)
  const ng = Number(form.ng_qy)
  if (!Number.isFinite(prod) || !Number.isFinite(ng)) return ''
  return String(prod - ng)
})

onMounted(() => {
  fillFromQuery()
})
onBeforeUnmount(() => stopTimer())

// 현투입 수량 최대치 검증: 포커스 아웃 시 수행
function onCurrInptBlur() {
  const v = form.curr_inpt_qy
  if (!v && v !== 0) return
  const curr = toNumber(v)
  if (!Number.isFinite(curr)) return
  const hasMold = !!(form.mold_id && form.mold_id !== '-')
  if (hasMold) {
    const cavity = toNumber(form.cavity)
    const notInpt = toNumber(form.not_inpt_qy)
    if (
      (Number.isFinite(cavity) && curr > cavity) ||
      (Number.isFinite(notInpt) && curr > notInpt)
    ) {
      alert('최대 수량을 초과하였습니다.')
      resetCurrInptToPlaceholder()
    }
  } else {
    const notInpt = toNumber(form.not_inpt_qy)
    if (Number.isFinite(notInpt) && curr > notInpt) {
      alert('최대 수량을 초과하였습니다.')
      resetCurrInptToPlaceholder()
    }
  }
}

function resetCurrInptToPlaceholder() {
  form.curr_inpt_qy = ''
}

function onSave() {
  const prcsProgPreconId = form.prcs_prog_precon_id || ''
  if (!prcsProgPreconId) {
    alert('저장할 대상(prcs_prog_precon_id)이 없습니다. 다시 시도해주세요.')
    return
  }
  if (!form.curr_inpt_qy) {
    alert('현투입 수량을 선택하세요.')
    return
  }
  const payload = {
    prcs_prog_precon_id: prcsProgPreconId,
    inpt_qy: Number(form.curr_inpt_qy || 0),
    prod_qy: Number(form.prod_qy || 0),
    infer_qy: Number(form.ng_qy || 0),
    pass_qy: Number(okQty.value || 0),
  }
  axios
    .post('/api/prcs-prog-precon/update-quantities', payload)
    .then(async () => {
      // 마지막 단계: 선택한 현투입 수량 행의 inpt_st를 J3로 변경
      const detaId = route.query?.prod_drct_deta_id || ''
      const qty = Number(form.curr_inpt_qy || 0)
      if (detaId && Number.isFinite(qty) && qty > 0) {
        try {
          await axios.post('/api/prcs-prog-precon/mark-run-target-j3', {
            prod_drct_deta_id: detaId,
            prod_expc_qy: qty,
          })
        } catch (e) {
          console.error('현투입 수량 상태 J3 변경 실패', e)
          // 실패해도 저장 플로우는 계속
        }
      }
    })
    .then(() => {
      // 저장 성공 안내 후 공정 진행 화면(초기화 상태)으로 이동
      alert('저장이 완료 되었습니다.')
      router.push({ path: '/prcsProgPrecon' })
    })
    .catch((e) => {
      console.error('작업 저장 실패', e)
      alert('작업 저장에 실패했습니다.')
    })
}
</script>

<style scoped>
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}
.procctrl-page {
  --radius-sm: 4px;
  --radius-md: 6px;
  --color-btn-gray: #6e7b85;
  --color-btn-gray-hover: #5d6871;
  --color-btn-danger: #c53030;
  --color-btn-danger-hover: #a82323;
  --color-btn-text: #fff;
  --row-h: 34px;
}
.procctrl-page {
  font-size: 13px;
  padding: 0 12px;
}
.grid {
  display: grid;
  gap: 10px 12px;
  margin-bottom: 12px;
}
.grid.grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.grid.grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.grid.grid-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}
.field-set {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-set .label {
  font-weight: 700;
  font-size: 14px;
  color: #2c3e50;
}
.btn {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: var(--color-btn-text);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.btn-sm,
.btn-xs {
  height: auto;
  padding: 0.5rem 1.2rem;
  font-size: 14px;
}
.btn-outline-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: var(--color-btn-text);
}
.btn-outline-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
.btn-outline-danger,
.btn.btn-outline-danger,
.btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: var(--color-btn-text);
}
.btn-outline-danger:hover,
.btn-danger:hover {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}
.field-set input[type='text'],
.field-set input[type='date'],
.field-set input[type='number'],
.field-set select,
.field-set textarea {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}
.field-set input[readonly] {
  background: #e9e9e9;
  color: #222;
}
.field-set select:disabled {
  background: #e9e9e9;
  color: #222;
}
.field-set input[type='text'],
.field-set input[type='date'],
.field-set input[type='number'],
.field-set select {
  height: 34px;
}
.field-set input[type='text']:focus,
.field-set input[type='date']:focus,
.field-set input[type='number']:focus,
.field-set select:focus,
.field-set textarea:focus {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}
.actions-centered {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
