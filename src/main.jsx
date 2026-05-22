import React from "react";
import { createRoot } from "react-dom/client";
import SmoothieRandomizer from "./smoothie randomizer.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SmoothieRandomizer />
  </React.StrictMode>
);
