import { callAPI } from "./apiCaller.js";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

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
    return res
      .status(400)
      .json({ error: "TypeId or valid TypeCode is required" });
  }

  try {
    const Results = await callAPI(TypeId, PlateNumber);
    if (Results) {
      return res.json({ PlateNumber, TypeId, Results });
    } else {
      return res.status(404).json({ error: "No Results found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
