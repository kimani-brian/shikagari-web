// Shared vehicle taxonomy — single source of truth for listing forms,
// search filters, and browse sections. Values must match the API:
// body types, fuel, transmission, and drivetrain are validated against
// these exact strings (`internal/dto/listing_dto.go`); make and location
// are matched case-insensitively, but keep them identical anyway.

export const VEHICLE_MAKES: string[] = [
  "Toyota",
  "Nissan",
  "Honda",
  "Mazda",
  "Subaru",
  "Mitsubishi",
  "Isuzu",
  "Mercedes-Benz",
  "BMW",
  "Volkswagen",
  "Ford",
  "Hyundai",
  "Kia",
  "Land Rover",
  "Jeep",
  "Suzuki",
  "Peugeot",
  "Renault",
  "Audi",
  "Tesla",
  "BYD",
  "Other",
];

export const BODY_TYPES: string[] = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Pickup",
  "Coupe",
  "EV",
  "Van",
  "Wagon",
];

export const FUEL_TYPES: string[] = ["petrol", "diesel", "hybrid", "electric"];

export const TRANSMISSIONS: string[] = ["automatic", "manual"];

export const DRIVETRAINS: string[] = ["2WD", "4WD", "AWD"];
