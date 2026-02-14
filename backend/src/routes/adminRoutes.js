const API = require("../utils/apiBuilder");
const AuthController = require("../controllers/AuthController");

const router = API.configRoute("/admin")
    .addPath("/signup")
    .asPOST(AuthController.signup)
    .build()

    .addPath("/login")
    .asPOST(AuthController.login)
    .build()

    .addPath("/logout")
    .asPOST(AuthController.logout)
    .useAdminAuth()
    .build()

    .addPath("/me")
    .asGET(AuthController.me)
    .useAdminAuth()
    .build()

    .getRouter();

module.exports = router;
