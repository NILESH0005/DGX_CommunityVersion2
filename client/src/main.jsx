// src/main.jsx
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import 'react-loading-skeleton/dist/skeleton.css';
import "react-toastify/dist/ReactToastify.css";
import ApiProvider from "./context/ApiProvider.jsx";
import { ConfirmationModalProvider } from "./context/ConfirmationModalContext.jsx"; // Import the Provider

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>

    <ConfirmationModalProvider>
      <ApiProvider>
        {/* Wrap with the Provider */}
        <App />

      </ApiProvider>
    </ConfirmationModalProvider>
  </BrowserRouter>

);