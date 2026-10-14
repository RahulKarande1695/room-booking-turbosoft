import { Router } from "express";
import { getAvailability, listRooms } from "../controllers/roomController.js";

const router = Router();
router.get("/", listRooms);
router.get("/:id/availability", getAvailability);

export default router;