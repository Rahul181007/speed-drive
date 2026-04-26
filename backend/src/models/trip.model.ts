import mongoose from "mongoose";
import path from "node:path";

const tripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },

    distance: {
        type: Number,
        required: true
    },
    stoppageTime: {
        type: Number,
        required: true
    },
    idlingTime: {
        type: Number,
        required: true
    },

    overspeedDistance: {
        type: Number,
        default: 0
    },
    path: [
        {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            timestamp: { type: Date, required: true },
            ignition: { type: String, required: true },
            speed: { type: Number, required: true },
        }
    ],

    overspeedSegments: [
        {
            start: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
            },
            end: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
            }
        }
    ]
}, { timestamps: true })

export const Trip = mongoose.model("Trip", tripSchema);