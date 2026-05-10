import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const incomingId = req.header('x-request-id');
  const requestId = incomingId && incomingId.length > 0 ? incomingId : randomUUID();

  (req as { requestId?: string }).requestId = requestId;
  res.setHeader('x-request-id', requestId);

  next();
}
