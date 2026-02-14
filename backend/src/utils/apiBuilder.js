const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const userAuth = require("../middleware/userAuth");
const Util = require("../utils/util");
const { ResponseStatus } = require("../utils/constants");
const ValidationError = require("../utils/ValidationError");

class API {
    static configRoute(root) {
        const router = new express.Router();
        return new PathBuilder(root, router);
    }
}

const MethodBuilder = class {
    constructor(root, subPath, router) {
        this.asGET = (methodToExecute) =>
            new Builder("get", root, subPath, methodToExecute, router);
        this.asPOST = (methodToExecute) =>
            new Builder("post", root, subPath, methodToExecute, router);
        this.asDELETE = (methodToExecute) =>
            new Builder("delete", root, subPath, methodToExecute, router);
        this.asUPDATE = (methodToExecute) =>
            new Builder("patch", root, subPath, methodToExecute, router);
    }
};

const PathBuilder = class {
    constructor(root, router) {
        this.addPath = (subPath) => new MethodBuilder(root, subPath, router);
        this.getRouter = () => router;
    }
};

const Builder = class {
    constructor(
        methodType,
        root,
        subPath,
        executer,
        router,
        middlewaresList = [],
        useAdminAuth = false,
        useUserAuth = false,
    ) {
        this.useAdminAuth = () =>
            new Builder(methodType, root, subPath, executer, router, middlewaresList, true, useUserAuth);

        this.useUserAuth = () =>
            new Builder(methodType, root, subPath, executer, router, middlewaresList, useAdminAuth, true);

        this.userMiddlewares = (...middlewares) =>
            new Builder(
                methodType,
                root,
                subPath,
                executer,
                router,
                [...middlewares],
                useAdminAuth,
                useUserAuth,
            );

        this.build = () => {
            const controller = async (req, res) => {
                try {
                    const response = await executer(req, res);
                    res.status(ResponseStatus.Success).send(response);
                } catch (e) {
                    if (e && e.name !== ValidationError.name) {
                        console.error(e);
                    }
                    res.locals.errorMessage = e;
                    const status =
                        e && e.name === ValidationError.name
                            ? ResponseStatus.BadRequest
                            : ResponseStatus.InternalServerError;
                    res.status(status).send(Util.getErrorMessage(e));
                }
            };

            const middlewares = [...middlewaresList];
            if (useAdminAuth) middlewares.push(adminAuth);
            if (useUserAuth) middlewares.push(userAuth);

            router[methodType](root + subPath, ...middlewares, controller);
            return new PathBuilder(root, router);
        };
    }
};

module.exports = API;
