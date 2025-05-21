import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header
      ignoreExpiration: false, // Ensure the token hasn't expired
      secretOrKey: 'adminSideTokenSecretKey', // Use a secure key in real applications
    });
  }

  // Validate the payload from the token
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username }; // Example payload
  }
}
