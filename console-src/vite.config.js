// Console admin Zeyds : application React construite dans /console (servie par Vercel).
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root,
  base: "/console/",
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("../console", import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
    target: "es2020",
  },
});
