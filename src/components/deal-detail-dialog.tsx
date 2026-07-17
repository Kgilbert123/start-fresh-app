import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

type LineItem = {
  id: string;
  identity_status: string;
  set_number: string | null;
  item_name: string;
  quantity: number;
  unit_price: number | null;
  price_source: string | null;
  authenticity_status: string;
  authenticity_notes: string | null;
};

export function DealDetailDialog({
  listingId,
  title,
  externalUrl,
  open,
  onOpenChange,
}: {
  listingId: string | null;
  title: string | null;
  externalUrl?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: lineItems, isLoading } = useQuery({
    queryKey: ["line_items", listingId],
    queryFn: async () => {
      if (!listingId) return [];
      const { data, error } = await supabase
        .from("line_items")
        .select("*")
        .eq("listing_id", listingId)
        .order("set_number", { ascending: true });
      if (error) throw error;
      return data as LineItem[];
    },
    enabled: open && !!listingId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-6">{title}</DialogTitle>
          <DialogDescription>Line-item breakdown behind this deal's score.</DialogDescription>
        </DialogHeader>

        {externalUrl && (
          <Button variant="outline" size="sm" asChild className="w-fit">
            <a href={externalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View original listing
            </a>
          </Button>
        )}

        {isLoading && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {!isLoading && lineItems && lineItems.length === 0 && (
          <p className="text-sm text-muted-foreground">No line items recorded for this deal.</p>
        )}

        {!isLoading && lineItems && lineItems.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Set #</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-xs">
                    <div className="truncate font-medium">{item.item_name}</div>
                    {item.price_source && (
                      <div className="truncate text-xs text-muted-foreground">{item.price_source}</div>
                    )}
                    {item.authenticity_status !== "verified" && (
                      <Badge variant="destructive" className="mt-1">
                        {item.authenticity_status === "needs_check" ? "Needs authenticity check" : "Flagged"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.set_number ?? "—"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {item.unit_price != null ? `$${item.unit_price.toFixed(2)}` : "NO DATA"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.identity_status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
