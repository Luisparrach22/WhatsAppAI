"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const error_handler_js_1 = require("./error-handler.js");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
                next(new error_handler_js_1.AppError(`Validation error: ${errorMessages.join(', ')}`, 400));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
