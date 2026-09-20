import type { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import {
  EMAIL_PATTERN,
  PHONE_PATTERN,
  normalizeEmail,
  normalizeIdentifier,
  normalizePhone,
} from "./auth-utils";

export type PublicUser = {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
};

export type AuthTokenPayload = {
  userId: string;
  role: UserRole;
};

const JWT_EXPIRES_IN = "7d";

function jwtSecret() {
  return process.env.JWT_SECRET || "smile-clinic-jwt-secret-change-me";
}

export function toPublicUser(user: {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export function signToken(user: PublicUser) {
  return jwt.sign({ userId: user.id, role: user.role } satisfies AuthTokenPayload, jwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret()) as AuthTokenPayload;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function checkPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function validateRegisterInput(body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "بيانات الحساب غير صالحة." };
  }

  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  const phone = typeof input.phone === "string" ? normalizePhone(input.phone) : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false as const, error: "أدخل بريداً إلكترونياً صحيحاً." };
  }

  if (!PHONE_PATTERN.test(phone)) {
    return { ok: false as const, error: "أدخل رقم جوال سعودي بصيغة 05xxxxxxxx." };
  }

  if (password.length < 6) {
    return { ok: false as const, error: "كلمة المرور يجب ألا تقل عن 6 أحرف." };
  }

  return { ok: true as const, data: { email, phone, password } };
}

export function validateLoginInput(body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "بيانات الدخول غير صالحة." };
  }

  const input = body as Record<string, unknown>;
  const identifier =
    typeof input.identifier === "string"
      ? normalizeIdentifier(input.identifier)
      : typeof input.email === "string"
        ? normalizeEmail(input.email)
        : typeof input.phone === "string"
          ? normalizePhone(input.phone)
          : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!identifier) {
    return { ok: false as const, error: "أدخل البريد الإلكتروني أو رقم الجوال." };
  }

  if (identifier.includes("@")) {
    if (!EMAIL_PATTERN.test(identifier)) {
      return { ok: false as const, error: "أدخل بريداً إلكترونياً صحيحاً." };
    }
  } else if (!PHONE_PATTERN.test(identifier)) {
    return { ok: false as const, error: "أدخل رقم جوال سعودي بصيغة 05xxxxxxxx." };
  }

  if (!password) {
    return { ok: false as const, error: "أدخل كلمة المرور." };
  }

  return { ok: true as const, data: { identifier, password } };
}

export async function registerUser(email: string, phone: string, password: string) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (existing) {
    if (existing.email === email) {
      return { ok: false as const, error: "هذا البريد الإلكتروني مسجّل مسبقاً." };
    }
    return { ok: false as const, error: "رقم الجوال مسجّل مسبقاً." };
  }

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: "patient",
    },
  });

  const publicUser = toPublicUser(user);
  return { ok: true as const, user: publicUser, token: signToken(publicUser) };
}

export async function loginUser(identifier: string, password: string) {
  const user = await prisma.user.findFirst({
    where: identifier.includes("@") ? { email: identifier } : { phone: identifier },
  });

  if (!user) {
    return { ok: false as const, error: "بيانات الدخول غير صحيحة." };
  }

  const valid = await checkPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false as const, error: "بيانات الدخول غير صحيحة." };
  }

  const publicUser = toPublicUser(user);
  return { ok: true as const, user: publicUser, token: signToken(publicUser) };
}

export async function seedAdminUser() {
  const email = "qayd075@gmail.com";
  const phone = "0547833071";
  const passwordHash = await hashPassword("Aa1122334455");

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }, { role: "admin" }, { email: "admin@smile.clinic" }],
    },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email, phone, passwordHash, role: "admin" },
    });
    return;
  }

  await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role: "admin",
    },
  });
}
