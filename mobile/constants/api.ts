import Constants from "expo-constants";

const debuggerHost =
  Constants.expoConfig?.hostUri;

const host = debuggerHost?.split(":").shift();

export const API_URL =
  `http://${host}:3000`;