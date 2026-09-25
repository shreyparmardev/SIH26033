import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    let url = process.env.DATABASE_URL;
    if (url && url.includes('-pooler.') && !url.includes('pgbouncer=true')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}pgbouncer=true`;
    }

    super({
      datasources: url ? { db: { url } } : undefined,
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connection successfully established');
    } catch (err: any) {
      this.logger.error(`Initial database connection error: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
