import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/pagesRoutes";
import { ConfigProvider } from "antd";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import "./global.scss";
import { Provider } from "react-redux";
import { store } from "./services/store";

function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

function App() {
  const { theme } = useTheme();

  const getCssVar = (name:string, fallback:string) =>
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback;

  const [tokens, setTokens] = useState({
    colorPrimary: "#A6FF4D",
    colorBgContainer: "#23252B",
    colorBgLayout: "#181A20",
    colorText: "#ffffff",
    colorBorder: "#444",
    colorTextPlaceholder: "#aaa",
  });

  useEffect(() => {
    // Run after ThemeProvider has applied the class to documentElement
    const colorPrimary = getCssVar("--accent", "#A6FF4D");
    const colorBgContainer = getCssVar("--sider-bg", "#23252B");
    const colorBgLayout = getCssVar("--bg", "#181A20");
    const colorText = getCssVar("--sider-text", "#ffffff");
    const colorBorder = getCssVar("--muted", "#444");
    const colorTextPlaceholder = getCssVar("--placeholder", "#aaa");

    setTokens({
      colorPrimary,
      colorBgContainer,
      colorBgLayout,
      colorText,
      colorBorder,
      colorTextPlaceholder,
    });
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        token: tokens,
      }}
    >

       <Provider store={store}>

      <RouterProvider router={router} />
       </Provider>
    </ConfigProvider>
  );
}

export default AppWrapper;
