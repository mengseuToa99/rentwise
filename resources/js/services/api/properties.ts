// /resources/js/services/api/properties.ts
import api from "./axios-instance";

export const propertyService = {
  createProperty: async (propertyData: any) => {
    const response = await api.post("/rentwise/properties-create", propertyData);
    return response.data;
  },

  getProperties: async (landlordId: number) => {
    const response = await api.get(`/rentwise/landlords/properties`);
    return response.data;
  },

  deleteProperty: async (propertyId: number) => {
    const response = await api.delete(`/rentwise/properties/${propertyId}`);
    return response.data;
  },

  deleteRoom: async (data: {
    propertyId: number;
    floorNumber: number;
    roomNumber: number;
  }) => {
    const response = await api.delete(
      `/rentwise/properties/${data.propertyId}/delete-room`,
      {
        data: {
          floor_number: data.floorNumber,
          room_number: data.roomNumber
        }
      }
    );
    return response.data;
  },

  updateProperty: async (propertyId: number, propertyData: any) => {
    const response = await api.put(`/rentwise/properties/${propertyId}`, propertyData);
    return response.data;
  },

  updateUnit: async (unitData: any) => {
    const response = await api.put(`/rentwise/update-unit`, unitData);
    return response.data;
  },
};