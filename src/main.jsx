import { createRoot } from "react-dom/client";
import App from "../nur-armenian.jsx";

createRoot(document.getElementById("root")).render(<App />);

// Service worker — только в собранной версии (в dev мешает HMR).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => { /* офлайн-режим просто не включится */ });
  });
}
