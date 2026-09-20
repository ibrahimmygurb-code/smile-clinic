import { Router } from "express";
import { doctors } from "../data/doctors";
import { dentalServices } from "../data/services";
import {
  createBooking,
  deleteBooking,
  getBookedTimes,
  getBookingById,
  listBookings,
  updateBooking,
} from "../lib/bookings-store";
import { prisma } from "../lib/prisma";
import { validateBookingInput, validateBookingUpdate } from "../lib/validation";
import { requireAdmin, requireAuth } from "../middleware/auth";

export const apiRouter = Router();

function databaseError(res: import("express").Response) {
  return res.status(503).json({
    error:
      "تعذر الاتصال بـ PostgreSQL. تحقق من DATABASE_URL في مجلد backend ثم أعد تشغيل السيرفر.",
  });
}

apiRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, database: "connected", provider: "postgresql" });
  } catch {
    res.status(500).json({
      ok: false,
      database: "disconnected",
      error: "تعذر الاتصال بـ PostgreSQL. تحقق من DATABASE_URL وكلمة المرور.",
    });
  }
});

apiRouter.get("/services", (_req, res) => {
  res.json({ services: dentalServices });
});

apiRouter.get("/doctors", (_req, res) => {
  res.json({ doctors });
});

apiRouter.get("/availability", requireAuth, async (req, res) => {
  const date = typeof req.query.date === "string" ? req.query.date : "";
  const doctorId = typeof req.query.doctorId === "string" ? req.query.doctorId : "";
  const excludeId = typeof req.query.excludeId === "string" ? req.query.excludeId : "";

  if (!date) {
    res.status(400).json({ error: "حدد التاريخ لمعرفة الأوقات المتاحة." });
    return;
  }

  if (!doctorId) {
    res.status(400).json({ error: "حدد الطبيب لمعرفة الأوقات المتاحة." });
    return;
  }

  try {
    const bookedTimes = await getBookedTimes(date, doctorId, excludeId || undefined);
    res.json({ date, doctorId, bookedTimes });
  } catch {
    databaseError(res);
  }
});

apiRouter.get("/bookings", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const bookings = await listBookings();
    res.json({ bookings });
  } catch {
    databaseError(res);
  }
});

apiRouter.post("/bookings", requireAuth, async (req, res) => {
  const validation = validateBookingInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await createBooking(validation.data);
    if (!result.ok) {
      res.status(409).json({ error: result.error });
      return;
    }
    res.status(201).json({ booking: result.booking });
  } catch {
    databaseError(res);
  }
});

apiRouter.get("/bookings/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const booking = await getBookingById(id);
    if (!booking) {
      res.status(404).json({ error: "الموعد غير موجود." });
      return;
    }
    res.json({ booking });
  } catch {
    databaseError(res);
  }
});

apiRouter.put("/bookings/:id", requireAuth, requireAdmin, async (req, res) => {
  const validation = validateBookingUpdate(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await updateBooking(String(req.params.id), validation.data);
    if (!result.ok) {
      const status = result.error.includes("غير موجود") ? 404 : 409;
      res.status(status).json({ error: result.error });
      return;
    }
    res.json({ booking: result.booking });
  } catch {
    databaseError(res);
  }
});

apiRouter.delete("/bookings/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await deleteBooking(String(req.params.id));
    if (!result.ok) {
      res.status(404).json({ error: result.error });
      return;
    }
    res.json({ ok: true });
  } catch {
    databaseError(res);
  }
});
