import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import StarRating from "./StartRating";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRatings={10} />
    <StarRating maxRatings={5} color="#000" size={100} /> */}
  </React.StrictMode>
);
