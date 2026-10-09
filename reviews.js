(function () {
  var cards = document.querySelectorAll(".films-card, .books-card");
  var reviewed = [];

  cards.forEach(function (card) {
    var source = card.querySelector(".review-source");
    if (!source) return;

    var paragraphs = Array.prototype.map
      .call(source.querySelectorAll("p"), function (paragraph) {
        return paragraph.textContent.trim();
      })
      .filter(Boolean);

    if (!paragraphs.length) {
      var fallback = source.textContent.trim();
      if (fallback) paragraphs = [fallback];
    }

    source.remove();
    if (!paragraphs.length) return;

    card.classList.add("has-review");

    var button = document.createElement("button");
    button.type = "button";
    button.className = "flip";
    var title = card.dataset.title || "Review";
    button.setAttribute("aria-label", title + ", open review");

    var inner = document.createElement("span");
    inner.className = "flip__inner";

    var front = document.createElement("span");
    front.className = "flip__face flip__face--front";
    while (card.firstChild) front.appendChild(card.firstChild);

    var back = document.createElement("span");
    back.className = "flip__face flip__face--back";
    paragraphs.forEach(function (text) {
      var preview = document.createElement("p");
      preview.textContent = text;
      back.appendChild(preview);
    });

    inner.appendChild(front);
    inner.appendChild(back);
    button.appendChild(inner);
    card.appendChild(button);

    reviewed.push({
      button: button,
      title: title,
      paragraphs: paragraphs,
    });
  });

  if (!reviewed.length) return;

  var windowEl = document.createElement("div");
  windowEl.className = "review-window";
  windowEl.hidden = true;
  windowEl.setAttribute("role", "dialog");
  windowEl.setAttribute("aria-modal", "false");
  windowEl.setAttribute("aria-labelledby", "review-window-title");

  var bar = document.createElement("div");
  bar.className = "review-window__bar";

  var titleEl = document.createElement("span");
  titleEl.className = "review-window__title";
  titleEl.id = "review-window-title";

  var closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "review-window__close";
  closeButton.setAttribute("aria-label", "Close");
  closeButton.textContent = "\u00d7";

  var bodyEl = document.createElement("div");
  bodyEl.className = "review-window__body";

  bar.appendChild(titleEl);
  bar.appendChild(closeButton);
  windowEl.appendChild(bar);
  windowEl.appendChild(bodyEl);
  document.body.appendChild(windowEl);

  function openReview(title, paragraphs) {
    titleEl.textContent = title;
    bodyEl.replaceChildren();
    paragraphs.forEach(function (text) {
      var paragraph = document.createElement("p");
      paragraph.textContent = text;
      bodyEl.appendChild(paragraph);
    });
    windowEl.hidden = false;
  }

  reviewed.forEach(function (item) {
    item.button.addEventListener("click", function () {
      openReview(item.title, item.paragraphs);
    });
  });

  closeButton.addEventListener("click", function () {
    windowEl.hidden = true;
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") windowEl.hidden = true;
  });

  bar.addEventListener("pointerdown", function (event) {
    if (event.target.closest("button")) return;

    var rect = windowEl.getBoundingClientRect();
    var offsetX = event.clientX - rect.left;
    var offsetY = event.clientY - rect.top;
    try {
      bar.setPointerCapture(event.pointerId);
    } catch (e) {}

    function move(ev) {
      var maxLeft = window.innerWidth - Math.min(rect.width, 120);
      var maxTop = window.innerHeight - 48;
      var left = Math.min(Math.max(0, ev.clientX - offsetX), Math.max(0, maxLeft));
      var top = Math.min(Math.max(0, ev.clientY - offsetY), Math.max(0, maxTop));
      windowEl.style.left = left + "px";
      windowEl.style.top = top + "px";
    }

    function up(ev) {
      if (bar.hasPointerCapture(ev.pointerId)) {
        bar.releasePointerCapture(ev.pointerId);
      }
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
    }

    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
  });
})();
