import { SetMetadata } from '@nestjs/common';
import { IPolicyHandler } from '../interface/policy-handler.interface';

export const CHECK_POLICY_KEY = 'check_policy';

export const CheckPolicy = (policyHandlers: IPolicyHandler[]) => {
  return SetMetadata(CHECK_POLICY_KEY, policyHandlers);
};
