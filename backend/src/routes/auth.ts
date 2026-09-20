import { Router } from "express";
import {
  loginUser,
  registerUser,
  validateLoginInput,
  validateRegisterInput,
} from "../lib/auth";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const validation = validateRegisterInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await registerUser(
      validation.data.email,
      validation.data.phone,
      validation.data.password,
    );
    if (!result.ok) {
      res.status(409).json({ error: result.error });
      return;
    }
    res.status(201).json({ user: result.user, token: result.token });
  } catch {
    res.status(503).json({ error: "تعذر إنشاء الحساب. حاول مرة أخرى." });
  }
});

authRouter.post("/login", async (req, res) => {
  const validation = validateLoginInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await loginUser(validation.data.identifier, validation.data.password);
    if (!result.ok) {
      res.status(401).json({ error: result.error });
      return;
    }
    res.json({ user: result.user, token: result.token });
  } catch {
    res.status(503).json({ error: "تعذر تسجيل الدخول. حاول مرة أخرى." });
  }
});

authRouter.get("/me", requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});
