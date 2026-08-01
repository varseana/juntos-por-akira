import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    // Permite el proxy de AgentSpaces / DevSpaces.
    allowedHosts: [".proxy.devspaces.amazon.dev"],
  },
  preview: {
    host: true,
    port: 3000,
    allowedHosts: [".proxy.devspaces.amazon.dev"],
  },
});
