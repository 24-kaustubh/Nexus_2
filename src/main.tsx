console.log("✅ RUNNING DEV BUILD @", new Date().toISOString());
console.log("ENV VITE_API_URL =", import.meta.env.VITE_API_URL);

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("ENV VITE_API_URL =", import.meta.env.VITE_API_URL);

createRoot(document.getElementById("root")!).render(<App />);
