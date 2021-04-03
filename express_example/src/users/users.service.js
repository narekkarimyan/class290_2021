const { NotFound, Locked } = require('http-errors');
const User = require('./user.entity');
const Post = require('../posts/post.entity');
const mongoose = require('mongoose');

class UserService {
    create(payload) {
        const user = new User(payload);
        return user.save();
    }

    findAll(query) {
        const { offset, limit, sort, asc } = query;

        const sortObj = {};
        sortObj[sort] = asc === 'true' ? 'asc' : 'desc';

        return User.find({}, { password: false })
            .skip(+offset)
            .limit(+limit)
            .sort(sortObj)
            .exec();
    }

    async findOne(id) {
        const user = await User.findById(id).exec();
        if (!user) {
            throw new NotFound(`User with id ${id} not found.`);
        }
        return user;
    }

    async delete(id) {
        // Remember to install Replica mode of mongodb in your system to enable
        // transactions. https://docs.mongodb.com/manual/tutorial/deploy-replica-set/

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await this.findOne(id);
            await Post.deleteMany({ creator: user._id }, {
                session
            });
            const removedUser = await user.remove({
                session
            });
            await session.commitTransaction();
            return removedUser;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    async update(id, payload) {
        let user = await this.findOne(id);

        user = Object.assign(user, payload);

        return user.save();
    }

    async isLocked(username) {
        const user = await User.findOne({username});
        return user?.isLocked;
    }

    async addAttempt(username) {
        const user = await User.findOne({username});
        user.attempts += 1;
        if (user.attempts >= 3) {
            user.isLocked = true
            await user.save();
            throw new Locked("The user is locked!");
        } else {
            await user.save();
        }
    }

    resetAttempts(user) {
        user.attempts = 0;
        return user.save();
    }
}

module.exports = new UserService();