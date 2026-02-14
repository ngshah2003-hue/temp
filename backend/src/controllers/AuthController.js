const AdminService = require("../db/services/AdminService");
const { TableFields, ValidationMsgs, InterfaceTypes } = require("../utils/constants");
const ValidationError = require("../utils/ValidationError");

exports.signup = async (req) => {
    const user = await AdminService.insertUserRecord(req.body);
    const token = user.createAuthToken(InterfaceTypes.Admin.AdminWeb);
    await AdminService.saveAuthToken(user[TableFields.ID], token);
    return { user, token };
};

exports.login = async (req) => {
    let email = req.body[TableFields.email];
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    email = `${email}`.trim().toLowerCase();

    const password = req.body[TableFields.password];
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

    const user = await AdminService.findByEmail(email)
        .withPassword()
        .withBasicInfo()
        .withUserType()
        .withApproved()
        .execute();

    if (!user || !(await user.isValidAuth(password)) || !user[TableFields.active]) {
        throw new ValidationError(ValidationMsgs.UnableToLogin);
    }

    const token = user.createAuthToken(InterfaceTypes.Admin.AdminWeb);
    await AdminService.saveAuthToken(user[TableFields.ID], token);

    return { user, token };
};

exports.logout = async (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    await AdminService.removeAuth(req.user[TableFields.ID], headerToken);
    return { message: "Logged out" };
};

exports.me = async (req) => {
    return { user: req.user };
};
