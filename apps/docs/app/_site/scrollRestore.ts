/**
 * Puts a reloaded page back where it was before anything paints. WebKit and Firefox paint the first frame at
 * the top and restore the scroll a moment later, so a reload mid-page flashed the hero. On a reload this
 * hides the page, scrolls to the saved place once the document exists, then shows it. Positions are saved
 * per address when leaving. Runs inline in <head>, before paint.
 *
 * The key is read when leaving, not when the script runs: links move between pages without a new document,
 * so the address at load time is often not the page being left. Keying it at load saved one page's position
 * under another, and a later reload of that page jumped to the bottom (seen on Android, where reloads are common).
 */
export const SCROLL_SCRIPT = `(function(){try{
var key=function(){return"plop-scroll:"+location.pathname+location.search},d=document.documentElement;
addEventListener("pagehide",function(){try{sessionStorage.setItem(key(),String(Math.round(scrollY)))}catch(e){}});
var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];
var y=Number(sessionStorage.getItem(key()))||0;
if(!n||n.type!=="reload"||y<=0||location.hash)return;
history.scrollRestoration="manual";
d.setAttribute("data-restoring","");
var done=false,go=function(){if(done)return;done=true;scrollTo({top:y,left:0,behavior:"instant"});d.removeAttribute("data-restoring")};
document.addEventListener("DOMContentLoaded",go);
setTimeout(go,1500);
}catch(e){}})();`;
