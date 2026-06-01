import { Icon } from "@expo/ui";

export const ADD_ICON = Icon.select({
  ios: "plus",
  android: require("@expo/material-symbols/add.xml"),
});

export const DELETE_ICON = Icon.select({
  ios: "trash",
  android: require("@expo/material-symbols/delete.xml"),
});

export const MENU_ICON = Icon.select({
  ios: "ellipsis",
  android: require("@expo/material-symbols/more_vert.xml"),
});
