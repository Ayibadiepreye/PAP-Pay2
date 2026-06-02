import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { peopleTable, paymentsTable, ticketsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalPeopleResult] = await db
      .select({ count: count() })
      .from(peopleTable);
    const [paidResult] = await db
      .select({ count: count() })
      .from(peopleTable)
      .where(eq(peopleTable.isPaid, true));
    const [totalTicketsResult] = await db
      .select({ count: count() })
      .from(ticketsTable);
    const [deliveredResult] = await db
      .select({ count: count() })
      .from(ticketsTable)
      .where(eq(ticketsTable.isDelivered, true));
    const [pendingResult] = await db
      .select({ count: count() })
      .from(paymentsTable)
      .where(eq(paymentsTable.status, "pending"));

    const totalPeople = Number(totalPeopleResult?.count ?? 0);
    const paidCount = Number(paidResult?.count ?? 0);
    const totalTickets = Number(totalTicketsResult?.count ?? 0);
    const deliveredCount = Number(deliveredResult?.count ?? 0);
    const pendingPayments = Number(pendingResult?.count ?? 0);

    res.json({
      totalPeople,
      paidCount,
      unpaidCount: totalPeople - paidCount,
      totalTickets,
      deliveredCount,
      pendingPayments,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
