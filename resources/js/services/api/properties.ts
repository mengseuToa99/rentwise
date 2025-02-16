// /resources/js/services/api/properties.ts
import api from "./axios-instance";

export const propertyService = {
  createProperty: async (propertyData: any) => {
    const response = await api.post("/rentwise/properties-create", propertyData);
    return response.data;
  },
  // Add this method for fetching properties:
  getProperties: async (landlordId: number) => {
    const response = await api.get(`/rentwise/landlords/properties`);
    return response.data;
  },

  // Delete a property
  deleteProperty: async (propertyId: number) => {
    const response = await api.delete(`/rentwise/properties/${propertyId}`);
    return response.data;
  },

  // Delete a room
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
};
