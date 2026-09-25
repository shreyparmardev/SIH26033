import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    let url = process.env.DATABASE_URL;
    if (url && url.includes('-pooler.') && !url.includes('pgbouncer=true')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}pgbouncer=true`;
    }

    super({
      datasources: url ? { db: { url } } : undefined,
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    // Intercept Prisma log events to gracefully handle serverless pool timeouts without stderr crashes
    (this as any).$on('error', async (e: any) => {
      const msg = typeof e === 'object' && e?.message ? e.message : String(e);
      if (msg.includes('Closed, cause: None') || msg.includes('kind: Closed')) {
        this.logger.warn('PostgreSQL serverless socket recycled; re-establishing connection pool...');
        try {
          await this.$connect();
        } catch {
          // Reconnection will automatically complete on next query
        }
      } else {
        this.logger.error(`Prisma error: ${msg}`);
      }
    });

    try {
      await this.$connect();
      this.logger.log('Database connection successfully established');
    } catch (err: any) {
      this.logger.error(`Initial database connection error: ${err.message}`);
    }

    // Keep database compute warm every 2.5 minutes (prevents Neon serverless 5-minute inactivity idle scale-down)
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.$queryRawUnsafe('SELECT 1');
      } catch (pingErr: any) {
        this.logger.debug(`Heartbeat ping reconnecting: ${pingErr.message}`);
        try {
          await this.$connect();
        } catch {
          // Handled gracefully on demand
        }
      }
    }, 150000);
  }

  async onModuleDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    await this.$disconnect();
  }
}
