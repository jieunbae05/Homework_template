<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <!-- 모바일 필수: 이 태그가 없으면 폰에서 PC용 화면처럼 축소되어 터치가 스크롤/확대로 해석됨 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
    <title>Interactive Design Archive · C535163</title>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Nanum+Gothic+Coding:wght@400;700&display=swap"
    />
    <style>
      :root {
        --bg: #f4f4f3;
        --ink: #141414;
        --mute: #8a8a8a;
        --line: #d6d6d4;
        --mono: "IBM Plex Mono", "Nanum Gothic Coding", ui-monospace, monospace;
        --menu: 260px;
      }
      /* 허브 페이지는 절대 스크롤/선택되지 않게 고정 (아이폰에서 터치가 페이지 스크롤로 새는 것 방지) */
      html,
      body {
        height: 100%;
        margin: 0;
        overflow: hidden;
        overscroll-behavior: none;
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        background: var(--bg);
        color: var(--ink);
        font-family: var(--mono);
      }
      [hidden] {
        display: none !important;
      }
      /* 왼쪽 메뉴 */
      #menu {
        position: fixed;
        top: 0;
        left: 0;
        width: var(--menu);
        height: 100%;
        padding: 28px 24px;
        box-sizing: border-box;
        border-right: 1px solid var(--line);
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .head small {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: var(--mute);
        letter-spacing: 0.04em;
      }
      .head b {
        display: block;
        margin-top: 2px;
        font: 800 34px/1 Inter, "Helvetica Neue", Arial, sans-serif;
        letter-spacing: -0.01em;
      }
      .head span {
        display: block;
        margin-top: 10px;
        font-size: 12px;
        color: var(--mute);
      }
      #list {
        display: flex;
        flex-direction: column;
      }
      #list a {
        display: grid;
        grid-template-columns: 26px 1fr;
        padding: 12px 0;
        border-top: 1px solid var(--line);
        color: var(--ink);
        text-decoration: none;
        cursor: pointer;
      }
      #list a:last-child {
        border-bottom: 1px solid var(--line);
      }
      #list .n {
        font-size: 12px;
        color: var(--mute);
        padding-top: 2px;
      }
      #list .t {
        font-size: 14px;
        font-weight: 600;
      }
      #list .s {
        grid-column: 2;
        font-size: 11px;
        color: var(--mute);
        margin-top: 2px;
      }
      #list a.on .n,
      #list a.on .t {
        color: var(--ink);
      }
      #list a.on .n::before {
        content: "▶";
        font-size: 9px;
      }
      #list a.on .n span {
        display: none;
      }
      #list a.soon {
        cursor: default;
      }
      #list a.soon .t {
        color: var(--mute);
      }
      #list a:not(.soon):hover .t {
        text-decoration: underline;
      }
      #open {
        margin-top: auto;
        font-size: 12px;
        color: var(--mute);
        text-decoration: none;
      }
      #open:hover {
        color: var(--ink);
      }
      /* iframe 영역: 메뉴를 뺀 나머지 화면 전체 */
      #stage {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: var(--menu);
        overflow: hidden;
        background: #111;
      }
      #viewer {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
      }
      #soon {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #777;
        font-size: 14px;
        letter-spacing: 0.12em;
      }
      /* 폰 · 좁은 화면: 메뉴를 위쪽 한 줄로 */
      @media (max-width: 760px) {
        :root {
          --menu: 0px;
        }
        #menu {
          width: 100%;
          height: auto;
          padding: 10px 12px;
          border-right: 0;
          border-bottom: 1px solid var(--line);
          flex-direction: row;
          align-items: center;
          gap: 14px;
          background: var(--bg);
          z-index: 2;
        }
        .head b {
          font-size: 18px;
        }
        .head small,
        .head span,
        #open,
        #list .s {
          display: none;
        }
        #list {
          flex-direction: row;
          gap: 6px;
          overflow-x: auto;
        }
        #list a,
        #list a:last-child {
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 5px 10px;
          display: block;
          white-space: nowrap;
        }
        #list .n {
          display: none;
        }
        #list a.on {
          background: var(--ink);
          border-color: var(--ink);
        }
        #list a.on .t {
          color: #fff;
        }
        #stage {
          top: 56px;
        }
      }
    </style>
  </head>
  <body>
    <div id="menu">
      <div class="head">
        <b>ARCHIVE</b>
      </div>
      <nav id="list"></nav>
      <a id="open" target="_blank">새 창에서 열기 ↗</a>
    </div>

    <div id="stage">
      <iframe id="viewer" title="작품"></iframe>
      <div id="soon" hidden>COMING SOON</div>
    </div>

    <script>
      // 작품 목록: folder = 작품 폴더 이름 · title = 메뉴에 보일 이름 · type = 작은 글씨
      // 기말과제가 생기면 마지막 folder 칸에 폴더 이름만 넣으면 됨
      const WORKS = [
        { folder: "DynamicBalance", title: "Blossom in Motion", type: "소과제 · Dynamic Balance" },
        { folder: "Delete, Delete, Delete", title: "Moving On", type: "소과제 · Delete, Delete, Delete" },
        { folder: "Drama_Ticket", title: "Drama Diary", type: "중간과제 · You memo? I memo!" },
        { folder: "", title: "Final Project", type: "기말과제" },
      ];

      const list = document.getElementById("list");
      const viewer = document.getElementById("viewer");
      list.innerHTML = WORKS.map(
        (w, i) =>
          `<a data-i="${i}" class="${w.folder ? "" : "soon"}"><span class="n"><span>${String(i + 1).padStart(2, "0")}</span></span><span class="t">${w.title}</span><span class="s">${w.type}</span></a>`,
      ).join("");
      list.onclick = (e) => {
        const a = e.target.closest("[data-i]");
        if (a) show(+a.dataset.i);
      };

      // 메뉴 클릭 시 iframe에 해당 폴더의 index.html을 불러옴
      function loadHomework(folderName) {
        viewer.src = encodeURI(folderName) + "/index.html";
      }
      function show(i) {
        const w = WORKS[i];
        list.querySelectorAll("a").forEach((a) => a.classList.toggle("on", +a.dataset.i === i));
        document.getElementById("soon").hidden = !!w.folder;
        viewer.hidden = !w.folder;
        const open = document.getElementById("open");
        open.hidden = !w.folder;
        if (!w.folder) return viewer.removeAttribute("src");
        loadHomework(w.folder);
        open.href = encodeURI(w.folder) + "/index.html";
        try {
          history.replaceState(null, "", "#" + (i + 1));
        } catch {}
      }

      function fitFrame(iframe) {
        let tries = 0;
        const fit = () => {
          let doc;
          try {
            doc = iframe.contentDocument;
          } catch {
            return;
          }
          const cv = doc && doc.querySelector("canvas");
          if (!cv) return ++tries < 30 && setTimeout(fit, 150);
          const W = doc.documentElement.clientWidth,
            H = doc.documentElement.clientHeight;
          // 작품 캔버스의 원래 크기 (처음 한 번 기억)
          if (!cv.dataset.lw) {
            cv.dataset.lw = cv.offsetWidth;
            cv.dataset.lh = cv.offsetHeight;
          }
          const lw = +cv.dataset.lw,
            lh = +cv.dataset.lh;
          if (Math.abs(lw - W) <= 2 && Math.abs(lh - H) <= 2) return; // 이미 창 크기에 맞춰 그리는 작품은 그대로
          // 고정 크기 캔버스(예: 1000×700)는 창에 꽉 차게 키우거나 줄이고 가운데로
          const k = Math.min(W / lw, H / lh);
          Object.assign(cv.style, {
            position: "absolute",
            left: (W - lw * k) / 2 + "px",
            top: (H - lh * k) / 2 + "px",
            width: lw * k + "px",
            height: lh * k + "px",
          });
          // 여백 색 = 작품 캔버스 왼쪽 아래 구석 색 (작품이 그려진 뒤에 한 번 더)
          const paint = () => {
            try {
              const t = document.createElement("canvas");
              t.width = t.height = 1;
              const tx = t.getContext("2d");
              tx.drawImage(cv, 2, cv.height - 3, 1, 1, 0, 0, 1, 1);
              const px = tx.getImageData(0, 0, 1, 1).data;
              const col = `rgb(${px[0]},${px[1]},${px[2]})`;
              doc.documentElement.style.background = doc.body.style.background = col;
            } catch {}
          };
          paint();
          setTimeout(paint, 600);
        };
        fit();
      }
      addEventListener("resize", () => viewer.getAttribute("src") && fitFrame(viewer));
      viewer.addEventListener("load", () => viewer.getAttribute("src") && fitFrame(viewer));

      // 처음 열었을 때: 주소 끝 #2 처럼 번호가 있으면 그 작품, 없으면 1번
      const start = parseInt(location.hash.slice(1)) - 1;
      show(WORKS[start] && WORKS[start].folder ? start : 0);
    </script>
  </body>
</html>
