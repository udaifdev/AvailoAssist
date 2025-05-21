"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// // Protect middleware for workers
// const workerProtect = async (req: Request, res: Response, next: NextFunction) => {
//   let token: string | undefined;
//   token = req.cookies.jwt;
//   if (!token) {
//     res.status(401).json({ error: "Not authorized, No token" });
//     return;
//   }
//   try {
//     // Verify token and decode payload
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
//     // Attach worker information to the request object, excluding the password field
//     req.worker = await WorkerModel.findById(decoded.workerId).select('-password');
//     if (!req.worker) {
//       res.status(401).json({ error: "Not authorized, Worker not found" });
//       return;
//     }
//     next(); // Proceed to the next middleware
//   } catch (error) {
//     console.error("Token verification failed:", error);
//     res.status(401).json({ error: "Not authorized, Invalid token" });
//   }
// };
// export { workerProtect };
