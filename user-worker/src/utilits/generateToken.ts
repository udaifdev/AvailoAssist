import jwt from 'jsonwebtoken';
import { Response } from 'express';

function generateToken(res: Response, userId: string, role: string, cookieName: string): string {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
        expiresIn: '30d', 
    });

    res.cookie(cookieName, token, {
        httpOnly: true, // Secure cookie
        secure: process.env.NODE_ENV !== 'development', 
        sameSite: 'strict', // Protect against CSRF
        maxAge: 30 * 24 * 60 * 60 * 1000,  
    });

    return token;
}

export default generateToken;










// import jwt from 'jsonwebtoken';
// import { Response } from 'express';

// function generateToken(res: Response, userId: string, role: string): string {
//     // Include the role in the payload of the token
//     const token = jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
//         expiresIn: '30d', // Token expiration
//     });

//     res.cookie('jwt', token, {
//         httpOnly: true, // Secure cookie
//         secure: process.env.NODE_ENV !== 'development', // Use secure cookies outside development
//         sameSite: 'strict', // Protect against CSRF
//         maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//     });

//     return token; 
//  }

// export default generateToken;
