import { Router, type IRouter } from "express";
import healthRouter from "./health";
import peopleRouter from "./people";
import statsRouter from "./stats";
import paymentsRouter from "./payments";
import ticketsRouter from "./tickets";
import adminRouter from "./admin";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(peopleRouter);
router.use(statsRouter);
router.use(paymentsRouter);
router.use(ticketsRouter);
router.use(adminRouter);
router.use(uploadRouter);

export default router;
