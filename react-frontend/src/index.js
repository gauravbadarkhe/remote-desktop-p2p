import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import theme from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LoadingContext } from "./context/LoadingContext";
import { LoadingOverLay } from "./components/LoadingOverlay";
import { RoomProvider } from "./hooks/RoomProvider";
import ResponsiveApp from "./components/ResponsiveApp";

function Application() {
  const [isLoading, setIsLoading] = useState();
  const value = useMemo(() => ({ isLoading, setIsLoading }), [isLoading]);

  return (
    <LoadingContext.Provider value={value}>
      <RoomProvider>
        {isLoading && <LoadingOverLay />}
        <App />
        {/* <ResponsiveApp></ResponsiveApp> */}
        {/* What does this really do?? Is it Efficiency????
      {useMemo(
        () => (
          <>
            <App />
          </>
        ),
        []
      )} */}
      </RoomProvider>
    </LoadingContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Application />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
