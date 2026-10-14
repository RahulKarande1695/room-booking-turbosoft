import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target = "http://localhost:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/customers": target, "/rooms": target, "/bookings": target },
  },
});