import { Request, Response } from "express";
import { Trip } from "../models/trip.model";
import { getTripWIthPagination, TripDocument } from "../services/trip.service";


export class TripController {
    static async getTrips(req: Request, res: Response) {
        try {
            const userId = req.userId;

            const trips = await Trip.find({ userId }).sort({ createdAt: -1 })
            res.json(trips);
        } catch (error) {
            res.status(500).json({ message: "Error fetching trips" });
        }
    }

   static async getTripsById(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const tripId = req.params.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const trip = await Trip.findOne({
      _id: tripId,
      userId
    }).lean();

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const result = getTripWIthPagination(
      trip as unknown as TripDocument,
      page,
      limit
    );

    return res.json(result);

  } catch (error) {
    res.status(500).json({ message: "Error fetching a trip" });
  }
}

static async deleteTrip(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const tripId = req.params.id;


    const trip = await Trip.findOneAndDelete({
      _id: tripId,
      userId
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.json({ message: "Trip deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting trip" });
  }
}
}