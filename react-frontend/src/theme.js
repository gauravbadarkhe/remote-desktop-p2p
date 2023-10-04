import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: "#fbc02d",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
    background: {
      paper: "#0F1925",
    },
    text: {
      primary: "#FFF",
      secondary: "#46505A",
    },
    action: {
      active: "#001E3C",
    },
    success: {
      main: "#009688",
    },
  },
});
export default theme;
