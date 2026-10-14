import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // "/" for CloudFront (default). GitHub Pages sets BASE_PATH=/cloudops-helpdesk-aws/
  base: process.env.BASE_PATH || "/",

  plugins: [react(), tailwindcss()],

  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),   // Employee Portal
        admin: resolve(root, "admin.html"),  // Admin Dashboard
      },
    },
  },
});