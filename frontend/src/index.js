// src/index.js
import React from "react";
import { createRoot } from "react-dom/client"; // ⬅️ React 18
import CssBaseline from "@material-ui/core/CssBaseline";
import * as serviceWorker from "./serviceWorker";
import App from "./App";

// Chamamos window.finishProgress() após o primeiro render
function Boot() {
  React.useEffect(() => {
    if (typeof window !== "undefined" && typeof window.finishProgress === "function") {
      // aguarda um frame para garantir que a UI foi pintada
      requestAnimationFrame(() => window.finishProgress());
    }
  }, []);

  return (
    <>
      <CssBaseline />
      <App />
    </>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);

// Se quiser, pode envolver com <React.StrictMode>, mas algumas libs antigas geram warnings
root.render(<Boot />);

serviceWorker.register();
