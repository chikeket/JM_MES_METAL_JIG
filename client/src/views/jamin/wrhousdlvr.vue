<template>
  <CContainer fluid class="p-3">
    <!-- 상단 버튼 그룹 -->
    <div class="d-flex align-items-center mb-3 gap-2">
      <div>
        <CButton
          :class="mode === 'in' ? 'btn-secondary' : 'btn-outline-secondary'"
          size="sm"
          @click="changeMode('in')"
          >입고</CButton
        >
        <CButton
          :class="mode === 'out' ? 'btn-secondary' : 'btn-outline-secondary'"
          size="sm"
          @click="changeMode('out')"
          >출고</CButton
        >
      </div>

      <div class="ms-auto d-flex gap-2">
        <CButton color="secondary" size="sm" @click="onReset">초기화</CButton>
        <CButton color="secondary" size="sm" @click="openWrhousdlvrModal">수불서 조회</CButton>
        <CButton v-if="mode === 'in'" color="secondary" size="sm" @click="openInspectionSearch"
          >입고서 조회</CButton
        >
        <CButton v-else color="secondary" size="sm" @click="openDeliverySearch"
          >출고서 조회</CButton
        >
        <CButton color="secondary" size="sm" @click="onSave">저장</CButton>
        <CButton
          color="danger"
          size="sm"
          :disabled="!selectedSummaryIds.length || deleting"
          @click="onDeleteSelected"
        >
          {{ deleting ? '삭제 중…' : `삭제 (${selectedSummaryIds.length})` }}
        </CButton>
      </div>
    </div>

    <!-- 수불서 선택 모달 -->
    <WrhousdlvrModal
      :visible="isWrhousdlvrModalOpen"
      @close="closeWrhousdlvrModal"
      @select="onSelectWrhousdlvr"
    />

    <!-- 입고서 선택 모달 -->
    <InspectionModal
      :isOpen="isInspectionModalOpen"
      @close="closeInspectionModal"
      @select="onSelectInspection"
    />

    <!-- 출고서 선택 모달 -->
    <DeliveryModal
      :isOpen="isDeliveryModalOpen"
      @close="closeDeliveryModal"
      @select="onSelectDelivery"
    />

    <!-- 요약(상단) -->
    <div class="card mb-1" style="height: 35vh">
      <div class="card-header py-2">
        <h6 class="mb-0">입출고 상세 정보 (디테일)</h6>
      </div>

      <div class="card-body p-0" style="overflow: auto; height: calc(35vh - 60px)">
        <CTable hover bordered small class="mb-0">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 60px">
                <CFormCheck :checked="allSummarySelected" @change="toggleAllSummary($event)" />
              </CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px"
                >수불 담당자 명</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 120px">{{
                mode === 'in' ? '입고서 ID' : '출고서 ID'
              }}</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 100px"
                >품목 유형</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 130px"
                >품목 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 200px">품목 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 130px"
                >옵션 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 150px">옵션 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 70px">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 110px"
                >가용 수량</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 90px">요청 수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            <CTableRow v-for="(r, i) in summaryRows" :key="getSelectKey(r, i)">
              <CTableDataCell class="text-center">
                <CFormCheck
                  :checked="isSummarySelected(getSelectKey(r, i))"
                  @change="toggleSummaryRow(getSelectKey(r, i), $event)"
                />
              </CTableDataCell>
              <CTableDataCell class="text-center">{{ r.emp_nm ?? '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.inspect_id || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.type || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.code || '' }}</CTableDataCell>
              <CTableDataCell class="text-start">{{ r.name || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.opt_code || '-' }}</CTableDataCell>
              <CTableDataCell class="text-start">{{ r.opt_name || '-' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.spec || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.unit || '' }}</CTableDataCell>
              <CTableDataCell class="text-end" :style="getAvailableQtyStyle(r)">
                {{ r.available_qty !== undefined ? `${r.available_qty} ${r.unit || 'EA'}` : 'N/A' }}
              </CTableDataCell>
              <CTableDataCell class="text-end">
                <CFormInput
                  :value="Math.round(r.qty || 0)"
                  @input="onQuantityInput(r, $event)"
                  @blur="roundQuantity(r)"
                  size="sm"
                  type="number"
                  min="0"
                  step="1"
                  :style="getQuantityInputStyle(r)"
                />
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput v-model="r.remark" size="sm" placeholder="디테일 비고" />
              </CTableDataCell>
            </CTableRow>

            <CTableRow v-if="summaryRows.length === 0">
              <CTableDataCell colspan="13" class="text-center text-muted"
                >데이터 없음</CTableDataCell
              >
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>

    <!-- 하단(집계/LOT) -->
    <div class="card" style="height: 35vh">
      <div class="card-header d-flex justify-content-between align-items-center py-2">
        <div class="fw-bold">입출고 상세 (선택된 품목별 총 수량)</div>
        <div class="text-muted small">
          선택된 항목: {{ selectedSummaryIds.length }} / {{ summaryRows.length }}
        </div>
      </div>

      <div class="card-body p-0" style="overflow: auto; height: calc(35vh - 60px)">
        <CTable hover bordered small class="mb-0 align-middle">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 70px">LOT</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">창고</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">로케이션</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 100px"
                >품목 유형</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 130px"
                >품목 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 200px">품목 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 130px"
                >옵션 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 150px">옵션 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 70px">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 70px">수불 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px">총 수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            <CTableRow v-for="row in finalConsolidatedRows" :key="row.id">
              <CTableDataCell class="text-center">{{ getLotDisplay(row) }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.warehouse_name || '-' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.location_name || '-' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.type }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.code }}</CTableDataCell>
              <CTableDataCell class="text-start">{{ row.name }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.opt_code || '-' }}</CTableDataCell>
              <CTableDataCell class="text-start">{{ row.opt_name || '-' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.spec }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.unit }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput
                  v-model="row.rcvpay_nm"
                  size="sm"
                  placeholder="수불 명"
                  style="min-width: 120px"
                />
              </CTableDataCell>
              <CTableDataCell class="text-end">{{ Math.round(row.total_qty) }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput
                  v-model="row.master_remark"
                  size="sm"
                  placeholder="마스터 비고"
                  style="min-width: 120px"
                />
              </CTableDataCell>
            </CTableRow>

            <CTableRow v-if="finalConsolidatedRows.length === 0">
              <CTableDataCell colspan="12" class="text-center text-muted">
                {{ summaryRows.length === 0 ? '데이터 없음' : '선택된 항목이 없습니다' }}
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>
  </CContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import WrhousdlvrModal from '../modal/wrhsdlvrModal.vue'
import InspectionModal from '../modal/inspectionModal.vue'
import DeliveryModal from '../modal/deliveryModal.vue'
import { useAuthStore } from '@/stores/auth.js'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CFormCheck,
  CFormInput,
  CContainer,
} from '@coreui/vue'

const auth = useAuthStore()

/* =========================
   상태
========================= */
const mode = ref('in') // 'in' | 'out'
const summaryRows = ref([]) // 상단 그리드
const bomMaterials = ref([]) // 생산지시 기반 자재 리스트 (하단 계산용)
const selectedSummaryIds = ref([]) // 상단 선택 상태
const finalConsolidatedRows = ref([]) // 하단(LOT 배분된) 표시용
const warehouseList = ref([])
const locationList = ref([])
const deleting = ref(false)

/* =========================
   로그인 사용자 표시
========================= */
const ownerName = ref('')
const ownerEmpId = ref('')
watch(
  () => auth.user,
  (u) => {
    if (!u) {
      ownerName.value = ''
      ownerEmpId.value = ''
      return
    }
    ownerName.value = u.emp_nm ?? u.name ?? ''
    ownerEmpId.value = u.emp_id ?? u.id ?? ''
  },
  { immediate: true },
)

/* =========================
   유틸/헬퍼
========================= */
function todayLocalYMD() {
  const d = new Date();
  const tzMin = d.getTimezoneOffset();         // 예: 한국 -540
  const local = new Date(d.getTime() - tzMin * 60000);
  return local.toISOString().slice(0, 10);     // 'YYYY-MM-DD'
}

function getSelectKey(row, idx) {
  return (
    row._selkey ??
    row.wrhsdlvr_id ??
    row.wrhsdlvr_mas_id ??
    `${row.inspect_id || 'NOINSP'}|${row.type}|${row.code}|${row.opt_code || 'NOOPT'}|${
      row.lot_no || 'NOLOT'
    }|${idx}`
  )
}

function clampNonNegative(n) {
  const v = Number(n || 0)
  if (!Number.isFinite(v)) return 0
  return Math.max(0, v)
}
function toUnits(v) {
  return Math.ceil(clampNonNegative(v))
}

function isMaterialIssueRow(row) {
  return !!(
    row.txn_subtype === 'MATERIAL_ISSUE' ||
    row.source === 'PROD_DRCT' ||
    row.prod_drct_deta_id ||
    String(row.id || '').includes('_PROD_ORDER_')
  )
}

function getAvailableQtyStyle(row) {
  const q = Number(row.available_qty || 0)
  if (mode.value === 'out' && q === 0) return { color: '#d9534f', fontWeight: 700 }
  if (q < 10) return { color: 'red', fontWeight: 'bold' }
  if (q < 50) return { color: 'orange', fontWeight: 'bold' }
  return { color: 'green' }
}

function getQuantityInputStyle(row) {
  const rq = Number(row.qty || 0),
    aq = Number(row.available_qty || 0)
  if (mode.value === 'out' && rq > aq) {
    return { borderColor: 'red', backgroundColor: '#ffebee', color: 'red', fontWeight: 'bold' }
  }
  return {}
}

// 선택된 상단 행들에 창고/로케이션 자동 주입
async function updateWarehouseLocationInfo(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return
  console.log('[wrh] 창고/로케이션 자동 세팅 시작, 대상:', rows.length)

  if (warehouseList.value.length === 0 || locationList.value.length === 0) {
    await Promise.all([loadAllWarehouses(), loadAllLocations()])
  }

  await Promise.all(
    rows.map(async (row) => {
      const itemType = row.type // '자재' | '반제품' | '완제품' | 'E1' | 'E2' | 'E3'
      let warehouses = []
      try {
        warehouses = await getWarehousesByItemType(itemType)
      } catch {}
      if (!warehouses || warehouses.length === 0) {
        resolveDefaultWHLocFromCaches(row)
        return
      }
      const w = warehouses[0]
      row.warehouse_id = w.warehouse_id
      row.warehouse_name = w.warehouse_name

      let locations = []
      try {
        locations = await getLocationsByItemType(itemType, w.warehouse_id)
      } catch {}
      if (locations && locations.length > 0) {
        row.location_id = locations[0].location_id
        row.location_name = locations[0].location_name
      } else {
        const locs = (locationList.value || []).filter((l) => l.warehouse_id === w.warehouse_id)
        if (locs.length) {
          row.location_id = locs[0].location_id
          row.location_name = locs[0].location_name
        }
      }
    }),
  )

  // 테이블 즉시 반영(필요 시)
  // summaryRows.value = [...summaryRows.value];
  console.log('[wrh] 창고/로케이션 자동 세팅 완료')
}

async function afterAddTopRows() {
  await refreshAvailableForTopRow();                 // 가용 수량 갱신
  await updateWarehouseLocationInfo(summaryRows.value); // 창고/로케이션 자동 세팅
}

/* =========================
   상단 수량 변경 → 하단 동기
========================= */
function onQuantityInput(row, event) {
  let value = toUnits(event?.target?.value ?? row.qty ?? 0)
  let limited = false

  if (mode.value === 'in') {
    if (value > (row.available_qty || 0)) {
      value = row.available_qty || 0
      limited = true
      alert('요청 수량은 가용 수량을 초과할 수 없습니다.')
    }
  } else {
    const maxQty = row._init_qty ?? row.available_qty ?? 0
    if (maxQty > 0 && value > maxQty) {
      value = maxQty
      limited = true
      alert('요청 수량은 허용된 최대 수량을 초과할 수 없습니다.')
    }
  }

  row.qty = value
  if (limited && event?.target) event.target.value = value

  if (isMaterialIssueRow(row) && bomMaterials.value?.length) {
    updateBomMaterialQuantities(row)
  }
}
function roundQuantity(row) {
  if (typeof row.qty === 'number') row.qty = Math.round(row.qty)
}

/* =========================
   가용 수량(상단) 갱신
========================= */
async function refreshAvailableForTopRow() {
  const rows = summaryRows.value || []
  if (!rows.length) return

  const currentMode = mode.value // 'in' | 'out'

  await Promise.all(
    rows.map(async (r) => {
      try {
        if (currentMode === 'in') {
          // 입고: 검사서 남은 수량 그대로
          r.available_qty = Number(r.available_qty ?? r.pass_qty ?? 0)
          return
        }

        // 출고 모드
        if (isMaterialIssueRow(r)) {
          // 자재 불출(생산지시 기반): 몇 개 생산 가능한지(최솟값 원리)
          const { data } = await axios.get('/api/warehouse/available-finished-production-qty', {
            params: { prdt_id: r.code, prdt_opt_id: r.opt_code || null },
          })
          r.available_qty = Number(data?.available_units || 0)
        } else {
          // 완제품 납품: 완제품 현재 재고 합계
          const { data } = await axios.get('/api/warehouse/available-fg-stock', {
            params: { prdt_id: r.code, prdt_opt_id: r.opt_code || null },
          })
          r.available_qty = Number(data?.now_stock || 0)
        }
      } catch (e) {
        console.warn('[refreshAvailableForTopRow] fail:', e)
        r.available_qty = 0
      }
    }),
  )

  // 화면 반영
  summaryRows.value = [...rows]
}

/* =========================
   하단 집계 및 LOT 할당 (필요 시 유지)
========================= */
const consolidatedRows = computed(() => {
  const consolidated = {}
  const checkedRows = summaryRows.value.filter((r, i) =>
    selectedSummaryIds.value.includes(getSelectKey(r, i)),
  )

  let rowsToProcess = []
  // 생산지시 기반이면 BOM 자재를 하단 표에 표시
  if (Array.isArray(bomMaterials.value) && bomMaterials.value.length > 0) {
    const checkedProdIds = checkedRows
      .filter((r) => isMaterialIssueRow(r))
      .map((r) => r.inspect_id)
      .filter(Boolean)
    const filteredBom = bomMaterials.value.filter((m) => checkedProdIds.includes(m.inspect_id))
    rowsToProcess.push(...filteredBom)
  }
  // 일반 출고(납품 등)
  rowsToProcess.push(...checkedRows.filter((r) => !isMaterialIssueRow(r)))

  rowsToProcess.forEach((row) => {
    const key = `${row.code}_${row.opt_code || 'NO_OPT'}_${row.type}`
    const qty = toUnits(row.qty)
    if (consolidated[key]) consolidated[key].total_qty += qty
    else {
      consolidated[key] = {
        id: row.id,
        lot: row.lot || '',
        warehouse_id: row.warehouse_id,
        warehouse_name: row.warehouse_name || '',
        location_id: row.location_id,
        location_name: row.location_name || '',
        type: row.type,
        code: row.code,
        name: row.name,
        opt_code: row.opt_code,
        opt_name: row.opt_name,
        spec: row.spec,
        unit: row.unit,
        total_qty: qty,
        rcvpay_nm: `${mode.value === 'in' ? '입고' : '출고'} 처리 - ${row.name}`,
        master_remark: '',
      }
    }
  })
  return Object.values(consolidated)
})

watch(
  consolidatedRows,
  async (newRows) => {
    // LOT 배분 API가 있다면 여기서 호출해 finalConsolidatedRows를 채움
    finalConsolidatedRows.value = newRows
  },
  { immediate: true },
)

function getLotDisplay(row) {
  return row.lot_no || row.lot || '-'
}

/* =========================
   선택 관리
========================= */
function isSummarySelected(key) {
  return selectedSummaryIds.value.includes(key)
}
function toggleSummaryRow(key, ev) {
  const checked = ev?.target ? !!ev.target.checked : !selectedSummaryIds.value.includes(key)
  if (checked) {
    if (!selectedSummaryIds.value.includes(key)) selectedSummaryIds.value.push(key)
  } else selectedSummaryIds.value = selectedSummaryIds.value.filter((x) => x !== key)
}
const allSummarySelected = computed(() => {
  if (!summaryRows.value.length) return false
  const keys = summaryRows.value.map((r, i) => getSelectKey(r, i))
  return keys.every((k) => selectedSummaryIds.value.includes(k))
})
function toggleAllSummary(ev) {
  const checked = ev?.target ? !!ev.target.checked : !allSummarySelected.value
  selectedSummaryIds.value = checked ? summaryRows.value.map((r, i) => getSelectKey(r, i)) : []
}

/* =========================
   모드/초기화
========================= */
function changeMode(newMode) {
  if (mode.value !== newMode) {
    mode.value = newMode
    summaryRows.value = []
    selectedSummaryIds.value = []
    bomMaterials.value = [] // BOM 캐시 초기화
    finalConsolidatedRows.value = []
  }
}
function onReset() {
  summaryRows.value = []
  selectedSummaryIds.value = []
  bomMaterials.value = []
  finalConsolidatedRows.value = []
  mode.value = 'in'
}

/* =========================
   모달 오픈/클로즈
========================= */
const isWrhousdlvrModalOpen = ref(false)
function openWrhousdlvrModal() {
  isWrhousdlvrModalOpen.value = true
}
function closeWrhousdlvrModal() {
  isWrhousdlvrModalOpen.value = false
}

const isInspectionModalOpen = ref(false)
function openInspectionSearch() {
  isInspectionModalOpen.value = true
}
function closeInspectionModal() {
  isInspectionModalOpen.value = false
}

const isDeliveryModalOpen = ref(false)
function openDeliverySearch() {
  isDeliveryModalOpen.value = true
}
function closeDeliveryModal() {
  isDeliveryModalOpen.value = false
}

/* =========================
   모달 선택 핸들러
========================= */
function normalizeItemType(inspTypeOrText) {
  switch (inspTypeOrText) {
    case 'materialQuality':
      return '자재'
    case 'semiQuality':
      return '반제품'
    case 'finishedQuality':
      return '완제품'
    case 'materialWithdrawal':
      return '완제품' // 상단엔 생산 대상(완제품) 표시
    case 'deliveryDetail':
      return '완제품'
    default:
      return inspTypeOrText || '자재'
  }
}

async function onSelectWrhousdlvr({ master, details }) {
  if (Array.isArray(details) && master) {
    details.forEach((d) => {
      if (!d.wrhsdlvr_mas_id && master.wrhsdlvr_mas_id) d.wrhsdlvr_mas_id = master.wrhsdlvr_mas_id
      if (!d.prdt_nm && master.prdt_nm) d.prdt_nm = master.prdt_nm
      if (d.rsc_id) {
        d.code = d.rsc_id
        d.name = d.rsc_nm
      } else if (d.prdt_id) {
        d.code = d.prdt_id
        d.name = d.prdt_nm
      }
    })
  }
  summaryRows.value = Array.isArray(details) ? details : []
  finalConsolidatedRows.value = master ? [master] : []
  selectedSummaryIds.value = summaryRows.value.map((row, i) => getSelectKey(row, i))
}

async function onSelectInspection(inspectionList) {
  if (!Array.isArray(inspectionList) || inspectionList.length === 0) {
    alert('선택된 검사서가 없습니다.')
    return
  }
  mode.value = 'in'

  const addRows = []
  for (let index = 0; index < inspectionList.length; index++) {
    const inspection = inspectionList[index]
    const itemType = inspection.item_type || normalizeItemType(inspection.insp_type)
    const itemCode = inspection.item_code || inspection.rsc_id
    const itemOptCode = inspection.opt_code || ''
    // 가용 잔량 조회
    let availableQty = 0
    try {
      if (inspection.insp_no) {
        const params = {
          inspect_id: inspection.insp_no,
          item_type: itemType === '자재' ? 'E1' : itemType === '반제품' ? 'E2' : 'E3',
        }
        const { data } = await axios.get('/api/warehouse/inspection-remaining-qty', { params })
        availableQty = Number(data?.remaining_qty ?? 0)
      } else {
        const params = {
          item_type: itemType === '자재' ? 'E1' : itemType === '반제품' ? 'E2' : 'E3',
          item_code: itemCode,
          item_opt_code: itemOptCode,
        }
        const { data } = await axios.get('/api/warehouse/available-qty', { params })
        availableQty = Number(data?.available_qty ?? 0)
      }
    } catch {
      availableQty = 0
    }

    addRows.push({
      id: `${inspection.insp_no}_${itemOptCode || 'NO_OPT'}_${Date.now()}_${index}`,
      inspect_id: inspection.insp_no,
      type: itemType,
      code: itemCode,
      name: inspection.item_name || inspection.rsc_nm,
      opt_code: itemOptCode,
      opt_name: inspection.opt_name || '',
      spec: inspection.item_spec || inspection.rsc_spec || '',
      unit: inspection.item_unit || inspection.rsc_unit || 'EA',
      qty: availableQty,
      available_qty: availableQty,
      emp_nm: ownerName.value,
      remark: '입고 처리',
      warehouse_id: '',
      warehouse_name: '',
      location_id: '',
      location_name: '',
    })
  }

  // 중복 제거 후 추가
  const existKeys = new Set(
    summaryRows.value.map((row) => `${row.inspect_id}_${row.code}_${row.opt_code || 'NO_OPT'}`),
  )
  const unique = addRows.filter(
    (row) => !existKeys.has(`${row.inspect_id}_${row.code}_${row.opt_code || 'NO_OPT'}`),
  )
  summaryRows.value.push(...unique)
  await updateWarehouseLocationInfo(unique)
  selectedSummaryIds.value.push(...unique.map((r, i) => getSelectKey(r, i)))

  await nextTick()
  for (const r of unique) await refreshAvailableForTopRow(r)
  alert(`${unique.length}건의 입고서 품목이 추가되었습니다.`)
  await afterAddTopRows();
}

async function onSelectDelivery(deliveryList) {
  if (!Array.isArray(deliveryList) || deliveryList.length === 0) {
    alert('선택된 출고서가 없습니다.')
    return
  }
  mode.value = 'out'

  const isMaterialWithdrawal = deliveryList[0]?.insp_type === 'materialWithdrawal'

  if (isMaterialWithdrawal) {
  // 1) 상단(완제품: 생산지시 행) 만들기
  const directRows = deliveryList.map((d, idx) => {
    const qty = d.required_qty ?? d.pass_qty ?? d.insp_qty ?? d.rec_qy ?? d.qty ?? d.total_qty ?? d.order_qty ?? 1
    return {
      id: `${d.insp_no}_PROD_ORDER_${d.opt_code || 'NO_OPT'}_${Date.now()}_${idx}_${Math.random().toString(36).slice(2)}`,
      inspect_id: d.insp_no, // 생산지시 ID
      type: '완제품',
      code: d.item_code,
      name: d.item_name,
      opt_code: d.opt_code || '',
      opt_name: d.opt_name || '',
      spec: d.item_spec || '',
      unit: d.item_unit || 'EA',
      qty: Math.ceil(qty),
      emp_nm: ownerName.value,
      remark: `생산지시 불출 - ${d.item_name}`,
      warehouse_id: '',
      warehouse_name: '',
      location_id: '',
      location_name: '',
      prod_drct_deta_id: d.prod_drct_deta_id || ''
    }
  })

  // 중복 제거 후 상단에 추가
  const existKeys = new Set(summaryRows.value.map(r => `${r.inspect_id}_${r.code}_${r.opt_code || 'NO_OPT'}`))
  const uniqueDirect = directRows.filter(r => !existKeys.has(`${r.inspect_id}_${r.code}_${r.opt_code || 'NO_OPT'}`))
  summaryRows.value.push(...uniqueDirect)

  // 2) BOM 자재 불러오기(하단용 원본 리스트)
  const allMaterials = []
  for (const d of deliveryList) {
    const { data: materials = [] } = await axios.get(`/api/production/orders/${d.insp_no}/materials`)
    const productionQty = Math.ceil(d.required_qty ?? d.pass_qty ?? d.insp_qty ?? d.rec_qy ?? d.qty ?? d.total_qty ?? d.order_qty ?? 1)
    const mats = materials.map((m, i) => ({
      id: `${d.insp_no}_MATERIAL_${m.item_code}_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
      inspect_id: d.insp_no,
      type: '자재',
      code: m.item_code,
      name: m.item_name,
      opt_code: '',
      opt_name: '',
      spec: m.item_spec || '',
      unit: m.item_unit || 'EA',
      qty: Math.ceil((m.bom_qty || m.rec_qy || 1) * productionQty),
      emp_nm: ownerName.value,
      remark: `자재 불출 - ${d.item_name}`,
      warehouse_id: m.warehouse_id || '',
      warehouse_name: m.warehouse_name || '',
      location_id: m.location_id || '',
      location_name: m.location_name || '',
      bom_qty: m.bom_qty || m.rec_qy || 1,
      rec_qy: m.bom_qty || m.rec_qy || 1,
      stock_qty: m.stock_qty || 0
    }))
    allMaterials.push(...mats)
  }

  // 3) BOM 자재 중복 제거
  const matKeys = new Set(bomMaterials.value.map(m => `${m.inspect_id}_${m.code}`))
  const filteredMaterials = allMaterials.filter(m => !matKeys.has(`${m.inspect_id}_${m.code}`))

  // 4) ★ 여기에서 선언/사용합니다: 부모(완제품) 창고/로케이션 상속
  const parentByInspect = Object.fromEntries(uniqueDirect.map(p => [p.inspect_id, p]))
  const filteredMaterialsWithWH = filteredMaterials.map(m => ({
    ...m,
    warehouse_id:   m.warehouse_id   || (parentByInspect[m.inspect_id] && parentByInspect[m.inspect_id].warehouse_id)   || '',
    warehouse_name: m.warehouse_name || (parentByInspect[m.inspect_id] && parentByInspect[m.inspect_id].warehouse_name) || '',
    location_id:    m.location_id    || (parentByInspect[m.inspect_id] && parentByInspect[m.inspect_id].location_id)    || '',
    location_name:  m.location_name  || (parentByInspect[m.inspect_id] && parentByInspect[m.inspect_id].location_name)  || '',
  }))

  // 5) BOM 자재 반영
  bomMaterials.value.push(...filteredMaterialsWithWH)

  // 6) 가용수량 갱신 + 창고/로케이션 기본값 주입
  await nextTick()
  for (const r of uniqueDirect) await refreshAvailableForTopRow(r)

  // 상단(완제품) + 방금 추가한 BOM 자재에 대해 창고/로케이션 일괄 주입
  await updateWarehouseLocationInfo([...uniqueDirect, ...filteredMaterialsWithWH])

  alert(`${uniqueDirect.length}건의 생산지시가 추가되었습니다.`)
} else {
    // 완제품 납품 등 일반 출고
    const addRows = deliveryList.map((d, index) => ({
      id: `${d.insp_no}_DELIVERY_${d.opt_code || 'NO_OPT'}_${Date.now()}_${index}_${Math.random()
        .toString(36)
        .slice(2)}`,
      inspect_id: d.insp_no,
      type: normalizeItemType(d.insp_type),
      code: d.item_code || d.rsc_id,
      name: d.item_name || d.rsc_nm,
      opt_code: d.opt_code || '',
      opt_name: d.opt_name || '',
      spec: d.item_spec || d.rsc_spec || '',
      unit: d.item_unit || d.rsc_unit || 'EA',
      qty: toUnits(d.remaining_qty ?? d.pass_qty ?? d.insp_qty ?? 0),
      emp_nm: ownerName.value,
      remark: '출고 처리',
      warehouse_id: '',
      warehouse_name: '',
      location_id: '',
      location_name: '',
      deli_deta_id:
        d.insp_type === 'deliveryDetail' ? d.insp_no : d.deli_deta_id || d.deli_id || null,
    }))
    const existKeys = new Set(
      summaryRows.value.map((r) => `${r.inspect_id}_${r.code}_${r.opt_code || 'NO_OPT'}`),
    )
    const unique = addRows.filter(
      (r) => !existKeys.has(`${r.inspect_id}_${r.code}_${r.opt_code || 'NO_OPT'}`),
    )
    summaryRows.value.push(...unique)
    await updateWarehouseLocationInfo(unique)
    selectedSummaryIds.value.push(...unique.map((r, i) => getSelectKey(r, i)))

    await nextTick();

    // 1) 이 선택이 '자재 불출'인지 여부를 먼저 결정
    const isMaterialWithdrawal = (deliveryList?.[0]?.insp_type === 'materialWithdrawal');

    // 2) 각 상단행에 context를 세팅 (가용수량 분기에 필요)
    uniqueDirect.forEach(r => {
      r.context = isMaterialWithdrawal ? 'materialWithdrawal' : 'delivery';
    });
    await afterAddTopRows();

    // 3) 사용자 안내
    alert(`${uniqueDirect.length}건의 출고서 품목이 추가되었습니다.`);
  }
}

/* =========================
   BOM 수량 동기 (상단 수량 변경 시)
========================= */
function updateBomMaterialQuantities(productionOrderRow) {
  const prodId = productionOrderRow.inspect_id
  const units = toUnits(productionOrderRow.qty || 0)
  if (!Array.isArray(bomMaterials.value)) return
  bomMaterials.value.forEach((m) => {
    if (m.inspect_id === prodId) {
      const unitBom = m.bom_qty || m.rec_qy || 1
      m.qty = toUnits(unitBom * units)
    }
  })
}

/* =========================
   창고, 로케이션 출력
========================= */

// 화면표기 ↔ 코드 매핑
function typeToCode(t) {
  if (!t) return ''
  if (t === 'E1' || t === 'E2' || t === 'E3') return t
  if (t === '자재') return 'E1'
  if (t === '반제품') return 'E2'
  if (t === '완제품') return 'E3'
  return ''
}

// 캐시만으로도 기본 창고/로케이션을 세팅하는 안전장치
function resolveDefaultWHLocFromCaches(row) {
  try {
    const code = typeToCode(row.type)
    if (!code) return
    const w =
      (warehouseList.value || []).find((x) => x.item_type === code) ||
      (warehouseList.value || [])[0]
    if (w) {
      row.warehouse_id = w.warehouse_id
      row.warehouse_name = w.warehouse_name
      const locs = (locationList.value || []).filter((l) => l.warehouse_id === w.warehouse_id)
      if (locs.length) {
        row.location_id = locs[0].location_id
        row.location_name = locs[0].location_name
      }
    }
  } catch (e) {
    console.warn('[wrh] fallback 실패:', e)
  }
}

// 전체 목록 선로드
async function loadAllWarehouses() {
  const { data } = await axios.get('/api/warehouses/all')
  warehouseList.value = Array.isArray(data) ? data : []
  console.log('[wrh] warehouses cached:', warehouseList.value.length)
}
async function loadAllLocations() {
  const { data } = await axios.get('/api/locations/all')
  locationList.value = Array.isArray(data) ? data : []
  console.log('[wrh] locations cached:', locationList.value.length)
}

// 품목유형별 목록 (백엔드 필터)
async function getWarehousesByItemType(itemType) {
  const code = typeToCode(itemType)
  const { data } = await axios.get('/api/warehouses/all', { params: { item_type: code } })
  return Array.isArray(data) ? data : []
}
async function getLocationsByItemType(itemType, warehouseId) {
  const code = typeToCode(itemType)
  const params = { item_type: code }
  if (warehouseId) params.warehouse_id = warehouseId
  const { data } = await axios.get('/api/locations/all', { params })
  return Array.isArray(data) ? data : []
}

// 페이지 진입 시 전체 목록 먼저 로드
onMounted(async () => {
  await Promise.all([loadAllWarehouses(), loadAllLocations()])
})

/* =========================
   저장
========================= */
async function saveMaterialIssue(topRow) {
  try {
    const payload = {
      prod_drct_deta_id: topRow.prod_drct_deta_id || topRow.inspect_id,
      prdt_id: topRow.code,
      prdt_opt_id: topRow.opt_code || null,
      target_units: toUnits(topRow.qty),
      emp_id: ownerEmpId.value,
      warehouse_id: topRow.warehouse_id || null,
      location_id: topRow.location_id || null,
    }
    await axios.post('/api/warehouse/material-issue', payload)
    alert('자재 불출이 저장되었습니다.')
  } catch (e) {
    if (e?.response?.status === 409) {
      const { max_units, lacks } = e.response.data || {}
      alert(
        `재고 부족으로 저장 실패\n최대 생산 가능: ${max_units}개\n부족 자재: ${(lacks || [])
          .map((l) => l.rsc_id)
          .join(', ')}`,
      )
    } else {
      alert('저장 실패')
    }
  }
}

async function onSave() {
  // 선택 없으면 종료
  if (!selectedSummaryIds.value.length) {
    alert('저장할 항목을 선택해주세요.')
    return
  }

  // 선택된 행만
  const selectedRows = summaryRows.value.filter((r, i) =>
    selectedSummaryIds.value.includes(getSelectKey(r, i)),
  )
  if (!selectedRows.length) {
    alert('디테일 테이블에 저장할 데이터가 없습니다.')
    return
  }

  // 자재 불출(생산지시) 먼저 처리 → 초과 방지 트랜잭션
  const matIssueRows = selectedRows.filter((r) => isMaterialIssueRow(r))
  for (const r of matIssueRows) await saveMaterialIssue(r)

  // 그 외(입고/완제품 납품 등)는 기존 집계 저장 API 유지 (프로젝트 기존 엔드포인트에 맞춰 조정)
  const normalRows = selectedRows.filter((r) => !isMaterialIssueRow(r))
  if (normalRows.length) {
    // 기존 grouped 구조 예시
    const grouped = {}
    for (const row of normalRows) {
      const itemTypeCode = row.type === '자재' ? 'E1' : row.type === '반제품' ? 'E2' : 'E3'
      const key = `${row.code}|${row.opt_code || 'NO_OPT'}|${row.warehouse_id}|${
        row.location_id || ''
      }`
      if (!grouped[key]) {
        const masterObj = {
          item_type: itemTypeCode,
          warehouse_id: row.warehouse_id,
          zone_id: row.location_id,
          qty: toUnits(row.qty),
          rcvpay_ty: mode.value === 'in' ? 'S1' : 'S2',
          rcvpay_nm: `${mode.value === 'in' ? '입고' : '출고'} 처리 - ${row.name}`,
          emp_id: ownerEmpId.value,
          emp_name: ownerName.value,
          rcvpay_dt: todayLocalYMD(),
          remark: row.master_remark || '',
          lot_no: row.lot || '',
          prdt_id: row.code,
          prdt_opt_id: row.opt_code || '',
          item_name: row.name,
          item_spec: row.spec || '',
          item_unit: row.unit || 'EA',
        }
        if (itemTypeCode === 'E1') {
          masterObj.rsc_id = row.code
          delete masterObj.prdt_id
        }
        grouped[key] = { master: masterObj, details: [] }
      }
      const detailObj = {
        item_type: itemTypeCode,
        warehouse_id: row.warehouse_id,
        zone_id: row.location_id,
        qty: toUnits(row.qty),
        emp_id: ownerEmpId.value,
        emp_name: ownerName.value,
        rcvpay_dt: todayLocalYMD(),
        remark: row.remark || '',
        lot_no: row.lot_no || row.lot || '',
        prdt_id: row.code,
        prdt_opt_id: row.opt_code || '',
        item_name: row.name,
        item_spec: row.spec || '',
        item_unit: row.unit || 'EA',
      }
      if (mode.value === 'in') {
        if (row.type === '자재') detailObj.rsc_qlty_insp_id = row.rsc_qlty_insp_id || row.inspect_id
        else if (row.type === '반제품')
          detailObj.semi_prdt_qlty_insp_id = row.semi_prdt_qlty_insp_id || row.inspect_id
        else if (row.type === '완제품')
          detailObj.end_prdt_qlty_insp_id = row.end_prdt_qlty_insp_id || row.inspect_id
      } else if (mode.value === 'out') {
        if (
          row.type === '완제품' &&
          (String(row.inspect_id).startsWith('DL') || String(row.inspect_id).startsWith('DD'))
        )
          detailObj.deli_deta_id = row.deli_deta_id || row.inspect_id || null
      }
      grouped[key].details.push(detailObj)
    }

    const payload = { transactionList: Object.values(grouped), emp_id: ownerEmpId.value }
    try {
      const { data } = await axios.post('/api/warehouse/transactions', payload)
      if (data?.success) {
        alert('신규 입고/출고가 완료되었습니다.')
        onReset()
      } else alert('신규 저장 실패: ' + (data?.error || '알 수 없는 오류'))
    } catch (e) {
      alert('저장 실패: ' + (e?.response?.data?.error || e.message))
    }
  }
}

/* =========================
   삭제 (선택 행)
========================= */
function getDetailPk(row) {
  return (
    row.WRHOUS_WRHSDLVR_ID || row.wrhous_wrhsdlvr_id || row.wrhsdlvr_id || row.detail_id || null
  )
}
async function onDeleteSelected() {
  if (!selectedSummaryIds.value.length) return
  const selectedRows = summaryRows.value.filter((r, i) =>
    selectedSummaryIds.value.includes(getSelectKey(r, i)),
  )

  const persistedDetailIds = selectedRows.map(getDetailPk).filter(Boolean)
  const localIds = selectedRows.filter((r) => !getDetailPk(r)).map((r, i) => getSelectKey(r, i))

  deleting.value = true
  try {
    if (persistedDetailIds.length) {
      // 프로젝트의 실제 삭제 엔드포인트에 맞게 수정해 사용
      await axios.post('/api/warehouse/transactions/delete-selected', {
        detail_ids: persistedDetailIds,
      })
    }
    // 화면상 제거
    summaryRows.value = summaryRows.value.filter(
      (r, i) => !selectedSummaryIds.value.includes(getSelectKey(r, i)),
    )
    selectedSummaryIds.value = []
    alert('삭제되었습니다.')
  } catch (e) {
    console.error('[onDeleteSelected] 삭제 실패', e)
    alert('삭제 실패: ' + (e?.response?.data?.error || e.message))
  } finally {
    deleting.value = false
  }
}

/* =========================
   마운트 & 변경 감시
========================= */
onMounted(async () => {
  // 초기 가용수량 동기(빈화면이면 영향 없음)
  for (const r of summaryRows.value) await refreshAvailableForTopRow(r)
})
watch(summaryRows, async (nv, ov) => {
  for (const r of nv) {
    if (r && (r.available_qty === undefined || r._init_qty === undefined)) {
      await refreshAvailableForTopRow(r)
      if (r._init_qty === undefined) r._init_qty = r.qty ?? r.available_qty ?? 0
    }
  }
})
</script>

<style scoped>
/* 필요 시 추가 스타일 */
</style>
