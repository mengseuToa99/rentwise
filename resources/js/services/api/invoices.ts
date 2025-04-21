// /resources/js/services/api/invoices.ts
import api from "./axios-instance";
import { Invoice, PaymentData } from "@/services/api/types/invoice";

export const invoiceService = {
  /**
   * Get invoices for a landlord
   * @param {number} landlordId 
   * @returns {Promise<any>}
   */
  getInvoices: async (landlordId: number) => {
    const response = await api.get(`/rentwise/invoices/${landlordId}`);
    return response.data;
  },

  /**
 * Get invoices for a tenant
 * @param {number} rentalId
 * @returns {Promise<any>}
 */
getTenantInvoices: async (rentalId: number) => {
  const response = await api.get(`/rentwise/rentals/${rentalId}/invoices`);
  return response.data;
},
 
};

export default invoiceService;