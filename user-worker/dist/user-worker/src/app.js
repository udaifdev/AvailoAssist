"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbConfig_1 = __importDefault(require("./models/dbConfig"));
const userRouter_1 = __importDefault(require("./routes/UserRoutes/userRouter"));
const workerRouter_1 = __importDefault(require("./routes/WorkerRoutes/workerRouter"));
const uploadsRoutes_1 = __importDefault(require("../src/routes/Uploads/uploadsRoutes"));
const app = (0, express_1.default)();
dotenv_1.default.config();
(0, dbConfig_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/user', userRouter_1.default);
app.use('/api/worker', workerRouter_1.default);
app.use('/api', uploadsRoutes_1.default);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
