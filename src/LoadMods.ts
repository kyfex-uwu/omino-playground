import {loadColorScript, loadDefaultColors} from "omino/Colors.js";

//@ts-expect-error
window.exportMod =
    (mod:any) => {
        loadDefaultColors(mod);
    };
await import("omino/colorfiles/default.js");

if (![...new URLSearchParams(window.location.search).entries()].some(([k, v]) => k == "safeMode" && v == "true")) {
    let script = localStorage.getItem("Colorfile");
    if (script) loadColorScript(script);
}
