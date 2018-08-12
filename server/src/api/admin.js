"use strict";
const express = require("express");
const router = express.Router();
const auth = require("./../auth");
const admin = require("./../admin");
/**
 * POST /api/admin/sendpush
 * Send a push notification to a user
 */
router.post('/sendpush', auth.authenticate, admin.authenticate, async (req, res, next) => {
    try {
        await admin.sendPush(req.body.userId, req.body.data);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/admin/sql
 * Run an arbitrary SQL statement
 */
router.post('/sql', auth.authenticate, admin.authenticate, async (req, res, next) => {
    try {
        res.json({ result: await admin.runSQL(req.body.query) });
    }
    catch (error) {
        next(error);
    }
});
module.exports = router;
//# sourceMappingURL=admin.js.map