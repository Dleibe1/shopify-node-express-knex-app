import { useMemo } from "react";
import { useLocation, useNavigate, BrowserRouter } from "react-router-dom";
import createApp from '@shopify/app-bridge';

export function MyApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const history = useMemo(() => ({ replace: (path) => navigate(path, { replace: true }) }), [navigate]);

  const config = useMemo(() => {
    const apiKey = process.env.SHOPIFY_API_KEY; 
    const shopOrigin = new URLSearchParams(window.location.search).get("shop");
    const host = new URLSearchParams(window.location.search).get("host");  // Extract the host parameter from the URL

    if (!apiKey || !shopOrigin || !host) {
      console.error("Shopify API key, shop origin, or host is missing!");
      return null;
    }

    return {
      apiKey,
      shopOrigin,
      host,  // Pass the host parameter
      forceRedirect: true,
    };
  }, [location.search]);

  if (!config) {
    return <p>Error: Shopify API key, shop origin, or host is missing!</p>;
  }

  const appBridge = createApp(config);

  return (
    <div>
      {/* Use App Bridge functionality here */}
      <p>Your app is running with App Bridge</p>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <MyApp />
    </BrowserRouter>
  );
}
