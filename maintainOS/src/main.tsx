// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { store } from "./store";
import "./index.css";
import { AppToaster } from "./components/ui/use-toast";


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
