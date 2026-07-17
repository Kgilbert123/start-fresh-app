import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

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

function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Search marketplaces and review the latest profitable finds.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          Backend integration ready
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">New search</CardTitle>
          <CardDescription>Enter a product or keyword to scan for deals.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="e.g. vintage camera, graphics card, collectible..." className="pl-9" />
            </div>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Scan deals
            </Button>
            <Button type="button" variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent deals</CardTitle>
          <CardDescription>Results will appear here once your backend is connected.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/50 p-8 text-center">
            <p className="text-sm font-medium text-foreground">No deals yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Run a search or connect your scraper backend to populate this list.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
