import { getParamFromUrl } from "./function.js";

document
    .getElementById("orderId")
    .innerText = getParamFromUrl("id");