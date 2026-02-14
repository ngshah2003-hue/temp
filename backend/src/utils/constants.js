const UserTypes = (function () {
    function UserTypes() {}
    UserTypes.Admin = 1;
    UserTypes.Customer = 2;
    UserTypes.Driver = 3;
    return UserTypes;
})();

const InterfaceTypes = (function () {
    function InterfaceType() {}
    InterfaceType.Admin = { AdminWeb: "i1" };
    InterfaceType.Customer = { CustomerApp: "i2" };
    InterfaceType.Driver = { DriverApp: "i3" };
    return InterfaceType;
})();

const AuthTypes = (function () {
    function types() {}
    types.Admin = 1;
    types.Customer = 2;
    types.Driver = 3;
    return types;
})();

const ValidationMsgs = (function () {
    function ValidationMsgs() {}
    ValidationMsgs.UserNotFound = "User Not Found";
    ValidationMsgs.AuthFail = "Authentication failed. Please log in.";
    ValidationMsgs.EmailEmpty = "Email is required!";
    ValidationMsgs.PasswordEmpty = "Password cannot be blank.";
    ValidationMsgs.UnableToLogin = "Incorrect email and/or password.";
    ValidationMsgs.EmailInvalid = "Provided email address is invalid.";
    ValidationMsgs.PasswordInvalid = "Password is invalid.";
    ValidationMsgs.DuplicateEmail = "This email address is already in use.";
    return ValidationMsgs;
})();

const TableNames = (function () {
    function TableNames() {}
    TableNames.Admin = "admins";
    TableNames.User = "users";
    return TableNames;
})();

const TableFields = (function () {
    function TableFields() {}
    TableFields.ID = "_id";
    TableFields.name_ = "name";
    TableFields.email = "email";
    TableFields.password = "password";
    TableFields.tokens = "tokens";
    TableFields.token = "token";
    TableFields.approved = "approved";
    TableFields.active = "active";
    TableFields.userType = "userType";
    TableFields.interface = "interface";
    TableFields.authType = "authType";
    return TableFields;
})();

const ResponseStatus = (function () {
    function ResponseStatus() {}
    ResponseStatus.Success = 200;
    ResponseStatus.BadRequest = 400;
    ResponseStatus.Unauthorized = 401;
    ResponseStatus.NotFound = 404;
    ResponseStatus.InternalServerError = 500;
    return ResponseStatus;
})();

module.exports = {
    UserTypes,
    InterfaceTypes,
    AuthTypes,
    ValidationMsgs,
    TableNames,
    TableFields,
    ResponseStatus,
};
