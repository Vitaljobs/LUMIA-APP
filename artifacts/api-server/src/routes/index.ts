import { Router, type IRouter } from "express";
import healthRouter from "./health";
import lumiaRouter from "./lumia";

const router: IRouter = Router();

router.use(healthRouter);
router.use(lumiaRouter);

export default router;
