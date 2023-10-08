import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
} from "@mui/material";
import ReactLoading from "react-loading";
import theme from "../theme";
import React from "react";

export function LoadingOverLay() {
  return (
    <Dialog open={true}>
      <DialogContent>
        <ReactLoading color={theme.palette.primary.main} type="bubbles" />
      </DialogContent>
    </Dialog>
  );
}
