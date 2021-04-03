const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const AdminService = require('./admin.service');

router.patch('/unlock-user/:id', asyncHandler(async (req, res) => {
    const {id} = req.params;
    await AdminService.unlockUser(req, id);
    res.json({"message": "User has successfully been unlocked!"})
}));

router.patch('/lock-user/:id', asyncHandler(async (req, res) => {
    const {id} = req.params;
    await AdminService.lockUser(req, id);
    res.json({"message": "User has successfully been locked!"})
}))

module.exports = router;
