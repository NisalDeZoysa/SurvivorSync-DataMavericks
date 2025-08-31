import { Router } from "express";
import { listNews, createNews } from "../controllers/newsController.js";

const router = Router();

router.get("/", listNews);
router.post("/", createNews);

export default router;



