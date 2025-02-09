// /resources/js/services/api/properties.ts
import api from "./axios-instance";

export const propertyService = {
  createProperty: async (propertyData: any) => {
    const response = await api.post("/rentwise/properties-create", propertyData);
    return response.data;
  },
};
