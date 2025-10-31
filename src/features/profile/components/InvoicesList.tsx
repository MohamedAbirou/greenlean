import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ExternalLink, FileText, Loader } from "lucide-react";
import React from "react";
import type { Invoice } from "../types/profile.types";

interface InvoicesListProps {
  invoices: Invoice[];
  isLoading: boolean;
}

export const InvoicesList: React.FC<InvoicesListProps> = ({ invoices, isLoading }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "badge-green";
      case "open":
        return "badge-blue";
      case "void":
        return "badge-gray";
      case "uncollectible":
        return "badge-red";
      default:
        return "badge-gray";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No invoices yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="px-0 py-6">
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium">
                    {formatCurrency(invoice.amount_paid, invoice.currency)}
                  </span>
                  <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(invoice.created)}
                  {invoice.period_start && invoice.period_end && (
                    <span className="ml-2">
                      • Period: {formatDate(invoice.period_start)} -{" "}
                      {formatDate(invoice.period_end)}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                {invoice.hosted_invoice_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={invoice.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                )}
                {invoice.invoice_pdf && (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={invoice.invoice_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
