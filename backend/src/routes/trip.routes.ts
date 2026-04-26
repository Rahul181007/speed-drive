import { Router } from "express";
import { TripController } from "../controllers/trip.controller";
import { authMiddleWare } from "../middleware/auth.middleware";

const router=Router()

router.get("/", authMiddleWare, TripController.getTrips);
router.get("/:id", authMiddleWare, TripController.getTripsById);

export default router