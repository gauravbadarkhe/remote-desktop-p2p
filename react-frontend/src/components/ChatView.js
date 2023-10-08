import { Box, Container } from "@mui/material";
import { useRoom } from "../hooks/RoomProvider";

export function ChatView() {
  const { peers } = useRoom();
  return (
    <Box
      sx={{
        height: "90vh",
        bgcolor: "background.paper",
        borderLeft: ".1px solid grey",
        display: "flex",
      }}
    >
      <Box
        sx={{
          margin: "auto",
        }}
      >
        Total Peers : {peers.length}
      </Box>
    </Box>
  );
}
