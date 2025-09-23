"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    var _a, _b, _c;
    return ({
        nodeEnv: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development',
        port: parseInt((_b = process.env.PORT) !== null && _b !== void 0 ? _b : '3000', 10),
        database: {
            url: (_c = process.env.DATABASE_URL) !== null && _c !== void 0 ? _c : 'postgres://postgres:postgres@localhost:5432/maintenance',
        },
    });
};
