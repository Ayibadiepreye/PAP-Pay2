import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { paymentsTable, ticketsTable, peopleTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "./admin";

const router = Router();

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PAP-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

router.get("/payments", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query as { status?: string; search?: string };

    let payments = await db.select().from(paymentsTable).orderBy(paymentsTable.createdAt);

    if (status && ["pending", "verified", "rejected"].includes(status)) {
      payments = payments.filter((p) => p.status === status);
    }

    const peopleAll = await db.select().from(peopleTable);
    const peopleMap = new Map(peopleAll.map((p) => [p.id, p.name]));

    let result = payments.map((p) => ({
      ...p,
      amountPaid: Number(p.amountPaid),
      createdAt: p.createdAt.toISOString(),
      peopleNames: (p.peopleIds as number[]).map(
        (id) => peopleMap.get(id) ?? "Unknown"
      ),
    }));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.senderName.toLowerCase().includes(q) ||
          p.ticketCode.toLowerCase().includes(q) ||
          p.peopleNames.some((n: string) => n.toLowerCase().includes(q))
      );
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list payments");
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

router.post("/payments", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      senderName,
      numberOfPeople,
      peopleIds,
      paymentProofUrl,
      amountPaid,
      agreedToTerms,
    } = req.body;

    if (
      !senderName ||
      !numberOfPeople ||
      !peopleIds ||
      !paymentProofUrl ||
      !amountPaid ||
      !agreedToTerms
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (!Array.isArray(peopleIds) || peopleIds.length !== numberOfPeople) {
      res.status(400).json({ error: "peopleIds count must match numberOfPeople" });
      return;
    }

    const existingPaid = await db
      .select()
      .from(peopleTable)
      .where(inArray(peopleTable.id, peopleIds as number[]));

    const alreadyPaid = existingPaid.filter((p) => p.isPaid);
    if (alreadyPaid.length > 0) {
      res.status(400).json({
        error: `Some people are already paid for: ${alreadyPaid.map((p) => p.name).join(", ")}`,
      });
      return;
    }

    const ticketCode = generateTicketCode();

    const [payment] = await db
      .insert(paymentsTable)
      .values({
        senderName,
        numberOfPeople,
        peopleIds: peopleIds as number[],
        paymentProofUrl,
        amountPaid: String(amountPaid),
        status: "pending",
        ticketCode,
        agreedToTerms: true,
      })
      .returning();

    await db.insert(ticketsTable).values({
      ticketCode,
      paymentId: payment.id,
      peopleIds: peopleIds as number[],
      isDelivered: false,
    });

    await db
      .update(peopleTable)
      .set({ isPaid: true, ticketCode })
      .where(inArray(peopleTable.id, peopleIds as number[]));

    const paidPeople = await db
      .select()
      .from(peopleTable)
      .where(inArray(peopleTable.id, peopleIds as number[]));

    const peopleNames = paidPeople.map((p) => p.name);

    res.status(201).json({
      ticketCode,
      paymentId: payment.id,
      peopleNames,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit payment");
    res.status(500).json({ error: "Failed to submit payment" });
  }
});

router.get("/payments/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const [payment] = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, id));

    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    const people = await db
      .select()
      .from(peopleTable)
      .where(inArray(peopleTable.id, payment.peopleIds as number[]));

    res.json({
      ...payment,
      amountPaid: Number(payment.amountPaid),
      createdAt: payment.createdAt.toISOString(),
      peopleNames: people.map((p) => p.name),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get payment");
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

router.patch("/payments/:id/status", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const { status } = req.body;
    if (!["verified", "rejected"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const [updated] = await db
      .update(paymentsTable)
      .set({ status })
      .where(eq(paymentsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    const people = await db
      .select()
      .from(peopleTable)
      .where(inArray(peopleTable.id, updated.peopleIds as number[]));

    res.json({
      ...updated,
      amountPaid: Number(updated.amountPaid),
      createdAt: updated.createdAt.toISOString(),
      peopleNames: people.map((p) => p.name),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update payment status");
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

export default router;
