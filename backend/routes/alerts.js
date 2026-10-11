const express = require('express');
const { dispatch, getActive } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.get('/active', protect, authorize('admin', 'dispatch_operator'), getActive);
// POST /api/v1/alerts/:alert_id/dispatch
router.post('/:alert_id/dispatch', protect, authorize('admin', 'dispatch_operator', 'operator'), dispatch);

module.exports = router;
