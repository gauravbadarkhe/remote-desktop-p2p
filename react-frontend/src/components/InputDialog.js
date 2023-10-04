import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

export function InputDialog({ onSubmit }) {
  const [roomId, setRoomId] = useState();
  const handleClose = () => {
    onSubmit(roomId);
  };

  return (
    <Dialog open={true} onClose={handleClose}>
      <DialogContent>
        <DialogContentText>
          <Box
            sx={{ color: "text.primary", fontSize: 25, fontWeight: "medium" }}
          >
            Enter the Room Id You'd Like to Join
          </Box>
        </DialogContentText>
        <TextField
          onChange={(e) => setRoomId(e.target.value)}
          autoFocus
          margin="dense"
          id="roomId"
          label="Room Id"
          type="text"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Join</Button>
      </DialogActions>
    </Dialog>
  );
}
