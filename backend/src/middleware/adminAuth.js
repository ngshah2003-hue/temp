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
const AdminService = require("../db/services/AdminService");

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(ResponseStatus.Unauthorized).send(
                Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
            );
        }
        const headerToken = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(headerToken, process.env.JWT_ADMIN_PK);
        const admin = await AdminService.getUserByIdAndToken(decoded[TableFields.ID], headerToken)
            .withBasicInfo()
            .withApproved()
            .execute();

        if (!admin) throw new ValidationError(ValidationMsgs.UserNotFound);
        if (admin[TableFields.approved] !== true) {
            return res.status(ResponseStatus.Unauthorized).send(
                Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
            );
        }

        req.user = admin;
        req.user[TableFields.userType] = UserTypes.Admin;
        req.user[TableFields.authType] = AuthTypes.Admin;
        req[TableFields.interface] = decoded[TableFields.interface] || InterfaceTypes.Admin.AdminWeb;
        next();
    } catch (e) {
        if (!(e instanceof ValidationError)) console.error(e);
        res.status(ResponseStatus.Unauthorized).send(
            Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
        );
    }
};

module.exports = auth;
