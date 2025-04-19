// /resources/js/services/api/invoices.ts
import api from "./axios-instance";
import { 
  Invoice,
  PaymentData,
  NewInvoiceData,
  InvoiceResponseData
} from "@/services/api/types/invoice";

export const invoiceService = {
  /**
   * Get all invoices for a landlord
   * @param {number} landlordId 
   * @returns {Promise<InvoiceResponseData>}
   */
  getInvoices: async (landlordId: number): Promise<InvoiceResponseData> => {
    const response = await api.get(`/rentwise/landlords/invoices`);
    return response.data;
  },

  /**
   * Get a single invoice by ID
   * @param {number} invoiceId 
   * @returns {Promise<Invoice>}
   */
  getInvoiceById: async (invoiceId: number): Promise<Invoice> => {
    const response = await api.get(`/rentwise/invoices/${invoiceId}`);
    return response.data;
  },

  /**
   * Create a new invoice
   * @param {NewInvoiceData} invoiceData 
   * @returns {Promise<any>}
   */
  createInvoice: async (invoiceData: NewInvoiceData): Promise<any> => {
    const response = await api.post(`/rentwise/invoices`, invoiceData);
    return response.data;
  },

  /**
   * Update an existing invoice
   * @param {number} invoiceId 
   * @param {Partial<Invoice>} invoiceData 
   * @returns {Promise<any>}
   */
  updateInvoice: async (invoiceId: number, invoiceData: Partial<Invoice>): Promise<any> => {
    const response = await api.put(`/rentwise/invoices/${invoiceId}`, invoiceData);
    return response.data;
  },

  /**
   * Delete an invoice
   * @param {number} invoiceId 
   * @returns {Promise<any>}
   */
  deleteInvoice: async (invoiceId: number): Promise<any> => {
    const response = await api.delete(`/rentwise/invoices/${invoiceId}`);
    return response.data;
  },

  /**
   * Mark an invoice as paid
   * @param {number} invoiceId 
   * @param {PaymentData} paymentData Optional payment details
   * @returns {Promise<any>}
   */
  markInvoiceAsPaid: async (invoiceId: number, paymentData: PaymentData = {}): Promise<any> => {
    const response = await api.post(`/rentwise/invoices/${invoiceId}/mark-paid`, paymentData);
    return response.data;
  },

  /**
   * Generate a PDF for an invoice
   * @param {number} invoiceId 
   * @returns {Promise<Blob>} PDF blob
   */
  generateInvoicePdf: async (invoiceId: number): Promise<Blob> => {
    const response = await api.get(`/rentwise/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get all invoices for a specific tenant
   * @param {number} tenantId 
   * @returns {Promise<Invoice[]>}
   */
  getTenantInvoices: async (tenantId: number): Promise<Invoice[]> => {
    const response = await api.get(`/rentwise/tenants/${tenantId}/invoices`);
    return response.data;
  },

  /**
   * Get all invoices for a specific property
   * @param {number} propertyId 
   * @returns {Promise<Invoice[]>}
   */
  getPropertyInvoices: async (propertyId: number): Promise<Invoice[]> => {
    const response = await api.get(`/rentwise/properties/${propertyId}/invoices`);
    return response.data;
  },

  /**
   * Send invoice reminder to tenant
   * @param {number} invoiceId 
   * @returns {Promise<any>}
   */
  sendInvoiceReminder: async (invoiceId: number): Promise<any> => {
    const response = await api.post(`/rentwise/invoices/${invoiceId}/send-reminder`);
    return response.data;
  },
  
  /**
   * Generate invoices in bulk for a property or all properties
   * @param {number} landlordId
   * @param {number|null} propertyId Optional - specific property
   * @param {string} billingMonth Format: YYYY-MM
   * @returns {Promise<any>}
   */
  generateBulkInvoices: async (
    landlordId: number, 
    billingMonth: string, 
    propertyId: number | null = null
  ): Promise<any> => {
    const data = {
      landlord_id: landlordId,
      billing_month: billingMonth,
      property_id: propertyId
    };
    
    const response = await api.post(`/rentwise/invoices/generate-bulk`, data);
    return response.data;
  }
};

export default invoiceService;