import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ 1. Import Router
import { ChakraProvider } from "@chakra-ui/react"; // ✅ 2. Import UI Provider
import { AuthProvider } from "./context/AuthContext"; // 🟢 Added this line
import theme from "theme/theme"; // ✅ 3. Import Theme (Adjust path if needed)
import App from "./App"; // ✅ 4. Import the Main App

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // 5. Wrap everything in ChakraProvider (for style) AND BrowserRouter (for navigation)
  <ChakraProvider theme={theme}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </ChakraProvider>
);