import { useListTokens, useGetStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui-components";
import { AlertTriangle, ShieldCheck, Copy, ExternalLink, Activity, Network, FileText, Mail, QrCode, Image as ImageIcon, Globe, PlusCircle } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Link } from "wouter";
import { useCopy } from "@/hooks/use-copy";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const getTokenIcon = (type: string) => {
  switch (type) {
    case 'web': return <Network className="w-4 h-4" />;
    case 'dns': return <Globe className="w-4 h-4" />;
    case 'email': return <Mail className="w-4 h-4" />;
    case 'pdf': 
    case 'word': return <FileText className="w-4 h-4" />;
    case 'qr_code': return <QrCode className="w-4 h-4" />;
    case 'image': return <ImageIcon className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: tokensData, isLoading: tokensLoading } = useListTokens({ page: 1, limit: 100 });
  const { copy } = useCopy();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your active canary tokens.</p>
        </div>
        <Link 
          href="/create" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-md font-medium shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Deploy Token
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {statsLoading ? "..." : stats?.totalTokens || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-destructive/5 border-destructive/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-destructive">
            <AlertTriangle className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compromised Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-destructive">
              {statsLoading ? "..." : stats?.triggeredTokens || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {statsLoading ? "..." : stats?.totalAlerts || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token List */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Deployed Arsenal
        </h2>
        
        {tokensLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse h-40 bg-card/40" />
            ))}
          </div>
        ) : tokensData?.tokens?.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
            <ShieldCheck className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">No tokens deployed</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Create your first canary token to start monitoring your infrastructure for unauthorized access.
            </p>
            <Link href="/create" className="mt-6 text-primary hover:underline font-medium">
              Create a Token →
            </Link>
          </Card>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {tokensData?.tokens?.map((token) => (
              <motion.div variants={item} key={token.id}>
                <Card className={cn(
                  "hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden",
                  token.triggered ? "border-destructive/30 bg-destructive/5" : "border-border/50"
                )}>
                  {token.triggered && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-destructive" />
                  )}
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-widest gap-1 border-primary/30 text-primary">
                          {getTokenIcon(token.type)}
                          {token.type}
                        </Badge>
                        {token.triggered && (
                          <Badge variant="destructive" className="animate-pulse">
                            TRIGGERED
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="truncate pr-4 group-hover:text-primary transition-colors">
                        <Link href={`/token/${token.id}`}>{token.name}</Link>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                      {token.memo || "No memo provided."}
                    </p>
                    <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {token.triggerCount} triggers
                      </span>
                      <span>
                        {token.lastTriggeredAt 
                          ? formatDistanceToNow(parseISO(token.lastTriggeredAt), { addSuffix: true })
                          : "Never triggered"}
                      </span>
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-secondary/50 border-t border-border/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        copy(token.triggerUrl);
                      }}
                    >
                      <Copy className="w-3 h-3" /> Copy URL
                    </Button>
                    <Link href={`/token/${token.id}`} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
