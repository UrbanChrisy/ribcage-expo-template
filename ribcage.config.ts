import { defineConfig } from "@ribcage/config";

export default defineConfig({
  "name": "Untitled",
  "routes_directory": "./src/app",
  "port": 8081,
  "aliases": {
    "core": "@/core",
    "modules": "@/modules",
    "lib": "@/lib",
    "components": "@/components",
    "hooks": "@/hooks",
    "utils": "@/utils",
    "types": "@/types",
    "assets": "@/assets",
    "styles": "@/styles"
  },
  "clients": {},
  "routes": {
    "index.tsx": {
      "path": "index.tsx",
      "type": "screen",
      "enabled": true,
      "name": "index",
      "config": {
        "containerType": "View"
      }
    }
  }
});
