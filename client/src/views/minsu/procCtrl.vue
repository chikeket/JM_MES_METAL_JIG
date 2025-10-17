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
        <select v-model="form.curr_inpt_qy" :disabled="started">
          <option value="" disabled>선택하세요</option>
          <option v-for="(opt, idx) in currInptOptions" :key="idx" :value="String(opt)">
            {{ opt }}
          </option>
        </select>
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
import { reactive, computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// 화면 상태
const form = reactive({
  prod_drct_id: '',
  prod_drct_nm: '',
  prcs_id: '',
  prcs_nm: '',
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
  emp_nm: '',
  work_start_dt: '',
  work_end_dt: '',
})

const route = useRoute()
const currInptOptions = ref([])
const started = ref(false)
const ended = ref(false)

function fillFromQuery() {
  const q = route.query || {}
  form.prod_drct_id = q.prod_drct_id || ''
  form.prod_drct_nm = q.prod_drct_nm || ''
  form.prcs_id = q.prcs_id || ''
  form.prcs_nm = q.prcs_nm || ''
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
  // 시작 시각 설정 및 타이머 시작
  if (!form.work_start_dt) form.work_start_dt = nowStr()
  if (!endTimer) {
    endTimer = setInterval(() => {
      form.work_end_dt = nowStr()
    }, 1000)
  }
  // 현투입 수량 잠금
  started.value = true
  ended.value = false

  // 서버 저장: proc_ctrl 행 생성
  try {
    const q = route.query || {}
    const payload = {
      prcs_prog_precon_id: q.prcs_prog_precon_id || '',
      prcs_ord: q.prcs_ord ? Number(q.prcs_ord) : null,
      mold_id: form.mold_id && form.mold_id !== '-' ? form.mold_id : null,
      eqm_id: form.eqm_id || null,
      emp_id: q.emp_id || null,
      inpt_qy: Number(form.curr_inpt_qy || 0),
      prod_qy: 0,
      infer_qy: 0,
      pass_qy: 0,
      wk_fr_dt: form.work_start_dt,
    }
    const { data } = await axios.post('/api/proc-ctrl/start', payload)
    // 성공 시, 생성된 ID를 보관하고 싶다면 아래에 상태 확장 가능
    // form.prcs_ctrl_id = data?.prcs_ctrl_id
  } catch (err) {
    console.error('작업 시작 저장 실패', err)
    alert('작업 시작 저장에 실패했습니다.')
    // 실패 시 다시 잠금 해제 및 타이머 중지
    started.value = false
    if (endTimer) {
      clearInterval(endTimer)
      endTimer = null
    }
  }
}
function stopTimer() {
  if (!started.value) return
  if (endTimer) {
    clearInterval(endTimer)
    endTimer = null
  }
  // 종료 시각을 즉시 최종값으로 고정
  form.work_end_dt = nowStr()
  // 생산/불량 입력 가능화 및 생산량 초기값 설정(= 현투입 수량)
  ended.value = true
  form.prod_qy = String(form.curr_inpt_qy || '0')
}

const okQty = computed(() => {
  const prod = Number(form.prod_qy)
  const ng = Number(form.ng_qy)
  if (!Number.isFinite(prod) || !Number.isFinite(ng)) return ''
  return String(prod - ng)
})

onMounted(() => {
  fillFromQuery()
  // 현투입 수량: prod_drct_deta_id로 조회
  const detaId = route.query?.prod_drct_deta_id
  if (detaId) {
    // 1) J2 상태 목록 조회
    axios
      .get('/api/prcs-prog-precon/run-target/list', { params: { prod_drct_deta_id: detaId } })
      .then(({ data }) => {
        const list = Array.isArray(data?.list) ? data.list : []
        currInptOptions.value = list
        // 목록이 하나면 자동 선택 (시작 전에만 가능)
        if (!started.value && list.length === 1) {
          form.curr_inpt_qy = String(list[0])
        } else {
          if (!started.value) form.curr_inpt_qy = ''
        }
        // 목록이 비어있으면 합계 API로 폴백(기존 동작 유지)
        if (list.length === 0) {
          return axios.get('/api/prcs-prog-precon/run-target', {
            params: { prod_drct_deta_id: detaId },
          })
        }
        return null
      })
      .then((resp) => {
        if (resp && resp.data) {
          const v = resp.data?.prod_expc_qy
          // 옵션이 없을 때만 값 설정
          if (!currInptOptions.value.length) {
            currInptOptions.value = v != null ? [Number(v) || 0] : []
            if (!started.value) form.curr_inpt_qy = v != null ? String(v) : ''
          }
        }
      })
      .catch((err) => {
        console.error('현투입 수량 조회 실패', err)
      })
  }
})
onBeforeUnmount(() => stopTimer())

function onSave() {
  // TODO: 서버 저장 API 연동 예정. 현재는 임시로 콘솔 출력만 수행.
  try {
    console.log('저장 클릭 - 현재 입력 값:', { ...form })
    // 예: 유효성 검사 자리
    // if (!form.prod_qy || !form.ng_qy) { /* show toast */ }
  } catch (e) {
    console.error('저장 처리 중 오류', e)
  }
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
