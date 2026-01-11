
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { WalletContextProvider } from "./components/WalletContextProvider";

  // Polyfills
  import { Buffer } from 'buffer';
  window.Buffer = Buffer;
  // @ts-ignore
  window.global = window;

  createRoot(document.getElementById("root")!).render(
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  );

  