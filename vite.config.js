import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so the production build can be served
// from any subfolder (or a simple static host).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
