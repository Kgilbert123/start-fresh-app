import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ExternalLink, CheckCircle2, EyeOff } from "lucide-react";

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

type DealSummary = {
  status: string | null;
  flag_reasons: string[] | null;
  reviewed_at: string | null;
  dismissed: boolean;
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
  const queryClient = useQueryClient();

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

  const { data: summary } = useQuery({
    queryKey: ["deal_summary", listingId],
    queryFn: async () => {
      if (!listingId) return null;
      const { data, error } = await supabase
        .from("deals_feed")
        .select("status, flag_reasons, reviewed_at, dismissed")
        .eq("listing_id", listingId)
        .maybeSingle();
      if (error) throw error;
      return data as DealSummary | null;
    },
    enabled: open && !!listingId,
  });

  const updateListing = useMutation({
    mutationFn: async (patch: Partial<Pick<DealSummary, "dismissed" | "reviewed_at">>) => {
      if (!listingId) return;
      const { error } = await supabase.from("listings").update(patch).eq("id", listingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals_feed"] });
      queryClient.invalidateQueries({ queryKey: ["deal_summary", listingId] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-6">{title}</DialogTitle>
          <DialogDescription>Line-item breakdown behind this deal's score.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {externalUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View original listing
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateListing.mutate({ reviewed_at: summary?.reviewed_at ? null : new Date().toISOString() })
            }
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {summary?.reviewed_at ? "Mark unreviewed" : "Mark reviewed"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateListing.mutate({ dismissed: !summary?.dismissed })}
          >
            <EyeOff className="mr-2 h-4 w-4" />
            {summary?.dismissed ? "Restore" : "Dismiss"}
          </Button>
        </div>

        {summary?.flag_reasons && summary.flag_reasons.length > 0 && (
          <div className="rounded-md border border-border bg-muted/50 p-3">
            <p className="mb-2 text-xs font-medium text-foreground">Why this status:</p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              {summary.flag_reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
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
