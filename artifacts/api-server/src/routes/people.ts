import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { peopleTable } from "@workspace/db";

const router = Router();

router.get("/people", async (req: Request, res: Response): Promise<void> => {
  try {
    const people = await db
      .select()
      .from(peopleTable)
      .orderBy(peopleTable.number);
    res.json(people);
  } catch (err) {
    req.log.error({ err }, "Failed to list people");
    res.status(500).json({ error: "Failed to fetch people" });
  }
});

export default router;
