const express = require('express');
const router = express.Router();
const rscService = require('../services/rscManage_service.js');

// 자재 목록 조회
router.get('/rsc_list_view', async (req, res) => {
  try {
    let rscList = await rscService.rscListView(req.query);
    res.json(rscList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '조회 중 오류가 발생했습니다.' });
  }
});

// 자재 등록
router.post('/rscInsert', async (req, res) => {
  try {
    let result = await rscService.rscInsert(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      isSuccessed: false, 
      message: '등록 중 오류가 발생했습니다.' 
    });
  }
});

// 자재 수정
router.post('/rscUpdate', async (req, res) => {
  try {
    let result = await rscService.rscUpdate(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      isSuccessed: false, 
      message: '수정 중 오류가 발생했습니다.' 
    });
  }
});

// 자재 삭제
router.post('/rscDelete', async (req, res) => {
  try {
    let result = await rscService.rscDelete(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      isSuccessed: false, 
      message: '삭제 중 오류가 발생했습니다.' 
    });
  }
});

module.exports = router;
```

---

## 📁 최종 파일 구조 정리
```
sqls/
  ├── coManage.js          ✅ 업체관리 (이미 있음)
  ├── prdtManage.js        🆕 제품관리 (새로 생성)
  ├── qltManage.js         🆕 품질관리 (새로 생성)
  └── rscManage.js         🆕 자재관리 (새로 생성) - mtrl이 아닌 rsc!

services/
  ├── coManage_service.js  ✅ 업체관리 (이미 있음)
  ├── prdtManage_service.js 🆕 제품관리 (새로 생성)
  ├── qltManage_service.js  🆕 품질관리 (새로 생성)
  └── rscManage_service.js  🆕 자재관리 (새로 생성) - mtrl이 아닌 rsc!

routes/
  ├── coManage_router.js   ✅ 업체관리 (이미 있음)
  ├── prdtManage_router.js 🆕 제품관리 (새로 생성)
  ├── qltManage_router.js  🆕 품질관리 (새로 생성)
  └── rscManage_router.js  🆕 자재관리 (새로 생성) - mtrl이 아닌 rsc!