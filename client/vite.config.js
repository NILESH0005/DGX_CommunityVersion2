// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import path from "path";

// const isProduction = process.env.NODE_ENV;

export default defineConfig({
  plugins: [react()],
  base: "/",
  // base: "/DGX_Community/",
  assetsInclude: ["**/*.woff", "**/*.woff2", "**/*.ttf"],
});
