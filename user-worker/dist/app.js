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
const app = (0, express_1.default)();
// Load .env variables
dotenv_1.default.config();
// Connect to MongoDB
(0, dbConfig_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // frontend URL
    credentials: true,
}));
app.use(express_1.default.json()); // Parse JSON data
app.use(express_1.default.urlencoded({ extended: true })); // Parse form data
app.use(express_1.default.json()); // to parse JSON data
app.use((0, cookie_parser_1.default)()); // Middleware to parse cookies
// app.post('/user/profileUpdate/:userId', (req, res) => {
//   console.log('Request Body:', req.body); // Log the entire body
// });
// API Routes
app.use('/api/user', userRouter_1.default); // User-related routes
app.use('/api/worker', workerRouter_1.default); // Worker-related routes
app.get('/', (_, res) => {
    res.send('Hello World');
});
const PORT = process.env.PORT;
// Server Listening
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
