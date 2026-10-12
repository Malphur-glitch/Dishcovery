/* ==========================================================================
   DISHCOVERY | WEIGHTED (SMOOTH) SCROLLING FOR THE WHOLE SITE
   Same feel as the About page: the mouse wheel does not jump the page. Each wheel notch sets
   a target and the page glides toward it, easing out at the end.

   Tune it with the two numbers below:
     EASE   0.04 = very heavy and floaty ... 0.2 = light and quick.   (0.085 = same as About)
     SPEED  how far one wheel notch travels (1 = normal, 1.3 = further).

   It stays out of the way when you are:
     - scrolling inside a pop-up, the menu, or any list / text box that scrolls by itself
     - using the sideways wheel (the dish sliders)
     - zooming (Ctrl + wheel), or have "reduce motion" switched on
   Touch and keyboard scrolling stay native.
   ========================================================================== */
export function initializeSmoothScroll() {
  "use strict";

  var EASE = 0.085;
  var SPEED = 1;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  var root = document.documentElement;
  var current = window.scrollY;
  var target = current;
  var running = false;
  var frame = 0;

  function limit() { return Math.max(0, root.scrollHeight - window.innerHeight); }
  function clamp(v) { return Math.min(limit(), Math.max(0, v)); }
  function jump(y) { window.scrollTo({ top: y, left: 0, behavior: "instant" }); }

  function tick() {
    var diff = target - current;
    if (Math.abs(diff) < 0.2) {
      current = target;
      jump(current);
      running = false;
      return;
    }
    current += diff * EASE;
    jump(current);
    frame = requestAnimationFrame(tick);
  }

  /* Is the page itself locked (a pop-up is open: style.css sets overflow:hidden on the body)? */
  function pageLocked() {
    var a = getComputedStyle(root).overflowY, b = getComputedStyle(document.body).overflowY;
    return a === "hidden" || b === "hidden";
  }

  /* Is the cursor over something that scrolls up/down by itself and still has room to move? */
  function insideScroller(el, dy) {
    while (el && el !== document.body && el !== root) {
      if (el.nodeType === 1) {
        var oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          var canDown = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
          var canUp = el.scrollTop > 0;
          if ((dy > 0 && canDown) || (dy < 0 && canUp)) return true;
        }
      }
      el = el.parentNode;
    }
    return false;
  }

  function wheel(e) {
    if (e.defaultPrevented) return;
    if (e.ctrlKey || e.metaKey) return;                                   // pinch / browser zoom
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;                  // sideways (sliders)
    var toggle = document.getElementById("menu-toggle");
    if (toggle && toggle.checked) return;                                 // menu is open
    if (pageLocked()) return;                                             // pop-up is open
    if (insideScroller(e.target, e.deltaY)) return;                       // inner list / text box
    if (limit() === 0) return;

    e.preventDefault();
    var unit = e.deltaMode === 1 ? 40 : (e.deltaMode === 2 ? window.innerHeight : 1);
    if (!running) { current = window.scrollY; target = clamp(current); }
    target = clamp(target + e.deltaY * unit * SPEED);
    if (!running) { running = true; frame = requestAnimationFrame(tick); }
  }
  window.addEventListener("wheel", wheel, { passive: false });

  /* Anything else that moves the page (scrollbar drag, keys, touch, anchor links): follow it */
  function followScroll() {
    if (!running) { current = target = window.scrollY; }
  }
  window.addEventListener("scroll", followScroll, { passive: true });

  function resize() { target = clamp(target); }
  window.addEventListener("resize", resize);
  // Reset the animation on page navigation and release all listeners on App unmount.
  function reset() { cancelAnimationFrame(frame); running = false; current = target = window.scrollY; }
  window.addEventListener('dishcovery:route-reset', reset);
  return () => {
    reset();
    window.removeEventListener('wheel', wheel);
    window.removeEventListener('scroll', followScroll);
    window.removeEventListener('resize', resize);
    window.removeEventListener('dishcovery:route-reset', reset);
  };
}
