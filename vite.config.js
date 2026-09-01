import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Номер сборки — момент запуска dev-сервера или сборки (МСК).
// Обновляется при каждом `npm run dev` и `npm run build`.
const BUILD = new Date().toLocaleString("ru-RU", {
  timeZone: "Europe/Moscow",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default defineConfig({
  // относительные пути — приложение работает и в корне домена, и в подпапке
  // (например, https://user.github.io/repo/)
  base: "./",
  plugins: [react()],
  server: { port: 5173 },
  define: {
    __BUILD__: JSON.stringify(BUILD),
  },
});
