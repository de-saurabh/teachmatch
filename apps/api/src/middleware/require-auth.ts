import type { AccountType, Permission } from "@teachmatch/shared";
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";

import { auth } from "../config/auth";
import { db } from "../config/db";

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}

export async function getOptionalSession(req: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await getOptionalSession(req);

  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  req.session = session;
  next();
}

export function requireAccountType(...accountTypes: AccountType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!accountTypes.includes(req.session!.user.accountType as AccountType)) {
      res.status(403).json({ error: "Not permitted for this account type" });
      return;
    }
    next();
  };
}

export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const grant = await db.adminPermission.findUnique({
      where: { userId_permission: { userId: req.session!.user.id, permission } },
    });

    if (!grant) {
      res.status(403).json({ error: "Not permitted" });
      return;
    }

    next();
  };
}
