import {
  Box,
  Button,
  Container,
  InputBase,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseIcon from "@mui/icons-material/Close";
import { useContext, useState } from "react";
import { InputDialog } from "./InputDialog";
import { LoadingContext } from "../context/LoadingContext";
import useRoomManager, { useRoom } from "../hooks/RoomProvider";
export function TopBar() {
  const [open, setOpen] = useState(false);
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const { initRoom, roomId, peers, leaveRoom } = useRoom();

  const openRoomPrompt = () => {
    setOpen(true);
  };

  const joinRoom = (roomId) => {
    setOpen(false);
    if (roomId) createRoom(roomId);
  };

  const createRoom = async (_roomId) => {
    try {
      setIsLoading(true);
      await initRoom(_roomId);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Stack
      direction="row"
      spacing={2}
      justifyContent="center"
      alignItems="center"
      sx={{
        height: "10vh",
        padding: "10px",
        borderBottom: ".1px solid grey",
        bgcolor: "background.paper",
      }}
    >
      {open && <InputDialog onSubmit={joinRoom}></InputDialog>}

      {roomId ? (
        <Stack
          spacing={2}
          direction="row"
          useFlexGap
          alignItems="center"
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Box
            sx={{ color: "text.primary", fontSize: 15, fontWeight: "medium" }}
          >
            Room : {roomId}
          </Box>
          <Button
            variant="contained"
            color="error"
            endIcon={<CloseIcon />}
            onClick={leaveRoom}
          >
            Leave Room
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={openRoomPrompt}
            startIcon={<GroupsRoundedIcon />}
          >
            Join Room
          </Button>
          <Button
            variant="contained"
            endIcon={<AddRoundedIcon />}
            onClick={(e) => createRoom()}
          >
            Create Room
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
