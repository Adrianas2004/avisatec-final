import { useEffect } from "react";
import { router } from "expo-router";

import {
  validarAcceso
} from "../lib/validarAcceso";

export default function IndexScreen() {

  useEffect(() => {

    validarAcceso(router);

  }, []);

  return null;

}