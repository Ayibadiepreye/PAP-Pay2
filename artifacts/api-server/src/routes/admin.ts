import { Router, type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";

const router = Router();

const ADMIN_USERNAME = "Shadow";
const ADMIN_PASSWORD = "Shadow2008";

const sessions = new Map<string, { username: string; createdAt: Date }>();

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = (req as any).cookies?.["admin_session"];
  if (!token || !sessions.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const session = sessions.get(token)!;
  const age = Date.now() - session.createdAt.getTime();
  if (age > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    res.status(401).json({ error: "Session expired" });
    return;
  }
  (req as any).adminUser = session.username;
  next();
}

router.post("/admin/login", (req: Request, res: Response): void => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = generateSessionToken();
  sessions.set(token, { username, createdAt: new Date() });
  res.cookie("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ authenticated: true, username });
});

router.post("/admin/logout", (req: Request, res: Response): void => {
  const token = (req as any).cookies?.["admin_session"];
  if (token) sessions.delete(token);
  res.clearCookie("admin_session");
  res.json({ success: true });
});

router.get("/admin/me", (req: Request, res: Response): void => {
  const token = (req as any).cookies?.["admin_session"];
  if (!token || !sessions.has(token)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const session = sessions.get(token)!;
  const age = Date.now() - session.createdAt.getTime();
  if (age > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    res.status(401).json({ error: "Session expired" });
    return;
  }
  res.json({ authenticated: true, username: session.username });
});

export default router;
