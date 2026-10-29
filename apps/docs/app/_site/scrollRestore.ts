/**
 * Puts a reloaded page back where it was before anything paints. WebKit and Firefox paint the first frame at
 * the top and restore the scroll a moment later, so a reload mid-page flashed the hero. On a reload this
 * hides the page, scrolls to the saved place once the document exists, then shows it. Positions are saved
 * per address when leaving. Runs inline in <head>, before paint.
 */
export const SCROLL_SCRIPT = `(function(){try{
var k="plop-scroll:"+location.pathname+location.search,d=document.documentElement;
addEventListener("pagehide",function(){try{sessionStorage.setItem(k,String(Math.round(scrollY)))}catch(e){}});
var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];
var y=Number(sessionStorage.getItem(k))||0;
if(!n||n.type!=="reload"||y<=0||location.hash)return;
history.scrollRestoration="manual";
d.setAttribute("data-restoring","");
var done=false,go=function(){if(done)return;done=true;scrollTo({top:y,left:0,behavior:"instant"});d.removeAttribute("data-restoring")};
document.addEventListener("DOMContentLoaded",go);
setTimeout(go,1500);
}catch(e){}})();`;
