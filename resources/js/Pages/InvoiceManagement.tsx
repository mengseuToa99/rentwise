"use client";

import React, { useState, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { invoiceService } from "@/services/api/invoices";
import { toast } from "sonner";
import InvoiceFlipCard from "@/components/InvoiceFlipCard";
import { Invoice, ResponseData } from "@/services/api/types/invoice";
import { format } from "date-fns";

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [markAsPaidOpen, setMarkAsPaidOpen] = useState<boolean>(false);
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("tenant"); // 'tenant' or 'landlord'

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      // Get user data from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User not logged in");
      }
      
      const user = JSON.parse(storedUser);
      console.log("User from localStorage:", user);
      const userId = user.id || 0;
      
      if (!userId) {
        throw new Error("User ID not found");
      }
      
      // Determine user role
      if (user.roles && Array.isArray(user.roles)) {
        const isLandlord = user.roles.includes("Landlord");
        const isTenant = user.roles.includes("Tenant");
        
        if (isLandlord) {
          setUserRole("landlord");
        } else if (isTenant) {
          setUserRole("tenant");
        } else {
          setUserRole("tenant"); // Default to tenant if role not recognized
        }
      }
      
      console.log("User role determined:", userRole);
      
      // Fetch invoices based on user role
      let apiResponse;
      if (userRole === 'landlord') {
        console.log("Fetching landlord invoices for ID:", userId);
        apiResponse = await invoiceService.getInvoices(userId);
      } else {
        console.log("Fetching tenant invoices for ID:", userId);
        apiResponse = await invoiceService.getTenantInvoices(userId);
      }
      
      console.log("Raw API response:", apiResponse);
      
      if (!apiResponse) {
        throw new Error("No data received from API");
      }
      
      // Process the invoice data
      const allInvoices = processInvoices(apiResponse);
      console.log("Processed invoices:", allInvoices);
      console.log("Number of invoices:", allInvoices.length);
      
      setInvoices(allInvoices);
    } catch (error: any) {
      console.error("Error in fetchInvoices:", error);
      setError(error.message);
      toast.error("Failed to fetch invoices: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Process nested invoice data into a flat list with tenant and property info
const processInvoices = (data: any): Invoice[] => {
  console.log("Processing data:", data);
  
  const processed: Invoice[] = [];
  
  // Case 1: Tenant response structure (flatter structure)
  if (data.tenant && data.invoices) {
    console.log("Processing tenant invoice data");
    
    data.invoices.forEach((invoice: any) => {
      processed.push({
        ...invoice,
        tenant_name: data.tenant.name || "Unknown Tenant",
        property_name: data.property?.name || "Unknown Property",
        room_number: data.room?.room_number || "Unknown Room"
      });
    });
  }
  // Case 2: Alternative tenant response structure
  else if (Array.isArray(data.invoices)) {
    console.log("Processing alternative tenant invoice data structure");
    
    data.invoices.forEach((invoice: any) => {
      processed.push({
        ...invoice,
        tenant_name: data.tenant_name || invoice.tenant_name || "Unknown Tenant",
        property_name: data.property_name || invoice.property_name || "Unknown Property",
        room_number: data.room_number || invoice.room_number || "Unknown Room"
      });
    });
  }
  // Case 3: Landlord response structure (nested structure)
  else if (data.tenants && Array.isArray(data.tenants)) {
    console.log("Processing landlord invoice data");
    
    data.tenants.forEach((tenant: any) => {
      if (!tenant.rentals || !Array.isArray(tenant.rentals)) return;
      
      tenant.rentals.forEach((rental: any) => {
        if (!rental.invoices || !Array.isArray(rental.invoices)) return;
        
        rental.invoices.forEach((invoice: any) => {
          processed.push({
            ...invoice,
            tenant_name: tenant.tenant_name || "Unknown Tenant",
            property_name: rental.room?.property_name || "Unknown Property",
            room_number: rental.room?.room_number || "Unknown Room"
          });
        });
      });
    });
  }
  // Case 4: Direct array of invoices
  else if (Array.isArray(data)) {
    console.log("Processing direct array of invoices");
    
    data.forEach((invoice: any) => {
      processed.push({
        ...invoice,
        tenant_name: invoice.tenant_name || "Unknown Tenant",
        property_name: invoice.property_name || "Unknown Property",
        room_number: invoice.room_number || "Unknown Room"
      });
    });
  }
  // Case 5: Unknown response structure
  else {
    console.warn("Unknown data structure:", data);
  }
  
  console.log("Total processed invoices:", processed.length);
  return processed;
};

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewInvoiceOpen(true);
  };

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

  const handleDeleteInvoice = async (invoiceId: number) => {
    const invoiceIndex = invoices.findIndex(inv => inv.invoice_id === invoiceId);
    if (invoiceIndex === -1) return;

    const invoiceToDelete = invoices[invoiceIndex];
    const originalInvoices = [...invoices];

    // Optimistic update
    const updatedInvoices = invoices.filter(inv => inv.invoice_id !== invoiceId);
    setInvoices(updatedInvoices);

    toast.custom((t) => (
      <div className="flex items-center w-full max-w-sm gap-4 p-4 text-sm border rounded-lg bg-background">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Invoice deleted</span>
            <span className="text-muted-foreground">
              #{invoiceToDelete.invoice_id}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">
            This action can be undone within 5 seconds
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => {
            setInvoices(originalInvoices);
            toast.dismiss(t);
          }}
        >
          Undo
        </Button>
      </div>
    ), {
      duration: 5000,
      onAutoClose: async () => {
        try {
          // Call API to delete invoice
          // await invoiceService.deleteInvoice(invoiceId);
        } catch (error: any) {
          console.error("Invoice deletion failed:", error);
          setInvoices(originalInvoices);
          toast.error("Failed to delete invoice: " + error.message);
        }
      },
    });
  };
  
  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  // Format date from API format
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Overdue
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Calendar className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
    }
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <div className="flex gap-2">
            {userRole === 'landlord' && (
              <>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Results info */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {userRole === 'tenant' ? 'Your Invoices' : 'All Invoices'} 
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing {invoices.length} invoices
          </p>
        </div>

        {/* Tenant View - Flip Cards */}
        {userRole === 'tenant' && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {invoices.length === 0 ? (
      <div className="col-span-full py-16 text-center">
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No invoices found</h3>
        <p className="text-muted-foreground mt-1">
          You don't have any invoices at this time.
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
)}

        {/* Landlord View - Table */}
        {userRole === 'landlord' && (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Invoices</CardTitle>
              <CardDescription className="text-muted-foreground">
                {invoices.length} invoices found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Billing Month</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.invoice_id}>
                        <TableCell className="font-medium">#{invoice.invoice_id}</TableCell>
                        <TableCell>{invoice.tenant_name}</TableCell>
                        <TableCell>{invoice.property_name}</TableCell>
                        <TableCell>{invoice.room_number}</TableCell>
                        <TableCell>
                          {invoice.billing_month && format(new Date(invoice.billing_month + "-01"), "MMM yyyy")}
                        </TableCell>
                        <TableCell>{formatDate(invoice.due_date)}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount_due)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.payment_status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {invoice.payment_status !== "paid" && (
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => handleDeleteInvoice(invoice.invoice_id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {invoices.length} of {invoices.length} invoices
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {/* Invoice Details Dialog */}
        <Dialog open={viewInvoiceOpen} onOpenChange={setViewInvoiceOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Invoice #{selectedInvoice?.invoice_id}</DialogTitle>
              <DialogDescription>
                Invoice details for {selectedInvoice?.tenant_name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                  <TabsTrigger value="utilities">Utilities</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Invoice Date</p>
                      <p className="text-sm">{formatDate(selectedInvoice.invoice_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Due Date</p>
                      <p className="text-sm">{formatDate(selectedInvoice.due_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Billing Month</p>
                      <p className="text-sm">
                        {format(new Date(selectedInvoice.billing_month + "-01"), "MMMM yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm">{getStatusBadge(selectedInvoice.payment_status)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tenant</p>
                      <p className="text-sm">{selectedInvoice.tenant_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Property</p>
                      <p className="text-sm">{selectedInvoice.property_name} (Room {selectedInvoice.room_number})</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Amount Due</p>
                      <p className="text-sm font-semibold">{formatCurrency(selectedInvoice.amount_due)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-sm capitalize">{selectedInvoice.payment_method}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="breakdown" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Rent</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedInvoice.amount_breakdown.rent)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Utilities</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedInvoice.amount_breakdown.utilities)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Other Charges</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedInvoice.amount_breakdown.other_charges)}</TableCell>
                      </TableRow>
                      <TableRow className="font-semibold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedInvoice.amount_breakdown.total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="utilities" className="space-y-4">
                  <h3 className="text-md font-semibold mb-2">Water</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Previous Reading</TableCell>
                        <TableCell>{selectedInvoice.utility_details.Water.old_reading}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Current Reading</TableCell>
                        <TableCell>{selectedInvoice.utility_details.Water.new_reading}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Consumption</TableCell>
                        <TableCell>{selectedInvoice.utility_details.Water.consumption}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Rate</TableCell>
                        <TableCell>{selectedInvoice.utility_details.Water.rate}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cost</TableCell>
                        <TableCell>{formatCurrency(selectedInvoice.utility_details.Water.cost)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Reading Date</TableCell>
                        <TableCell>{formatDate(selectedInvoice.utility_details.Water.usage_date)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h3 className="text-md font-semibold mb-2 mt-4">Electricity</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Previous Reading</TableCell>
                        <TableCell>{selectedInvoice.utility_details.Electricity.old_reading}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Current Reading</TableCell>
                        <TableCell>{selectedInvoice.utility_details.Electricity.new_reading}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Consumption</TableCell>
                        <TableCell>{selectedInvoice.utility_details.Electricity.consumption}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Rate</TableCell>
                        <TableCell>{selectedInvoice.utility_details.Electricity.rate}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cost</TableCell>
                        <TableCell>{formatCurrency(selectedInvoice.utility_details.Electricity.cost)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Reading Date</TableCell>
                        <TableCell>{formatDate(selectedInvoice.utility_details.Electricity.usage_date)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewInvoiceOpen(false)}>Close</Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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