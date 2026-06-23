(function () {
  function getRows(points) {
    var sorted = points.slice().sort(function (a, b) {
      return a[1] - b[1] || a[0] - b[0];
    });
    var yToRowIndex = new Map();
    var xStep = 0;
    var previousY = NaN;
    var previousX = NaN;

    sorted.forEach(function (point) {
      var x = point[0];
      var y = point[1];

      if (y !== previousY) {
        previousY = y;
        previousX = NaN;
        if (!yToRowIndex.has(y)) yToRowIndex.set(y, yToRowIndex.size);
      }

      if (!Number.isNaN(previousX)) {
        var delta = x - previousX;
        if (delta > 0) xStep = xStep === 0 ? delta : Math.min(xStep, delta);
      }

      previousX = x;
    });

    return { xStep: xStep || 1, yToRowIndex: yToRowIndex };
  }

  function createSvgElement(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function renderMap(svg, data) {
    svg.setAttribute("viewBox", "0 0 " + data.width + " " + data.height);
    svg.textContent = "";

    var title = createSvgElement("title");
    title.textContent = "Founder network nodes";
    svg.appendChild(title);

    var rows = getRows(data.points);
    var dotLayer = createSvgElement("g");
    var markerLayer = createSvgElement("g");

    data.points.forEach(function (point) {
      var x = point[0];
      var y = point[1];
      var rowIndex = rows.yToRowIndex.get(y) || 0;
      var offsetX = rowIndex % 2 === 1 ? rows.xStep / 2 : 0;
      var dot = createSvgElement("circle");
      dot.setAttribute("class", "map-dot");
      dot.setAttribute("cx", String(x + offsetX));
      dot.setAttribute("cy", String(y));
      dot.setAttribute("r", String(data.dotRadius || 0.1));
      dotLayer.appendChild(dot);
    });

    svg.appendChild(dotLayer);

    data.markers.forEach(function (marker, index) {
      var rowIndex = rows.yToRowIndex.get(marker.y) || 0;
      var offsetX = rowIndex % 2 === 1 ? rows.xStep / 2 : 0;
      var x = marker.x + offsetX;
      var y = marker.y;
      var r = marker.size || data.dotRadius || 0.3;
      var group = createSvgElement("g");
      group.setAttribute("class", marker.pulse ? "map-label is-pulsing" : "map-label");
      group.setAttribute("style", "--marker-delay: " + index * 0.24 + "s");

      var node = createSvgElement("circle");
      node.setAttribute("class", "map-node");
      node.setAttribute("cx", String(x));
      node.setAttribute("cy", String(y));
      node.setAttribute("r", String(r));
      group.appendChild(node);

      if (marker.pulse) {
        var delayBase = index * 0.24;
        [0, 0.58, 1.16].forEach(function (delay) {
          var pulse = createSvgElement("circle");
          pulse.setAttribute("class", "map-signal-ring");
          pulse.setAttribute("cx", String(x));
          pulse.setAttribute("cy", String(y));
          pulse.setAttribute("r", String(r * 2.25));
          pulse.setAttribute("stroke-width", "0.62");

          var radius = createSvgElement("animate");
          radius.setAttribute("attributeName", "r");
          radius.setAttribute("values", r * 2.25 + ";" + r * 7.4);
          radius.setAttribute("dur", "1.9s");
          radius.setAttribute("begin", delayBase + delay + "s");
          radius.setAttribute("repeatCount", "indefinite");
          pulse.appendChild(radius);

          var opacity = createSvgElement("animate");
          opacity.setAttribute("attributeName", "opacity");
          opacity.setAttribute("values", "0.95;0");
          opacity.setAttribute("dur", "1.9s");
          opacity.setAttribute("begin", delayBase + delay + "s");
          opacity.setAttribute("repeatCount", "indefinite");
          pulse.appendChild(opacity);
          group.appendChild(pulse);
        });
      }

      if (marker.countryCode && marker.label) {
        var flagRadius = 1.45;
        var clipId = "map-flag-" + marker.countryCode + "-" + index;
        var clip = createSvgElement("clipPath");
        clip.setAttribute("id", clipId);

        var clipCircle = createSvgElement("circle");
        clipCircle.setAttribute("cx", String(x));
        clipCircle.setAttribute("cy", String(y));
        clipCircle.setAttribute("r", String(flagRadius));
        clip.appendChild(clipCircle);
        svg.appendChild(clip);

        var flagRing = createSvgElement("circle");
        flagRing.setAttribute("class", "map-flag-ring");
        flagRing.setAttribute("cx", String(x));
        flagRing.setAttribute("cy", String(y));
        flagRing.setAttribute("r", String(flagRadius + 0.32));
        group.appendChild(flagRing);

        var image = createSvgElement("image");
        image.setAttribute("href", "https://flagcdn.com/w80/" + marker.countryCode + ".webp");
        image.setAttribute("x", String(x - flagRadius));
        image.setAttribute("y", String(y - flagRadius));
        image.setAttribute("width", String(flagRadius * 2));
        image.setAttribute("height", String(flagRadius * 2));
        image.setAttribute("preserveAspectRatio", "xMidYMid slice");
        image.setAttribute("clip-path", "url(#" + clipId + ")");
        group.appendChild(image);

        var labelWidth = marker.label.length * 1.25 + 3;
        var rect = createSvgElement("rect");
        rect.setAttribute("x", String(x + flagRadius + 1.7));
        rect.setAttribute("y", String(y - 1.75));
        rect.setAttribute("width", String(labelWidth));
        rect.setAttribute("height", "3.5");
        rect.setAttribute("rx", "1.75");
        group.appendChild(rect);

        var text = createSvgElement("text");
        text.setAttribute("x", String(x + flagRadius + 3.2));
        text.setAttribute("y", String(y + 0.72));
        text.textContent = marker.label;
        group.appendChild(text);
      }

      markerLayer.appendChild(group);
    });

    svg.appendChild(markerLayer);
  }

  window.renderVPXDottedMaps = function () {
    var data = window.VPX_DOTTED_MAP_DATA;
    if (!data) return;
    document.querySelectorAll("[data-dotted-map]").forEach(function (svg) {
      renderMap(svg, data);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.renderVPXDottedMaps);
  } else {
    window.renderVPXDottedMaps();
  }
})();
