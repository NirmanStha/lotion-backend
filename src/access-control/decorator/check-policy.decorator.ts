import { SetMetadata } from '@nestjs/common';
import { IPolicyHandler } from '../interface/policy-handler.interface';

export const CHECK_POLICY_KEY = 'check_policy';
type PolicyHandlerConstructor = new (...args: any[]) => IPolicyHandler;

export const CheckPolicy = (...handlers: PolicyHandlerConstructor[]) => {
  return SetMetadata(CHECK_POLICY_KEY, handlers);
};
