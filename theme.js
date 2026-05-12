import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#22c55e" }, // premium green
    background: {
      default: "#050816",
      paper: "rgba(255,255,255,0.08)"
    },
    text: {
      primary: "#ffffff",
      secondary: "#9ca3af"
    }
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h3: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 }
  },
  shape: { borderRadius: 14 }
});

export default theme;
