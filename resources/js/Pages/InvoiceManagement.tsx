"use client";

import React, { useState, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  CheckCircle, 
  Plus,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { invoiceService } from "@/services/api/invoices";
import { toast } from "sonner";
import InvoiceFlipCard from "@/components/InvoiceFlipCard";
import { Invoice, ResponseData } from "@/services/api/types/invoice"
const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [markAsPaidOpen, setMarkAsPaidOpen] = useState<boolean>(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      // TEMPORARY: Use mock data instead of API call
      // In production, replace this with:
      // const response = await invoiceService.getInvoices(landlordId);
      const mockData = {
        landlord_id: "1",
        tenants: [
          {
            tenant_id: 3,
            tenant_name: "John Doe",
            rentals: [
              {
                rental_id: 1,
                room: {
                  room_id: 1,
                  room_number: "101",
                  property_name: "Sunrise Apartments",
                  rent_amount: "810.00"
                },
                invoices: [
                  {
                    invoice_id: 101,
                    invoice_date: "2025-04-01",
                    due_date: "2025-04-20",
                    billing_month: "2025-04",
                    amount_due: "810.00",
                    paid: 0,
                    payment_status: "pending",
                    payment_method: "cash",
                    amount_breakdown: {
                      rent: "750.00",
                      utilities: "45.00",
                      other_charges: "15.00",
                      total: "810.00",
                    },
                    utility_details: {
                      Water: {
                        old_reading: "190.50",
                        new_reading: "195.50",
                        consumption: "5.00",
                        rate: "3.00",
                        cost: "15.00",
                        usage_date: "2025-04-01"
                      },
                      Electricity: {
                        old_reading: "190.75",
                        new_reading: "200.75",
                        consumption: "10.00",
                        rate: "3.00",
                        cost: "30.00",
                        usage_date: "2025-04-01"
                      }
                    }
                  },
                  {
                    invoice_id: 102,
                    invoice_date: "2025-03-01",
                    due_date: "2025-03-15",
                    billing_month: "2025-03",
                    amount_due: "780.00",
                    paid: 1,
                    payment_status: "paid",
                    payment_method: "credit card",
                    amount_breakdown: {
                      rent: "700.00",
                      utilities: "65.00",
                      other_charges: "15.00",
                      total: "780.00",
                    },
                    utility_details: {
                      Water: {
                        old_reading: "155.75",
                        new_reading: "164.25",
                        consumption: "8.50",
                        rate: "3.00",
                        cost: "25.50",
                        usage_date: "2025-03-01"
                      },
                      Electricity: {
                        old_reading: "267.30",
                        new_reading: "280.13",
                        consumption: "12.83",
                        rate: "3.08",
                        cost: "39.50",
                        usage_date: "2025-03-01"
                      }
                    }
                  },
                  {
                    invoice_id: 103,
                    invoice_date: "2025-04-01",
                    due_date: "2025-04-10",
                    billing_month: "2025-04",
                    amount_due: "890.00",
                    paid: 0,
                    payment_status: "overdue",
                    payment_method: "cash",
                    amount_breakdown: {
                      rent: "800.00",
                      utilities: "70.00",
                      other_charges: "20.00",
                      total: "890.00",
                    },
                    utility_details: {
                      Water: {
                        old_reading: "145.20",
                        new_reading: "153.70",
                        consumption: "8.50",
                        rate: "3.00",
                        cost: "25.50",
                        usage_date: "2025-04-01"
                      },
                      Electricity: {
                        old_reading: "275.30",
                        new_reading: "289.80",
                        consumption: "14.50",
                        rate: "3.10",
                        cost: "44.50",
                        usage_date: "2025-04-01"
                      }
                    }
                  }
                ]
              }
            ],
            summary: {
              total_rentals: 1,
              total_invoices: 3,
              outstanding_amount: "1,700.00"
            }
          }
        ]
      };
      
      const allInvoices = processInvoices(mockData);
      console.log("Processed invoices:", allInvoices);
      setInvoices(allInvoices);
    } catch (error: any) {
      console.error("Error in fetchInvoices:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Process nested invoice data into a flat list with tenant and property info
  const processInvoices = (data: ResponseData): Invoice[] => {
    if (!data || !data.tenants) return [];
    
    const processed: Invoice[] = [];
    
    data.tenants.forEach(tenant => {
      tenant.rentals.forEach(rental => {
        rental.invoices.forEach(invoice => {
          processed.push({
            ...invoice,
            tenant_name: tenant.tenant_name,
            property_name: rental.room.property_name,
            room_number: rental.room.room_number
          });
        });
      });
    });
    
    return processed;
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkAsPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setMarkAsPaidOpen(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!selectedInvoice) return;
    
    try {
      // Optimistic update
      const updatedInvoices = invoices.map(inv => 
        inv.invoice_id === selectedInvoice.invoice_id ? 
          {...inv, payment_status: "paid", paid: 1} : inv
      );
      
      setInvoices(updatedInvoices);
      
      // Call API to update payment status - commented out for mock data
      // await invoiceService.markInvoiceAsPaid(selectedInvoice.invoice_id);
      
      toast.success("Invoice marked as paid successfully");
      setMarkAsPaidOpen(false);
    } catch (error: any) {
      console.error("Failed to mark invoice as paid:", error);
      toast.error("Failed to update payment status: " + error.message);
      
      // Revert the optimistic update
      fetchInvoices();
    }
  };
  
  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <RootLayout>
        <div className="p-8">
          <p>Loading invoices...</p>
        </div>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <RootLayout>
        <div className="p-8">
          <p className="text-red-500">Error loading invoices: {error}</p>
          <Button onClick={fetchInvoices} className="mt-4">
            Retry
          </Button>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Results info */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            Showing {invoices.length} invoices
          </p>
        </div>

        {/* Invoice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No invoices found</h3>
              <p className="text-muted-foreground mt-1">
                No invoices are available at this time.
              </p>
            </div>
          ) : (
            invoices.map(invoice => (
              <InvoiceFlipCard 
                key={invoice.invoice_id} 
                invoice={invoice} 
                onMarkAsPaid={handleMarkAsPaid} 
              />
            ))
          )}
        </div>

        {/* Mark as Paid Dialog */}
        <Dialog open={markAsPaidOpen} onOpenChange={setMarkAsPaidOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Mark Invoice as Paid</DialogTitle>
              <DialogDescription>
                Confirm payment for invoice #{selectedInvoice?.invoice_id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p>
                Are you sure you want to mark this invoice as paid? This will update the payment status and record the payment.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Tenant</p>
                  <p className="text-sm">{selectedInvoice?.tenant_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-sm font-semibold">
                    {selectedInvoice && formatCurrency(selectedInvoice.amount_due)}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMarkAsPaidOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmMarkAsPaid}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RootLayout>
  );
};

export default InvoiceManagement;