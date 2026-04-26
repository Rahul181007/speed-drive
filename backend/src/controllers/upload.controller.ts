import { Request, Response } from "express";
import { buildPath, calculateIdlingDuration, calculateOverspeedDistance, calculateStoppageDuration, calculateTotalDistance, cleanData, getOverspeedSegments, parsedCsv } from "../services/csv.service";
import { Trip } from "../models/trip.model";


export class uploadController {
    static async upload(req: Request, res: Response) {
        try {
            const userId = req.userId;
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded"
                })
            }

            const { name } = req.body;
            const parsed = await parsedCsv(req.file.path)
            const cleaned = cleanData(parsed)
            const totalDistance = calculateTotalDistance(cleaned);

            const stoppageTime = calculateStoppageDuration(cleaned)


            const idlingTime = calculateIdlingDuration(cleaned);
            const overspeedSegments = getOverspeedSegments(cleaned);
            const overspeedDistance = calculateOverspeedDistance(cleaned);
            const path = buildPath(cleaned);

            const trip = await Trip.create({
                userId,
                name,
                distance: totalDistance,
                stoppageTime,
                idlingTime,
                overspeedDistance,
                path,
                overspeedSegments
            })


            res.json({
                message: "Trip saved successfully",
                trip: {
                    ...trip.toObject(),
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Something went wrong" })
        }
    }
}
