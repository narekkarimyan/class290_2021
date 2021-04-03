const {Forbidden} = require('http-errors');
const UTILS = require('../../commons/util');
const UserService = require('../../users/users.service');

class AdminService {
    async unlockUser(req, id) {
        if (req.user.role !== UTILS.ADMIN_ROLE) {
            throw Forbidden('Not authorized!');
        }
        const user = await UserService.findOne(id);
        user.isLocked = false;
        user.attempts = 0;
        await user.save();
    }

    async lockUser(req, id) {
        if (req.user.role !== UTILS.ADMIN_ROLE) {
            throw Forbidden('Not authorized!');
        }
        const user = await UserService.findOne(id);
        user.isLocked = true;
        await user.save();
    }
}

module.exports = new AdminService();
