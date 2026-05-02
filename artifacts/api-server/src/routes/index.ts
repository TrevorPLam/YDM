import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactsRouter from "./contacts";
import newsletterRouter from "./newsletter";
import industriesRouter from "./industries";
import blogRouter from "./blog";

const router: IRouter = Router();

router.use("/healthz", healthRouter);
router.use("/contacts", contactsRouter);
router.use("/newsletter", newsletterRouter);
router.use("/industries", industriesRouter);
router.use("/blog", blogRouter);

export default router;
