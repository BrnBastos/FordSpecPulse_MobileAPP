import type { ImageSourcePropType } from "react-native";

const brandLogos: Record<string, ImageSourcePropType> = {
  ford: require("../../assets/images/brands/ford.png"),
  chevrolet: require("../../assets/images/brands/chevrolet.png"),
  fiat: require("../../assets/images/brands/fiat.png"),
  mitsubishi: require("../../assets/images/brands/mitsubishi.png"),
  nissan: require("../../assets/images/brands/nissan.png"),
  toyota: require("../../assets/images/brands/toyota.png"),
  volkswagen: require("../../assets/images/brands/volkswagen.png"),
};

const normalize = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/^brand-/, "");

export function getBrandLogo(name: string): ImageSourcePropType | undefined {
  return brandLogos[normalize(name)];
}

export function getVehiclePhoto(vehicle: {
  brandName?: string;
  brandId: string;
  model: string;
  year: number;
  market: string;
}):
  | { source: ImageSourcePropType; credit: string; aspectRatio: number }
  | undefined {
  // Photos illustrate these model-year families, never other years or markets.
  if (
    normalize(vehicle.brandName ?? vehicle.brandId) !== "ford" ||
    vehicle.year !== 2024 ||
    vehicle.market.toUpperCase() !== "BR"
  )
    return undefined;
  if (normalize(vehicle.model) === "ranger raptor")
    return {
      source: require("../../assets/images/vehicles/ford-ranger-raptor-2024.jpg"),
      credit: "Ford / Divulgação",
      aspectRatio: 1200 / 800,
    };
  if (normalize(vehicle.model) === "ranger")
    return {
      source: require("../../assets/images/vehicles/ford-ranger-2024.jpg"),
      credit: "Encontracarros",
      aspectRatio: 1200 / 876,
    };
  return undefined;
}

export const automotiveBanners = {
  login: require("../../assets/images/login-automotive-generated-v1.jpg"),
  home: require("../../assets/images/home-automotive-generated-v1.jpg"),
  compare: require("../../assets/images/compare-automotive-generated-v1.jpg"),
};
