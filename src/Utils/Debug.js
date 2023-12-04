"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warning = exports.info = exports.error = void 0;
function error(msg) {
    console.log(`%c[ERROR] %c${msg}`, `font-weight: bold; color: red`, `color: red`);
}
exports.error = error;
function info(msg) {
    console.log(`%c[INFO] %c${msg}`, `font-weight: bold; color: white`, `color: grey`);
}
exports.info = info;
function warning(msg) {
    console.log(`%c[WARN] %c${msg}`, `font-weight: bold; color: orange`, `color: orange`);
}
exports.warning = warning;
