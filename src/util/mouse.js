function getEventPath(e) {
  return e.path || (e.composedPath && e.composedPath());
}

export function clickOutsideToDismiss(el, cb) {
  const ondismiss = (e) => {
    if (e.type === "keydown" && e.key !== "Escape") {
      return;
    }
    const path = getEventPath(e);
    if (e.type === "click" && path.indexOf(el) >= 0) {
      return;
    }

    window.removeEventListener("click", ondismiss);
    window.removeEventListener("keydown", ondismiss);
    cb();
  };

  setTimeout(() => {
    window.addEventListener("click", ondismiss);
    window.addEventListener("keydown", ondismiss);
  });

  return () => {
    window.removeEventListener("click", ondismiss);
  };
}
