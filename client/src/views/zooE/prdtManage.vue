<template> 
        <!-- 상단 버튼 -->
        <div class="d-flex justify-content-end mb-2 gap-2 flex-wrap" style="flex-shrink: 0;">
          <CButton color="secondary" size="sm" @click="onSearch">조회</CButton>
          <CButton color="secondary" size="sm" @click="onReset">초기화</CButton>
        </div>

</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const filters = reactive({ productName:'', optionName:'', status:'' })

const form = reactive({
  productCode:'', productName:'', unit:'', standard:'',
  optionCode:'', optionName:'', optionDesc:'', status:'active'
})

const fieldLabels = {
  productCode: '제품코드',
  productName: '제품명',
  unit: '단위',
  standard: '기준규격',
  optionCode: '옵션코드',
  optionName: '옵션명',
  optionDesc: '옵션설명',
  status: '상태'
}

const fieldOrder = ['productCode','productName','unit','standard','optionCode','optionName','optionDesc','status']

const selectedRow = ref(null)

const gridData = ref([
  { productCode:'P001', productName:'제품A', unit:'EA', standard:'100x100', optionCode:'O001', optionName:'옵션1', optionDesc:'설명1', status:'active' },
  { productCode:'P002', productName:'제품B', unit:'EA', standard:'200x200', optionCode:'O002', optionName:'옵션2', optionDesc:'설명2', status:'inactive' },
])

const filteredData = computed(() =>
  gridData.value.filter(item =>
    (!filters.productName || item.productName.includes(filters.productName)) &&
    (!filters.optionName || item.optionName.includes(filters.optionName)) &&
    (!filters.status || item.status === filters.status)
  )
)

const displayData = computed(() => filteredData.value.slice(0, 10))
const emptyRows = computed(() => Math.max(0, 10 - displayData.value.length))

const onSearch = () => { selectedRow.value = null }
const onReset = () => { filters.productName=''; filters.optionName=''; filters.status=''; selectedRow.value=null }
const onSelect = (item) => { Object.assign(form, item); selectedRow.value = displayData.value.indexOf(item) }
const onFormReset = () => {
  Object.assign(form, { productCode:'', productName:'', unit:'', standard:'', optionCode:'', optionName:'', optionDesc:'', status:'active' })
  selectedRow.value=null
}
const onNew = () => { onFormReset() }
const onSave = () => {
  const idx = gridData.value.findIndex(d=>d.productCode===form.productCode)
  if(idx>=0) gridData.value[idx] = {...form}
  else {
    form.productCode = 'P' + String(gridData.value.length + 1).padStart(3,'0')
    gridData.value.push({...form})
  }
  onFormReset()
}
const onDelete = () => {
  const idx = gridData.value.findIndex(d=>d.productCode===form.productCode)
  if(idx>=0) gridData.value.splice(idx, 1)
  onFormReset()
}
</script>