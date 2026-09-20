import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { toPublicUser, verifyToken } from "../lib/auth";
import type { PublicUser } from "../lib/auth";

export type AuthedRequest = Request & {
  user?: PublicUser;
};

function readToken(req: Request) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return "";
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) {
    res.status(401).json({ error: "يلزم تسجيل الدخول." });
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({ error: "الحساب غير موجود." });
      return;
    }
    req.user = toPublicUser(user);
    next();
  } catch {
    res.status(401).json({ error: "جلسة غير صالحة. سجّل الدخول مرة أخرى." });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "يلزم تسجيل الدخول." });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ error: "هذه الصفحة مخصصة لإدارة العيادة فقط." });
    return;
  }

  next();
}
