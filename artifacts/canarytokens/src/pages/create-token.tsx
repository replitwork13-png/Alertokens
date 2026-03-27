import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateToken } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Textarea, Button } from "@/components/ui-components";
import { ShieldAlert, Network, Globe, Mail, FileText, QrCode, Image as ImageIcon, Loader2 } from "lucide-react";
import { TokenType } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const TOKEN_TYPES = [
  { id: TokenType.web, name: "Web Bug / URL", icon: Network, desc: "Alerts when the URL is visited." },
  { id: TokenType.dns, name: "DNS Token", icon: Globe, desc: "Alerts when the hostname is resolved." },
  { id: TokenType.email, name: "Email Address", icon: Mail, desc: "Alerts when an email is sent to it." },
  { id: TokenType.pdf, name: "PDF Document", icon: FileText, desc: "Alerts when the PDF is opened." },
  { id: TokenType.word, name: "Word Document", icon: FileText, desc: "Alerts when the document is opened." },
  { id: TokenType.qr_code, name: "QR Code", icon: QrCode, desc: "Alerts when scanned." },
  { id: TokenType.image, name: "Image Web Bug", icon: ImageIcon, desc: "1x1 transparent image." },
];

export default function CreateToken() {
  const [, setLocation] = useLocation();
  const [type, setType] = useState<TokenType>(TokenType.web);
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [alertEmail, setAlertEmail] = useState("");

  const createMutation = useCreateToken({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/token/${data.id}`);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !memo) return;

    createMutation.mutate({
      data: {
        type,
        name,
        memo,
        alertEmail: alertEmail || undefined,
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          Generate Canary
        </h1>
        <p className="text-muted-foreground mt-1">Deploy a new tripwire to detect unauthorized access.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle>1. Select Payload Type</CardTitle>
            <CardDescription>What kind of token do you want to generate?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {TOKEN_TYPES.map((t) => {
                const isSelected = type === t.id;
                return (
                  <div 
                    key={t.id}
                    onClick={() => setType(t.id as TokenType)}
                    className={cn(
                      "cursor-pointer rounded-xl p-4 border-2 transition-all duration-200",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]" 
                        : "border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-secondary"
                    )}
                  >
                    <t.icon className={cn("w-6 h-6 mb-3", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <h3 className={cn("font-semibold mb-1", isSelected ? "text-foreground" : "text-muted-foreground")}>{t.name}</h3>
                    <p className="text-xs text-muted-foreground leading-snug">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Token Details</CardTitle>
            <CardDescription>Identify this token later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Identifier / Name <span className="text-destructive">*</span></label>
              <Input 
                placeholder="e.g., Prod DB Backup Folder" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="terminal-text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Memo / Reminder <span className="text-destructive">*</span></label>
              <Textarea 
                placeholder="Where did you put this? Why?" 
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Alert Email (Optional)</label>
              <Input 
                type="email"
                placeholder="Leave blank to use system default" 
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="terminal-text text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => setLocation("/")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            size="lg"
            disabled={!name || !memo || createMutation.isPending}
            className="w-full sm:w-auto font-bold tracking-wide"
          >
            {createMutation.isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
            ) : (
              "Deploy Canary Token"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
