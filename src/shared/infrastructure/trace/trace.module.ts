import { Global, Module } from '@nestjs/common';
import { TraceContextService } from './trace-context.service';

@Global()
@Module({
  providers: [TraceContextService],
  exports: [TraceContextService],
})
export class TraceModule {}
