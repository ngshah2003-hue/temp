const { TableFields, TableNames, UserTypes, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const User = require("../models/user");

class ProjectionBuilder {
    constructor(methodToExecute) {
        const projection = {};
        this.withBasicInfo = () => {
            projection[TableFields.name_] = 1;
            projection[TableFields.ID] = 1;
            projection[TableFields.email] = 1;
            projection[TableFields.userType] = 1;
            projection[TableFields.active] = 1;
            return this;
        };
        this.withPassword = () => {
            projection[TableFields.password] = 1;
            return this;
        };
        this.withUserType = () => {
            projection[TableFields.userType] = 1;
            return this;
        };
        this.execute = async () => methodToExecute.call(projection);
    }
}

class UserService {
    static findByEmail(email) {
        return new ProjectionBuilder(async function () {
            return User.findOne({ [TableFields.email]: email }, this);
        });
    }

    static getUserByIdAndToken(userId, token) {
        return new ProjectionBuilder(async function () {
            return User.findOne(
                {
                    [TableFields.ID]: userId,
                    [`${TableFields.tokens}.${TableFields.token}`]: token,
                },
                this,
            ).lean(false);
        });
    }

    static async saveAuthToken(userId, token) {
        await User.updateOne(
            { [TableFields.ID]: userId },
            { $push: { [TableFields.tokens]: { [TableFields.token]: token } } },
        );
    }

    static async removeAuth(userId, authToken) {
        await User.updateOne(
            { [TableFields.ID]: userId },
            { $pull: { [TableFields.tokens]: { [TableFields.token]: authToken } } },
        );
    }

    static async insertUserRecord(reqBody) {
        const email = `${reqBody[TableFields.email] || ""}`.trim().toLowerCase();
        const password = reqBody[TableFields.password];
        if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
        if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

        const exists = await User.exists({ [TableFields.email]: email });
        if (exists) throw new ValidationError(ValidationMsgs.DuplicateEmail);

        const userType = reqBody[TableFields.userType] || UserTypes.Customer;
        const user = new User({
            [TableFields.email]: email,
            [TableFields.password]: password,
            [TableFields.name_]: reqBody[TableFields.name_] || "",
            [TableFields.userType]: userType,
        });
        if (!user.isValidPassword(password)) throw new ValidationError(ValidationMsgs.PasswordInvalid);
        await user.save();
        return user;
    }
}

module.exports = UserService;
