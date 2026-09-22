import { Router } from "express";
import {
  createDoctor,
  deleteDoctor,
  listDoctors,
  updateDoctor,
  validateDoctorInput,
} from "../lib/doctors-store";
import {
  createService,
  deleteService,
  listServices,
  updateService,
  validateServiceInput,
} from "../lib/services-store";
import {
  createBooking,
  deleteBooking,
  getBookedTimes,
  getBookingById,
  listBookings,
  listBookingsForPhone,
  updateBooking,
} from "../lib/bookings-store";
import { prisma } from "../lib/prisma";
import { validateBookingInput, validateBookingUpdate } from "../lib/validation";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth";

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

apiRouter.get("/services", async (_req, res) => {
  try {
    const services = await listServices();
    res.json({ services });
  } catch {
    databaseError(res);
  }
});

apiRouter.post("/services", requireAuth, requireAdmin, async (req, res) => {
  const validation = validateServiceInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await createService(validation.data);
    res.status(201).json({ service: result.service });
  } catch {
    databaseError(res);
  }
});

apiRouter.put("/services/:id", requireAuth, requireAdmin, async (req, res) => {
  const validation = validateServiceInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await updateService(String(req.params.id), validation.data);
    if (!result.ok) {
      res.status(404).json({ error: result.error });
      return;
    }
    res.json({ service: result.service });
  } catch {
    databaseError(res);
  }
});

apiRouter.delete("/services/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await deleteService(String(req.params.id));
    if (!result.ok) {
      const status = result.error.includes("غير موجود") ? 404 : 409;
      res.status(status).json({ error: result.error });
      return;
    }
    res.json({ ok: true });
  } catch {
    databaseError(res);
  }
});

apiRouter.get("/doctors", async (_req, res) => {
  try {
    const doctors = await listDoctors();
    res.json({ doctors });
  } catch {
    databaseError(res);
  }
});

apiRouter.post("/doctors", requireAuth, requireAdmin, async (req, res) => {
  const validation = validateDoctorInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await createDoctor(validation.data);
    res.status(201).json({ doctor: result.doctor });
  } catch {
    databaseError(res);
  }
});

apiRouter.put("/doctors/:id", requireAuth, requireAdmin, async (req, res) => {
  const validation = validateDoctorInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await updateDoctor(String(req.params.id), validation.data);
    if (!result.ok) {
      res.status(404).json({ error: result.error });
      return;
    }
    res.json({ doctor: result.doctor });
  } catch {
    databaseError(res);
  }
});

apiRouter.delete("/doctors/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await deleteDoctor(String(req.params.id));
    if (!result.ok) {
      const status = result.error.includes("غير موجود") ? 404 : 409;
      res.status(status).json({ error: result.error });
      return;
    }
    res.json({ ok: true });
  } catch {
    databaseError(res);
  }
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

apiRouter.get("/my-bookings", requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "يلزم تسجيل الدخول." });
    return;
  }

  try {
    const bookings = await listBookingsForPhone(user.phone);
    res.json({ bookings });
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
