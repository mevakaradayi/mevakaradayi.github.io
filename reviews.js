(function () {
  var cards = document.querySelectorAll(".films-card, .books-card");
  var reviewed = [];
  var openCard = null;
  var copyEl = null;

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
    button.setAttribute("aria-expanded", "false");

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
      card: card,
      button: button,
      title: title,
      paragraphs: paragraphs,
    });
  });

  if (!reviewed.length) return;

  var closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "review-close";
  closeButton.hidden = true;
  closeButton.setAttribute("aria-label", "Close");
  closeButton.textContent = "\u00d7";
  document.body.appendChild(closeButton);

  function setExpanded(item, expanded) {
    item.button.setAttribute("aria-expanded", expanded ? "true" : "false");
    item.button.setAttribute(
      "aria-label",
      item.title + (expanded ? ", close review" : ", open review")
    );
  }

  function closeReview() {
    if (!openCard) return;
    openCard.style.transition = "none";
    openCard.style.transform = "";
    openCard.classList.remove("is-open");
    var current = openCard;
    openCard = null;
    reviewed.forEach(function (item) {
      if (item.card === current) setExpanded(item, false);
    });
    if (copyEl) {
      copyEl.remove();
      copyEl = null;
    }
    closeButton.hidden = true;
    document.body.classList.remove("review-open");
  }

  function openReview(item) {
    if (openCard === item.card) {
      closeReview();
      return;
    }
    if (openCard) closeReview();

    var card = item.card;
    var from = card.getBoundingClientRect();
    var stage = card.closest(".films-main__rail-stage, .books-main__stage");

    copyEl = document.createElement("div");
    copyEl.className = "review-copy";
    item.paragraphs.forEach(function (text) {
      var paragraph = document.createElement("p");
      paragraph.textContent = text;
      copyEl.appendChild(paragraph);
    });

    document.body.classList.add("review-open");
    card.classList.add("is-open");
    setExpanded(item, true);
    closeButton.hidden = false;
    card.after(copyEl);
    if (stage) stage.scrollTop = 0;
    window.scrollTo(0, 0);
    openCard = card;

    var to = card.getBoundingClientRect();
    var dx = from.left - to.left;
    var dy = from.top - to.top;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
      card.style.transition = "none";
      card.style.transform = "translate(" + dx + "px, " + dy + "px)";
      void card.offsetWidth;
      requestAnimationFrame(function () {
        if (openCard !== card) return;
        card.style.transition = "transform 0.45s ease";
        card.style.transform = "translate(0, 0)";
      });
    }
  }

  reviewed.forEach(function (item) {
    item.button.addEventListener("click", function () {
      openReview(item);
    });
  });

  closeButton.addEventListener("click", function () {
    closeReview();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeReview();
  });
})();
