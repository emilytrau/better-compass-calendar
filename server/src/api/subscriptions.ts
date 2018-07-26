import express = require('express');
const router = express.Router();
import auth = require('./../auth');
import subscriptions = require('./../subscriptions');
import activities = require('./../activities');

router.get('/', auth.authenticate, async (req, res, next) => {
    try {
        res.json({ subscriptions: await subscriptions.getSubscriptions(req.user) });
    } catch (error) {
        next(error);
    }
});

router.post('/subscribe', auth.authenticate, async (req, res, next) => {
    try {
        await subscriptions.subscribe(req.user, await activities.getActivity(req.body.activity));
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.post('/unsubscribe', auth.authenticate, async (req, res, next) => {
    try {
        await subscriptions.unsubscribe(req.user, await activities.getActivity(req.body.activity));
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export = router;