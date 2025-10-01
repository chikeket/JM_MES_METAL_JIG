<template>
  <div class="container-xxl py-3">
    <!-- 상단 툴바 -->
    <div class="d-flex justify-content-end gap-2 mb-3">
      <button type="button" class="btn btn-outline-secondary">신규</button>
      <button type="button" class="btn btn-outline-secondary">수주 조회</button>
      <button type="button" class="btn btn-primary">저장</button>
      <button type="button" class="btn btn-outline-danger">삭제</button>
    </div>

    <!-- 기본 정보 카드 -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-3">
            <label class="form-label">수주 ID</label>
            <input type="text" class="form-control" placeholder="READ ONLY" readonly />
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">납품업체 명</label>
            <input type="text" class="form-control" />
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">수주 담당자</label>
            <input type="text" class="form-control" />
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">수주 상태</label>
            <input type="text" class="form-control" placeholder="READ ONLY" readonly />
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">수주 등록 일자</label>
            <input type="date" class="form-control" />
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">납품 예정 일자</label>
            <input type="date" class="form-control" />
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">총 요청 수량</label>
            <input type="text" class="form-control" placeholder="READ ONLY" readonly />
          </div>
          <div class="col-12">
            <label class="form-label">비고</label>
            <textarea class="form-control form-note" placeholder=""></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 상세(제품) 그리드 -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0 fw-semibold">제품 목록</h6>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm">초기화</button>
        <button type="button" class="btn btn-outline-primary btn-sm">제품 추가</button>
        <button type="button" class="btn btn-outline-danger btn-sm">선택 제품 삭제</button>
      </div>
    </div>
    <div class="table-responsive table-container">
      <table class="table table-sm align-middle mb-0 table-sticky">
        <thead class="table-light">
          <tr>
            <th style="width: 44px" class="text-center">
              <input class="form-check-input" type="checkbox" aria-label="select all" />
            </th>
            <th style="width: 64px" class="text-center">No</th>
            <th style="min-width: 160px">제품 명</th>
            <th style="min-width: 180px">제품 옵션 명</th>
            <th style="min-width: 120px" class="text-end">요청 수량</th>
            <th style="min-width: 100px">규격</th>
            <th style="min-width: 90px">단위</th>
            <th style="min-width: 130px">생산 가능 여부</th>
            <th style="min-width: 200px">비고</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center"><input class="form-check-input" type="checkbox" /></td>
            <td class="text-center">
              <input
                type="text"
                class="form-control form-control-sm text-center"
                value="1"
                readonly
              />
            </td>
            <td><input type="text" class="form-control form-control-sm" /></td>
            <td><input type="text" class="form-control form-control-sm" /></td>
            <td><input type="number" class="form-control form-control-sm text-end" /></td>
            <td><input type="text" class="form-control form-control-sm" /></td>
            <td>
              <select class="form-select form-select-sm">
                <option></option>
                <option>EA</option>
                <option>BOX</option>
                <option>SET</option>
              </select>
            </td>
            <td>
              <select class="form-select form-select-sm">
                <option></option>
                <option>Y</option>
                <option>N</option>
              </select>
            </td>
            <td><input type="text" class="form-control form-control-sm" /></td>
          </tr>
          <!-- 필요시 행 추가 -->
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-sticky thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
}
.table-container {
  max-height: 420px;
  overflow: auto;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-top: none;
}
.form-note {
  min-height: 110px;
}
</style>
