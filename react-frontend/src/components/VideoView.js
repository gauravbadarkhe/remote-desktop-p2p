import { Box, Container } from "@mui/material";

export function VideoView() {
  return (
    <Box
      sx={{
        height: "90vh",
        borderRight: ".1px solid grey",
        bgcolor: "background.paper",
        display: "flex",
      }}
    >
      <Box
        sx={{
          margin: "auto",
        }}
      >
        VideoView
      </Box>
    </Box>
  );
}
