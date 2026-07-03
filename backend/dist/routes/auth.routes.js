"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const validation_js_1 = require("../middlewares/validation.js");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Format email incorrect'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
router.post('/login', (0, validation_js_1.validate)(loginSchema), auth_controller_js_1.AuthController.login);
exports.default = router;
