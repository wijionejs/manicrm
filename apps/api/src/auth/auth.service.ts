import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { type DrizzleDB, DRIZZLE } from '../db/db.module';
import * as schema from '../db/schema';

@Injectable()
export class AuthService {
  public readonly auth!: ReturnType<typeof betterAuth<any>>;

  constructor(@Inject(DRIZZLE) db: DrizzleDB, config: ConfigService) {
    this.auth = betterAuth({
      baseURL: config.getOrThrow<string>('BETTER_AUTH_URL'),
      secret: config.getOrThrow<string>('BETTER_AUTH_SECRET'),
      database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
          user: schema.user,
          session: schema.session,
          account: schema.account,
          verification: schema.verification,
        },
      }),
      socialProviders: {
        google: {
          clientId: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
          clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
        },
      },
      trustedOrigins: [config.get<string>('CORS_ORIGIN', 'http://localhost:5173')],
      plugins: [bearer()],
    });
  }
}
