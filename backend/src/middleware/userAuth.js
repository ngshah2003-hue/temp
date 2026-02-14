const jwt = require("jsonwebtoken");
const {
    TableFields,
    UserTypes,
    InterfaceTypes,
    AuthTypes,
    ValidationMsgs,
    ResponseStatus,
} = require("../utils/constants");
const Util = require("../utils/util");
const ValidationError = require("../utils/ValidationError");
const UserService = require("../db/services/UserService");

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(ResponseStatus.Unauthorized).send(
                Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
            );
        }
        const headerToken = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(headerToken, process.env.JWT_USER_PK);
        const user = await UserService.getUserByIdAndToken(decoded[TableFields.ID], headerToken)
            .withBasicInfo()
            .withUserType()
            .execute();

        if (!user) throw new ValidationError(ValidationMsgs.UserNotFound);
        if (!user[TableFields.active]) {
            return res.status(ResponseStatus.Unauthorized).send(
                Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
            );
        }

        req.user = user;
        req.user[TableFields.authType] =
            user[TableFields.userType] === UserTypes.Customer ? AuthTypes.Customer : AuthTypes.Driver;
        req[TableFields.interface] =
            decoded[TableFields.interface] ||
            (user[TableFields.userType] === UserTypes.Customer
                ? InterfaceTypes.Customer.CustomerApp
                : InterfaceTypes.Driver.DriverApp);
        next();
    } catch (e) {
        if (!(e instanceof ValidationError)) console.error(e);
        res.status(ResponseStatus.Unauthorized).send(
            Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
        );
    }
};

module.exports = auth;
