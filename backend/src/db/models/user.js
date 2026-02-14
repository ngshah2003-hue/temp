const mongoose = require("mongoose");
const validator = require("validator");
const { ValidationMsgs, TableNames, TableFields, UserTypes } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        [TableFields.name_]: { type: String, trim: true },
        [TableFields.email]: {
            type: String,
            required: [true, ValidationMsgs.EmailEmpty],
            trim: true,
            unique: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) throw new ValidationError(ValidationMsgs.EmailInvalid);
            },
        },
        [TableFields.password]: {
            type: String,
            minlength: 8,
            trim: true,
            required: [true, ValidationMsgs.PasswordEmpty],
        },
        [TableFields.tokens]: [
            { [TableFields.ID]: false, [TableFields.token]: { type: String } },
        ],
        [TableFields.userType]: {
            type: Number,
            enum: Object.values(UserTypes),
            default: UserTypes.Customer,
        },
        [TableFields.active]: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                delete ret[TableFields.tokens];
                delete ret[TableFields.password];
                delete ret.__v;
            },
        },
    },
);

userSchema.methods.isValidAuth = async function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.isValidPassword = function (password) {
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regEx.test(password);
};

userSchema.methods.createAuthToken = function (interfaceType) {
    const payload = { [TableFields.ID]: this[TableFields.ID].toString() };
    if (interfaceType) payload[TableFields.interface] = interfaceType;
    return jwt.sign(payload, process.env.JWT_USER_PK);
};

userSchema.pre("save", async function (next) {
    if (this.isModified(TableFields.password)) {
        this[TableFields.password] = await bcrypt.hash(this[TableFields.password], 8);
    }
    next();
});

userSchema.index({ [TableFields.email]: 1 }, { unique: true });

const User = mongoose.model(TableNames.User, userSchema);
module.exports = User;
