const SuccessBox: Electron.MessageBoxOptions = {
  message: "Level added to save file!",
  type: "none",
  buttons: ["OK"],
  title: "Great success!",
};

const WriteErrorBox: Electron.MessageBoxOptions = {
  message: "Error writing save file!",
  type: "error",
  buttons: ["OK"],
  title: "Error!",
};

const InvalidDFBox: Electron.MessageBoxOptions = {
  message: "Invalid Dash file!",
  type: "error",
  buttons: ["OK"],
  title: "Error!",
};

const OpenDialog: Electron.OpenDialogOptions = {
  title: "Open dash file",
  filters: [{ name: "Dashfile", extensions: ["dash"] }],
};

const ErrorBox = (ErrorText: string): Electron.MessageBoxOptions => {
  return {
    message: ErrorText,
    type: "error",
    buttons: ["OK"],
    title: "Error!",
  };
};

export { SuccessBox, WriteErrorBox, InvalidDFBox, OpenDialog, ErrorBox };
