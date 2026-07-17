import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DealScout — Find profitable deals across marketplaces" },
      { name: "description", content: "A clean deal scanner that surfaces profitable purchases from eBay and other marketplaces." },
      { property: "og:title", content: "DealScout — Find profitable deals across marketplaces" },
      { property: "og:description", content: "A clean deal scanner that surfaces profitable purchases from eBay and other marketplaces." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
        <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
          <span className="mr-2 flex h-2 w-2 rounded-full bg-primary" />
          Deal scanning made simple
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Find profitable purchases across marketplaces
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          DealScout scans eBay and other sites to surface deals worth buying. Clean, fast, and ready to plug into your backend.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/dashboard">Open dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/dashboard">View demo</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Search className="h-5 w-5" />}
            title="Multi-site search"
            description="Query eBay and more marketplaces from one place."
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Profit signals"
            description="Spot undervalued listings with clear metrics."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Real-time updates"
            description="Fresh results as new deals are discovered."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Your auth, your data"
            description="Built to connect to your existing backend."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
