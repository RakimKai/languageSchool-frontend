// === DTOs ===

export interface CityDto {
  id: number;
  name: string;
  postalCode: string | null;
  countryId: number | null;
  countryName: string | null;
}
