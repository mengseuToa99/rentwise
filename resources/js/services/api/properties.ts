// /resources/js/services/api/properties.ts
import api from "./axios-instance";
import { 
  PropertyFormData, 
  DeleteRoomParams, 
  TenantAssignment, 
  TenantAssignmentResponse,
  TenantInfo,
  TenantInfoResponse
} from "@/services/api/types/property";

export const propertyService = {
  createProperty: async (propertyData: any) => {
    const response = await api.post("/rentwise/properties-create", propertyData);
    return response.data;
  },

  getProperties: async (landlordId: number) => {
    const response = await api.get(`/rentwise/landlords/${landlordId}/properties`);
    return response.data;
  },

  deleteProperty: async (propertyId: number) => {
    const response = await api.delete(`/rentwise/properties/${propertyId}`);
    return response.data;
  },

  deleteRoom: async (data: DeleteRoomParams) => {
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
    const response = await api.put(`/rentwise/unit-update`, unitData);
    return response.data;
  },
  
  getTenantInfo: async (roomId: number): Promise<TenantInfo> => {
    const response = await api.get(`/rentwise/rental/${roomId}`);
    console.log('Tenant Info Response:', response.data);
    
    // Extract tenant info from the response structure
    if (response.data && response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Invalid response format from tenant info API');
  },
  
  assignTenant: async (data: TenantAssignment): Promise<TenantAssignmentResponse> => {
    // Format dates to YYYY-MM-DD format
    const formattedStartDate = data.startDate.toISOString().split('T')[0];
    const formattedEndDate = data.endDate.toISOString().split('T')[0];
    
    // Get the landlord ID from local storage
    const storedUser = localStorage.getItem("user");
    let landlordId = null;
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      landlordId = user.user_id ? Number(user.user_id) : Number(user.id);
    }
    
    const requestData = {
      landlord_id: landlordId, // Get from the authenticated user
      tenant_id: data.tenantId,
      room_id: data.roomId,
      start_date: formattedStartDate,
      end_date: formattedEndDate
    };
    
    // Log the request data for debugging
    console.log('Tenant Assignment Request:', {
      endpoint: '/rentwise/rental',
      method: 'POST',
      data: requestData,
      hasFile: !!data.leaseAgreement
    });
    
    // If there's a lease agreement file, handle it with FormData
    if (data.leaseAgreement) {
      const formData = new FormData();
      Object.entries(requestData).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value.toString());
        }
      });
      formData.append('lease_agreement', data.leaseAgreement);
      
      const response = await api.post('/rentwise/rental', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('API Response:', response.data);
      return response.data;
    } else {
      // Regular JSON request if no file is present
      const response = await api.post('/rentwise/rental', requestData);
      console.log('API Response:', response.data);
      return response.data;
    }
  }
};