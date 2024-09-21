import {loadDefaultColors, loadColorScript} from "/assets/omino/Colors.js";
window.exportMod=mod=>{
  loadDefaultColors(mod);
};
await import("/assets/omino/colorfiles/default.js");

if(![...new URLSearchParams(window.location.search).entries()].some(([k,v])=>k=="safeMode"&&v=="true")){
  let script=localStorage.getItem("Colorfile");
  if(script) loadColorScript(script);
}