import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

export function useCopy() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const copy = useCallback((text: string, description: string = "Copied to clipboard") => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      toast({
        title: "Success",
        description,
        variant: "default",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    });
  }, [toast]);

  return { isCopied, copy };
}
