import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { ticketsTable, paymentsTable, peopleTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

async function buildTicketResponse(ticket: typeof ticketsTable.$inferSelect) {
  const [payment] = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.id, ticket.paymentId));

  const people = await db
    .select()
    .from(peopleTable)
    .where(inArray(peopleTable.id, ticket.peopleIds as number[]));

  return {
    id: ticket.id,
    ticketCode: ticket.ticketCode,
    paymentId: ticket.paymentId,
    peopleIds: ticket.peopleIds as number[],
    peopleNames: people.map((p) => p.name),
    senderName: payment?.senderName ?? "",
    isDelivered: ticket.isDelivered,
    deliveredAt: ticket.deliveredAt ? ticket.deliveredAt.toISOString() : null,
    createdAt: ticket.createdAt.toISOString(),
    paymentProofUrl: payment?.paymentProofUrl ?? "",
    paymentStatus: payment?.status ?? "unknown",
  };
}

router.get("/tickets", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, delivered } = req.query as {
      search?: string;
      delivered?: string;
    };

    let tickets: (typeof ticketsTable.$inferSelect)[];

    if (delivered === "true") {
      tickets = await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.isDelivered, true))
        .orderBy(ticketsTable.createdAt);
    } else if (delivered === "false") {
      tickets = await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.isDelivered, false))
        .orderBy(ticketsTable.createdAt);
    } else {
      tickets = await db
        .select()
        .from(ticketsTable)
        .orderBy(ticketsTable.createdAt);
    }

    const results = await Promise.all(tickets.map(buildTicketResponse));

    if (search) {
      const q = search.toLowerCase();
      res.json(
        results.filter(
          (t) =>
            t.ticketCode.toLowerCase().includes(q) ||
            t.senderName.toLowerCase().includes(q) ||
            t.peopleNames.some((n: string) => n.toLowerCase().includes(q))
        )
      );
      return;
    }

    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to list tickets");
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

router.get("/tickets/:ticketCode", async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketCode = String(req.params.ticketCode);

    const [ticket] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.ticketCode, ticketCode));

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json(await buildTicketResponse(ticket));
  } catch (err) {
    req.log.error({ err }, "Failed to get ticket");
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

router.patch("/tickets/:ticketCode/delivered", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketCode = String(req.params.ticketCode);

    const [updated] = await db
      .update(ticketsTable)
      .set({ isDelivered: true, deliveredAt: new Date() })
      .where(eq(ticketsTable.ticketCode, ticketCode))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json(await buildTicketResponse(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to mark ticket delivered");
    res.status(500).json({ error: "Failed to mark ticket as delivered" });
  }
});

export default router;
