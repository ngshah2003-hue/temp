const UserService = require("../db/services/UserService");
const { TableFields, ValidationMsgs, InterfaceTypes, UserTypes } = require("../utils/constants");
const ValidationError = require("../utils/ValidationError");

exports.signup = async (req) => {
    const user = await UserService.insertUserRecord(req.body);
    const interfaceType =
        user[TableFields.userType] === UserTypes.Customer
            ? InterfaceTypes.Customer.CustomerApp
            : InterfaceTypes.Driver.DriverApp;
    const token = user.createAuthToken(interfaceType);
    await UserService.saveAuthToken(user[TableFields.ID], token);
    return { user, token };
};

exports.login = async (req) => {
    let email = req.body[TableFields.email];
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    email = `${email}`.trim().toLowerCase();

    const password = req.body[TableFields.password];
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

    const user = await UserService.findByEmail(email)
        .withPassword()
        .withBasicInfo()
        .withUserType()
        .execute();

    if (!user || !(await user.isValidAuth(password)) || !user[TableFields.active]) {
        throw new ValidationError(ValidationMsgs.UnableToLogin);
    }

    const interfaceType =
        user[TableFields.userType] === UserTypes.Customer
            ? InterfaceTypes.Customer.CustomerApp
            : InterfaceTypes.Driver.DriverApp;
    const token = user.createAuthToken(interfaceType);
    await UserService.saveAuthToken(user[TableFields.ID], token);

    return { user, token };
};

exports.logout = async (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    await UserService.removeAuth(req.user[TableFields.ID], headerToken);
    return { message: "Logged out" };
};

exports.me = async (req) => {
    return { user: req.user };
};
