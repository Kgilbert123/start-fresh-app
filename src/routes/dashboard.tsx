import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/login-form";
import { DealDetailDialog } from "@/components/deal-detail-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, RefreshCw, ShieldAlert, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DealScout" },
      { name: "description", content: "Scan marketplaces and review profitable deals." },
      { property: "og:title", content: "Dashboard — DealScout" },
      { property: "og:description", content: "Scan marketplaces and review profitable deals." },
    ],
  }),
  component: Dashboard,
});

type DealRow = {
  listing_id: string;
  title: string;
  platform: string;
  listing_type: string;
  asking_price: number | null;
  current_bid: number | null;
  shipping_cost: number | null;
  seller_name: string | null;
  seller_rating: number | null;
  status: string | null;
  confidence_tier: string | null;
  seller_flagged: boolean | null;
  estimated_profit: number | null;
  max_buy_price: number | null;
  total_cost: number | null;
  priced_item_count: number | null;
  total_item_count: number | null;
  computed_at: string | null;
  external_url: string | null;
};

const STATUS_PRIORITY: Record<string, number> = {
  buy: 0,
  negotiate: 1,
  need_authenticity_check: 2,
  watch_do_not_bid: 3,
  need_data: 4,
  pass: 5,
};

const STATUS_LABEL: Record<string, string> = {
  buy: "Buy",
  negotiate: "Negotiate",
  need_authenticity_check: "Needs authenticity check",
  watch_do_not_bid: "Watch — don't bid yet",
  need_data: "Needs pricing",
  pass: "Pass",
};

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="outline">Unscored</Badge>;
  const variant =
    status === "buy"
      ? "default"
      : status === "negotiate"
      ? "secondary"
      : status === "need_authenticity_check"
      ? "destructive"
      : "outline";
  return <Badge variant={variant}>{STATUS_LABEL[status] ?? status}</Badge>;
}

function Dashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedListing, setSelectedListing] = useState<{ id: string; title: string; externalUrl: string | null } | null>(null);

  const { data: deals, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["deals_feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals_feed")
        .select("*")
        .order("computed_at", { ascending: false });
      if (error) throw error;
      return data as DealRow[];
    },
    enabled: isAuthenticated,
  });

  const sortedDeals = useMemo(() => {
    if (!deals) return [];
    const filtered = search.trim()
      ? deals.filter((d) => d.title.toLowerCase().includes(search.trim().toLowerCase()))
      : deals;
    return [...filtered].sort((a, b) => {
      const pa = STATUS_PRIORITY[a.status ?? ""] ?? 9;
      const pb = STATUS_PRIORITY[b.status ?? ""] ?? 9;
      if (pa !== pb) return pa - pb;
      return (b.estimated_profit ?? -Infinity) - (a.estimated_profit ?? -Infinity);
    });
  }, [deals, search]);

  const actionableCount = useMemo(
    () => (deals ?? []).filter((d) => d.status === "buy" || d.status === "negotiate").length,
    [deals],
  );

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {deals ? `${deals.length} listings tracked` : "Loading..."} — sorted by actionable status first.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {actionableCount} actionable {actionableCount === 1 ? "deal" : "deals"}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filter</CardTitle>
          <CardDescription>
            New listings arrive automatically every hour via the eBay watchlist scan — this searches what's already tracked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter by title..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tracked deals</CardTitle>
          <CardDescription>Click a row to see its full line-item breakdown.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {!isLoading && sortedDeals.length === 0 && (
            <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/50 p-8 text-center">
              <p className="text-sm font-medium text-foreground">No deals match</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                {search ? "Try a different search term." : "The hourly scan hasn't found anything yet."}
              </p>
            </div>
          )}

          {!isLoading && sortedDeals.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Asking</TableHead>
                  <TableHead className="text-right">Est. Profit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDeals.map((deal) => (
                  <TableRow
                    key={deal.listing_id}
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedListing({ id: deal.listing_id, title: deal.title, externalUrl: deal.external_url })
                    }
                  >
                    <TableCell className="max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{deal.title}</span>
                        {deal.seller_flagged && (
                          <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
                        )}
                        {deal.external_url && (
                          <a
                            href={deal.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                            title="View original listing"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {deal.platform} · {deal.seller_name ?? "unknown seller"}
                        {deal.confidence_tier === "low_confidence" ? " · low confidence" : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      {deal.current_bid != null
                        ? `$${deal.current_bid.toFixed(2)} (bid)`
                        : deal.asking_price != null
                        ? `$${deal.asking_price.toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {deal.estimated_profit != null ? (
                        <span className={deal.estimated_profit >= 0 ? "text-green-600" : "text-destructive"}>
                          ${deal.estimated_profit.toFixed(2)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={deal.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DealDetailDialog
        listingId={selectedListing?.id ?? null}
        title={selectedListing?.title ?? null}
        externalUrl={selectedListing?.externalUrl ?? null}
        open={!!selectedListing}
        onOpenChange={(open) => !open && setSelectedListing(null)}
      />
    </div>
  );
}
