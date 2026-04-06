import { ExecutionContext } from '@nestjs/common';

export interface IPolicyHandler {
  handle(context: ExecutionContext): Promise<boolean> | boolean;
}
