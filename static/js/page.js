/* RwR page: result data (from the paper's tables) and the interactive pieces. */
(function () {
  // Table 2. [axis, variant, AdvBench CR, MaliciousInstruct CR, XSTest-Safe CR, OKTest CR, recall, precision, F1]
  var T2 = {
    llama: [
      ["Position", "Beginning", 0.02, 0.02, 0.39, 0.41, 0.40, 0.94, 0.56],
      ["Position", "Middle", 0.03, 0.03, 0.58, 0.52, 0.55, 0.94, 0.69],
      ["Position", "End", 0.02, 0.04, 0.60, 0.54, 0.56, 0.95, 0.71],
      ["Component", "Statement-Only", 0.03, 0.02, 0.48, 0.44, 0.46, 0.93, 0.62],
      ["Component", "Rationale-Only", 0.02, 0.06, 0.71, 0.60, 0.65, 0.95, 0.77],
      ["Component", "Statement and Rationale", 0.02, 0.02, 0.39, 0.41, 0.40, 0.94, 0.56],
      ["Explicitness", "Request-Specific", 0.04, 0.05, 0.80, 0.72, 0.75, 0.94, 0.84],
      ["Explicitness", "Generic", 0.03, 0.02, 0.66, 0.60, 0.63, 0.95, 0.75]
    ],
    mistral: [
      ["Position", "Beginning", 0.01, 0.00, 0.49, 0.55, 0.52, 0.98, 0.68],
      ["Position", "Middle", 0.03, 0.02, 0.57, 0.58, 0.57, 0.95, 0.72],
      ["Position", "End", 0.03, 0.02, 0.60, 0.60, 0.60, 0.94, 0.73],
      ["Component", "Statement-Only", 0.05, 0.01, 0.56, 0.53, 0.55, 0.91, 0.69],
      ["Component", "Rationale-Only", 0.04, 0.06, 0.75, 0.77, 0.76, 0.94, 0.84],
      ["Component", "Statement and Rationale", 0.01, 0.00, 0.49, 0.55, 0.52, 0.98, 0.68],
      ["Explicitness", "Request-Specific", 0.06, 0.08, 0.83, 0.85, 0.84, 0.92, 0.88],
      ["Explicitness", "Generic", 0.04, 0.03, 0.69, 0.79, 0.75, 0.95, 0.84]
    ]
  };
  var MODEL_NAME = { llama: "Llama-3.1-8B", mistral: "Mistral-7B-v0.3" };
  var NO_STATEMENT = { "Rationale-Only": true, "Request-Specific": true, "Generic": true };

  function row(model, variant) {
    return T2[model].filter(function (r) { return r[1] === variant; })[0];
  }

  // ---- Table 2 bars, toggled by model ----
  var barsEl = document.getElementById("t2-bars");
  var html = '<div class="bars-head"><span>Training format</span><span>Pseudo-harmful compliance</span><span>Recall</span><span>F1 · harmful CR</span></div>';
  var group = null;
  T2.llama.forEach(function (r, i) {
    if (r[0] !== group) { group = r[0]; html += '<p class="group-label">' + group + "</p>"; }
    html += '<div class="bar-row' + (NO_STATEMENT[r[1]] ? " hl" : "") + '" data-i="' + i + '">' +
      '<span class="name">' + r[1] + "</span>" +
      '<span class="track"><span class="fill"></span></span>' +
      '<span class="val"></span><span class="side"></span></div>';
  });
  barsEl.innerHTML = html;

  function updateBars(model) {
    barsEl.querySelectorAll(".bar-row").forEach(function (el) {
      var r = T2[model][+el.dataset.i];
      el.querySelector(".fill").style.setProperty("--v", r[6]);
      el.querySelector(".val").textContent = fmt(r[6]);
      el.querySelector(".side").textContent = "F1 " + fmt(r[8]) + " · " + fmt(r[2]) + " / " + fmt(r[3]);
    });
  }
  bindSeg(document.getElementById("model-seg"), updateBars);

  // ---- full Table 2 ----
  var t = '<thead><tr class="super"><th></th><th></th><th colspan="2">Harmful</th><th colspan="2">Pseudo-harmful</th><th colspan="3">Overall</th></tr>' +
    "<tr><th>Axis</th><th>Variant</th><th>AdvBench CR ↓</th><th>Malicious CR ↓</th><th>XSTest-Safe CR ↑</th><th>OKTest CR ↑</th><th>Recall</th><th>Precision</th><th>F1</th></tr></thead><tbody>";
  ["llama", "mistral"].forEach(function (m) {
    t += '<tr class="group"><td colspan="9">' + MODEL_NAME[m] + "</td></tr>";
    var last = null;
    T2[m].forEach(function (r) {
      var hl = r[1] === "Rationale-Only" || r[1] === "Request-Specific";
      t += "<tr" + (hl ? ' class="hl"' : "") + '><td class="dim">' + (r[0] !== last ? r[0] : "") + "</td><td>" + r[1] + "</td>" +
        r.slice(2).map(function (v) { return "<td>" + fmt(v) + "</td>"; }).join("") + "</tr>";
      last = r[0];
    });
  });
  document.getElementById("t2-table").innerHTML = t + "</tbody>";

  // ---- variant builder (text from Figure 2 and Table 1) ----
  var S = '<span class="s">I’m sorry, but I cannot help you with that.</span>';
  var TAIL = "is illegal and can result in serious consequences, including severe penalties and damage to one’s reputation.";
  var R1 = "Counterfeiting money " + TAIL;
  var R1_SPEC = '<span class="req">Counterfeiting money</span> ' + TAIL;
  var R1_GEN = '<span class="gen">Engaging in this kind of behavior</span> ' + TAIL;
  var R2 = "It’s important to …";
  var V = {
    base: { name: "Statement and Rationale · Beginning", parts: [S, R1, R2], row: "Statement and Rationale",
      desc: "The base format: one concise refusal statement first, then a rationale of at least two sentences." },
    stmt: { name: "Statement-Only", parts: [S], row: "Statement-Only",
      desc: "The refusal phrase alone, with all explanatory content removed." },
    rat: { name: "Rationale-Only", parts: [R1, R2], row: "Rationale-Only",
      desc: "The explanation alone, with refusal markers removed." },
    mid: { name: "Middle", parts: [R1, S, R2], row: "Middle",
      desc: "The refusal statement moved inside the rationale, as a sentence that is neither first nor last." },
    end: { name: "End", parts: [R1, R2, S], row: "End",
      desc: "The refusal statement moved to the final sentence." },
    gen: { name: "Generic", parts: [R1_GEN, R2], row: "Generic",
      desc: "Direct mentions of the requested action are replaced with general wording." },
    spec: { name: "Request-Specific", parts: [R1_SPEC, R2], row: "Request-Specific",
      desc: "The rationale names the requested action and what makes it harmful." }
  };
  var builderButtons = Array.prototype.slice.call(document.querySelectorAll("[data-builder] button"));
  function showVariant(key) {
    var v = V[key];
    builderButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.value === key)); });
    document.getElementById("variant-name").textContent = v.name;
    document.getElementById("variant-target").innerHTML = v.parts.join(" ");
    document.getElementById("variant-desc").textContent = v.desc;
    document.getElementById("variant-score").innerHTML = ["llama", "mistral"].map(function (m) {
      var r = row(m, v.row);
      return '<span><span class="m">' + MODEL_NAME[m] + "</span>recall <b>" + fmt(r[6]) + "</b> · F1 <b>" + fmt(r[8]) + "</b></span>";
    }).join("");
  }
  builderButtons.forEach(function (b) {
    b.removeAttribute("aria-selected");
    b.addEventListener("click", function () { showVariant(b.dataset.value); });
  });
  showVariant("base");

  // ---- Table 5: attribution types (percent) ----
  var ATTR = [
    ["XSTest-Safe", "Rationale-Only", [98.7, 1.3, 0.0]],
    ["XSTest-Safe", "Statement and Rationale", [8.8, 30.4, 60.8]],
    ["OKTest", "Rationale-Only", [97.3, 1.4, 1.4]],
    ["OKTest", "Statement and Rationale", [13.5, 32.4, 54.1]]
  ];
  var KINDS = ["meaningful", "meaningless", "risky"];
  var s = '<div class="stack-legend">' + KINDS.map(function (k) {
    return '<span><span class="swatch k-' + k + '"></span>' + k.charAt(0).toUpperCase() + k.slice(1) + "</span>";
  }).join("") + "</div>";
  ATTR.forEach(function (a, i) {
    if (i === 2) s += '<div class="stack-gap"></div>';
    s += '<div class="stack-row"><span class="name">' + a[1] + "<small>" + a[0] + "</small></span>" +
      '<span class="stack-bar" role="img" aria-label="' + a[0] + ", " + a[1] + ": " +
      a[2].map(function (v, j) { return KINDS[j] + " " + v + "%"; }).join(", ") + '">' +
      a[2].map(function (v, j) {
        return v > 0 ? '<span class="k-' + KINDS[j] + '" style="flex:' + v + ' 1 0">' + (v >= 9 ? v.toFixed(1) + "%" : "") + "</span>" : "";
      }).join("") + "</span></div>";
  });
  document.getElementById("attr-stack").innerHTML = s;

  // ---- Table 6: template variations (Llama-3.1-8B) [label, recall, F1] ----
  var T6 = [
    ["Rationale-Only", 0.65, 0.77, true],
    ["Statement and Rationale", 0.40, 0.56],
    ["“Thank you for asking!” + rationale", 0.45, 0.61],
    ["15 varied statements + rationale", 0.55, 0.69]
  ];
  document.getElementById("t6-bars").innerHTML = T6.map(function (r) {
    return '<div class="bar-row' + (r[3] ? " hl" : "") + '"><span class="name">' + r[0] + "</span>" +
      '<span class="track"><span class="fill" style="--v:' + r[1] + '"></span></span>' +
      '<span class="val">' + fmt(r[1]) + '</span><span class="side">F1 ' + fmt(r[2]) + "</span></div>";
  }).join("");
})();
