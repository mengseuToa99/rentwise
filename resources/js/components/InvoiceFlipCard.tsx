"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  X,
  User,
  Home,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Invoice } from "@/services/api/types/invoice";

interface InvoiceFlipCardProps {
  invoice: Invoice;
  onMarkAsPaid: (invoice: Invoice) => void;
}

const InvoiceFlipCard: React.FC<InvoiceFlipCardProps> = ({ invoice, onMarkAsPaid }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };
  
  const formatBillingMonth = (monthString: string) => {
    if (!monthString) return "";
    return format(new Date(monthString + "-01"), "MMMM yyyy");
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
  
  // Calculate days remaining or days overdue
  const getDaysInfo = () => {
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (invoice.payment_status === 'paid') {
      return null;
    } else if (diffDays > 0) {
      return (
        <p className="text-xs text-yellow-600">
          {diffDays} {diffDays === 1 ? 'day' : 'days'} remaining
        </p>
      );
    } else {
      return (
        <p className="text-xs text-red-600">
          {Math.abs(diffDays)} {Math.abs(diffDays) === 1 ? 'day' : 'days'} overdue
        </p>
      );
    }
  };

  return (
    <div className="perspective-1000 h-[28rem] w-full" onClick={handleFlip}>
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
        isFlipped ? "rotate-y-180" : ""
      }`}>
        {/* Front of the card */}
        <div className={`absolute w-full h-full backface-hidden ${
          isFlipped ? "invisible" : "visible"
        } bg-card rounded-xl shadow border p-6 flex flex-col cursor-pointer`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-card-foreground">Invoice #{invoice.invoice_id}</h3>
              <p className="text-base text-muted-foreground mt-1">{formatBillingMonth(invoice.billing_month)}</p>
            </div>
            <div className="flex flex-col items-end">
              {getStatusBadge(invoice.payment_status)}
              {getDaysInfo()}
            </div>
          </div>
          
          <div className="flex-grow grid grid-cols-2 gap-6 py-3">
            <div className="flex items-center text-lg">
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Tenant:</span>
              <span className="ml-2 font-medium text-card-foreground truncate">{invoice.tenant_name}</span>
            </div>
            
            <div className="flex items-center text-lg">
              <Home className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Room:</span>
              <span className="ml-2 font-medium text-card-foreground truncate">
                {invoice.room_number}, {invoice.property_name}
              </span>
            </div>
            
            <div className="flex items-center text-lg">
              <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className="ml-2 font-medium text-card-foreground">{formatDate(invoice.due_date)}</span>
            </div>
            
            <div className="flex items-center text-lg">
              <DollarSign className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Amount:</span>
              <span className="ml-2 font-medium text-card-foreground">{formatCurrency(invoice.amount_due)}</span>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            {invoice.payment_status !== "paid" && (
              <Button 
                variant="outline" 
                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsPaid(invoice);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Paid
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2 text-muted-foreground text-base">
              <span>Click to view details</span>
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
        </div>
        
        {/* Back of the card */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 ${
          isFlipped ? "visible" : "invisible"
        } bg-card rounded-xl shadow border p-6 flex flex-col cursor-pointer`}>
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-semibold text-card-foreground">Invoice Details</h3>
            <X 
              className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-foreground" 
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            />
          </div>
          
          <div className="h-full flex flex-col justify-between mt-4">
            <div>
              <div className="grid grid-cols-2 gap-5 text-base mb-5">
                <div>
                  <p className="text-muted-foreground">Invoice Date:</p>
                  <p className="font-medium text-lg">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date:</p>
                  <p className="font-medium text-lg">{formatDate(invoice.due_date)}</p>
                </div>
              </div>
              
              <div className="mb-5">
                <h4 className="text-lg font-semibold mb-2">Breakdown</h4>
                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex justify-between text-base mb-2">
                    <span>Rent</span>
                    <span>{formatCurrency(invoice.amount_breakdown.rent)}</span>
                  </div>
                  <div className="flex justify-between text-base mb-2">
                    <span>Utilities</span>
                    <span>{formatCurrency(invoice.amount_breakdown.utilities)}</span>
                  </div>
                  <div className="flex justify-between text-base mb-2">
                    <span>Other Charges</span>
                    <span>{formatCurrency(invoice.amount_breakdown.other_charges)}</span>
                  </div>
                  <div className="border-t border-border mt-2 pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(invoice.amount_breakdown.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-base">
              <div>
                <span className="text-muted-foreground">Status: </span>
                <span>{getStatusBadge(invoice.payment_status)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Method: </span>
                <span className="capitalize">{invoice.payment_method}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFlipCard;