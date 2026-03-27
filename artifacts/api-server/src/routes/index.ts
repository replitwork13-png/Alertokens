import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tokensRouter from "./tokens";
import alertsRouter from "./alerts";
import triggerRouter from "./trigger";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tokens", tokensRouter);
router.use("/tokens/:tokenId/alerts", alertsRouter);
router.use("/trigger", triggerRouter);
router.use("/stats", statsRouter);

export default router;
