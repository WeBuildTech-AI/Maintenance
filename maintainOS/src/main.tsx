// src/main.tsx
import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { store } from "./store";
import "./index.css";
import { AppToaster } from "./components/ui/use-toast";
import reportWebVitals from "./reportWebVitals.ts";
// import { Integrations } from "@sentry/tracing";

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


// process.env.NODE_ENV === "production" &&
Sentry.init({
  dsn: "https://3957e8b9ad41259ba14d961dd3fbf7ac@o4510269113106432.ingest.de.sentry.io/4510271291654224",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),  // ✅ replaces BrowserTracing from '@sentry/tracing'
    Sentry.replayIntegration(),          // optional: for session replay
  ],
  
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control, should be around 0.2 in production
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const root = document.getElementById("root")!;

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppToaster/>
          <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
