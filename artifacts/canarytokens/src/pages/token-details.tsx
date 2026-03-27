import { useRoute, useLocation } from "wouter";
import { useGetToken, useListTokenAlerts, useDeleteToken } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui-components";
import { ShieldCheck, ShieldAlert, Copy, Trash2, ArrowLeft, Clock, MapPin, Monitor, Network } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCopy } from "@/hooks/use-copy";
import { Link } from "wouter";
import { useState } from "react";

export default function TokenDetails() {
  const [, params] = useRoute("/token/:id");
  const [, setLocation] = useLocation();
  const id = params?.id || "";
  const { copy } = useCopy();
  
  const { data: token, isLoading, error } = useGetToken(id);
  const { data: alertsData, isLoading: alertsLoading } = useListTokenAlerts(id);
  
  const deleteMutation = useDeleteToken({
    mutation: {
      onSuccess: () => {
        setLocation("/");
      }
    }
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <div className="p-8 text-center animate-pulse">Decrypting data...</div>;
  if (error || !token) return <div className="p-8 text-center text-destructive font-mono">ERROR: Token not found or access denied.</div>;

  const fullUrl = `${window.location.origin}${token.triggerUrl}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Command Center
        </Link>
        <div className="flex items-center gap-2">
          {!showDeleteConfirm ? (
            <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Disarm Token
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-destructive/10 p-1 rounded-md border border-destructive/20">
              <span className="text-sm text-destructive px-2 font-medium">Are you sure?</span>
              <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate({ tokenId: token.id })} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Disarming..." : "Confirm"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Header Profile */}
      <Card className="border-t-4 border-t-primary shadow-xl bg-gradient-to-b from-card to-background relative overflow-hidden">
        {token.triggered && (
           <div className="absolute inset-0 border-4 border-destructive/50 rounded-xl pointer-events-none animate-pulse" />
        )}
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className={`p-4 rounded-xl ${token.triggered ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
              {token.triggered ? <ShieldAlert className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{token.name}</h1>
                <Badge variant={token.triggered ? "destructive" : "default"} className="uppercase tracking-widest text-[10px]">
                  {token.triggered ? "COMPROMISED" : "SECURE"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">{token.memo}</p>
              
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50 text-sm font-mono text-muted-foreground">
                <div>Type: <span className="text-foreground">{token.type.toUpperCase()}</span></div>
                <div>Created: <span className="text-foreground">{format(parseISO(token.createdAt), "MMM d, yyyy HH:mm")}</span></div>
                <div>Triggers: <span className={token.triggerCount > 0 ? "text-destructive font-bold" : "text-primary"}>{token.triggerCount}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trigger Payload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            Deployment Payload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/50 p-4 rounded-lg border border-border/50 flex flex-col md:flex-row gap-4 items-center justify-between group">
            <code className="text-primary break-all text-sm w-full md:w-auto selection:bg-primary/30">
              {fullUrl}
            </code>
            <Button variant="secondary" className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all" onClick={() => copy(fullUrl, "Payload URL copied")}>
              <Copy className="w-4 h-4 mr-2" /> Copy Payload
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Place this payload in your desired location. Any access to this resource will trigger an immediate alert.
          </p>
        </CardContent>
      </Card>

      {/* Incident Logs */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2 mt-8">
          <Clock className="w-5 h-5 text-primary" />
          Incident Logs
        </h2>
        
        {alertsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Card key={i} className="h-24 animate-pulse bg-card/40" />)}
          </div>
        ) : alertsData?.alerts?.length === 0 ? (
          <Card className="p-8 text-center bg-secondary/20 border-dashed">
            <p className="text-muted-foreground font-mono">No unauthorized access detected.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {alertsData?.alerts?.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-destructive shadow-md hover:translate-x-1 transition-transform">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive" className="font-mono">{format(parseISO(alert.triggeredAt), "HH:mm:ss")}</Badge>
                        <span className="text-sm text-muted-foreground">{format(parseISO(alert.triggeredAt), "MMM dd, yyyy")}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Monitor className="w-3 h-3"/> IP Address</div>
                          <div className="font-mono text-foreground bg-black/30 px-2 py-1 rounded inline-block">{alert.ipAddress || "Unknown"}</div>
                        </div>
                        {alert.geo && (
                          <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</div>
                            <div className="text-foreground">{alert.geo}</div>
                          </div>
                        )}
                      </div>
                      
                      {alert.userAgent && (
                        <div>
                          <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">User Agent</div>
                          <div className="text-xs text-muted-foreground font-mono bg-black/20 p-2 rounded break-all">{alert.userAgent}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
