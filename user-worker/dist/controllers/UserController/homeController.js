"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserHome = void 0;
const getUserHome = (res) => {
    res.json({ "Message": "Welcome to the Home Page! message from back end" });
};
exports.getUserHome = getUserHome;
