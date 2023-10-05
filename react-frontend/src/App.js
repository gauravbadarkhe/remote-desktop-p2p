import logo from "./logo.svg";
import "./App.css";
import Button from "@mui/material/Button";
import { Box, Container, Grid } from "@mui/material";
import { TopBar } from "./components/TopBar";
import { VideoView } from "./components/VideoView";
import { ChatView } from "./components/ChatView";

function App() {
  return (
    <Grid container direction="column">
      <Grid item xs={6} justifyContent="center">
        <TopBar />
      </Grid>
      <Grid container item xs={6} direction="row">
        <Grid item xs={8}>
          <VideoView />
        </Grid>
        <Grid item xs={4}>
          <ChatView />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
