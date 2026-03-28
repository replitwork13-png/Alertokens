import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { ThemeProvider } from "@/contexts/theme-context";
import { StoreProvider } from "@/contexts/store-context";
import Dashboard from "@/pages/dashboard";
import CreateToken from "@/pages/create-token";
import TokenDetails from "@/pages/token-details";
import Faq from "@/pages/faq";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/create" component={CreateToken} />
        <Route path="/token/:id" component={TokenDetails} />
        <Route path="/faq" component={Faq} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <TooltipProvider>
          <WouterRouter hook={useHashLocation}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;
