import express from "express";
import { callAPI } from "./apiCaller.js";

// Giả định bạn có enum/const như sau
const TrafficTicket_VehicleTypeCode = {
  CAR: "CAR",
  MOTORBIKE: "MOTORBIKE",
  ELECTRICBIKE: "ELECTRICBIKE",
};

const TrafficTicket_VehicleTypeId = {
  CAR: 1,
  MOTORBIKE: 2,
  ELECTRICBIKE: 3,
};

const app = express();
const port = 3000;

app.use(express.json());

app.post("/api/v1/Traffic_Vehicle/CheckTrafficTicketNow", async (req, res) => {
  let { PlateNumber, TypeCode, TypeId } = req.body;

  if (!PlateNumber) {
    return res.status(400).json({ error: "PlateNumber is required" });
  }

  // Nếu không có TypeId mà có TypeCode thì map sang TypeId
  if (!TypeId && TypeCode) {
    switch (TypeCode?.trim()?.toUpperCase()) {
      case TrafficTicket_VehicleTypeCode.CAR:
        TypeId = TrafficTicket_VehicleTypeId.CAR;
        break;
      case TrafficTicket_VehicleTypeCode.MOTORBIKE:
        TypeId = TrafficTicket_VehicleTypeId.MOTORBIKE;
        break;
      case TrafficTicket_VehicleTypeCode.ELECTRICBIKE:
        TypeId = TrafficTicket_VehicleTypeId.ELECTRICBIKE;
        break;
      default:
        return res.status(400).json({ error: "Invalid TypeCode" });
    }
  }

  if (!TypeId) {
    return res.status(400).json({ error: "TypeId or valid TypeCode is required" });
  }

  try {
    // Gọi callAPI đúng thứ tự: (TypeId, plate)
    const Results = await callAPI(TypeId, PlateNumber);
    if (Results) {
      res.json({ PlateNumber, TypeId, Results });
    } else {
      res.status(404).json({ error: "No Results found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
