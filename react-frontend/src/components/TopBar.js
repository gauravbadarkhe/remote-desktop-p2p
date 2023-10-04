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
export function TopBar() {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState(false);
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const openRoomPrompt = () => {
    setOpen(true);
  };

  const handleClose = (roomId) => {
    setOpen(false);
    setRoomId(roomId);
  };
  const handleLeaveRoom = () => {
    setRoomId();
  };
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        padding: "10px",
        borderBottom: ".1px solid grey",
        bgcolor: "background.paper",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {open && <InputDialog onSubmit={handleClose}></InputDialog>}

      {roomId ? (
        <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap>
          <Box
            sx={{ color: "text.primary", fontSize: 20, fontWeight: "medium" }}
          >
            Room : {roomId}
          </Box>
          <Button
            variant="contained"
            color="error"
            endIcon={<CloseIcon />}
            onClick={handleLeaveRoom}
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
            onClick={(e) => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
              }, 3000);
            }}
          >
            Create Room
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
