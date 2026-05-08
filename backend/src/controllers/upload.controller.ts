import { Request, Response } from "express";
import { buildPath, calculateIdlingDuration, calculateOverspeedDistance, calculateStoppageDuration, calculateTotalDistance, cleanData, getOverspeedSegments, parsedCsv } from "../services/csv.service";
import { Trip } from "../models/trip.model";
import { uploadTripSchema } from "../validation/upload.validation";


export class uploadController {
    static async upload(req: Request, res: Response) {
        try {
            const userId = req.userId;

            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const result=uploadTripSchema.safeParse(req.body);
            if(!result.success){
                return res.status(400).json({message:result.error.issues[0].message})
            }
            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded"
                })
            }

            if (req.file.mimetype !== "text/csv") {
                return res.status(400).json({ message: "Only CSV files are allowed" })
            }

            const { name } = result.data;
            const parsed = await parsedCsv(req.file.buffer)
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
