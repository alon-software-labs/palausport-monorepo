import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import faviconUrl from "@repo/assets/favicon.ico";
import "./index.css";

const existing = document.querySelector<HTMLLinkElement>("link[rel='icon']");
if (existing) {
  existing.href = faviconUrl;
} else {
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.href = faviconUrl;
  document.head.appendChild(link);
}

createRoot(document.getElementById("root")!).render(<App />);
