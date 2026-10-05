const DESK = "#ececeb"; // 책상 색
const DARK = "#2e2e2e"; // 글씨, 버튼 색
const NAVY = "#1f2b4a"; // 남색 (봉투, 인생네컷 테두리)
const ROSE = "#d98ba4"; // 하트 색

let level = 1;
let buttons = [];
let particles = [];

// Lv1 : 폴라로이드
let polaroid, polaroidG;

// Lv2 : 편지
let letter, letterG;
let cutStart = null; // 찢기 시작한 마우스 위치

// Lv3 : 인생네컷 + 라이터
let photo, photoG, burnG;
let lighter;

function setup() {
  createCanvas(1000, 700);
  makePolaroidImage();
  makeLetterImage();
  makePhotoImage();
  resetLevel(1); //레벨 1로 시작하기
}

// 레벨 시작 (처음 상태로 되돌리기)
function resetLevel(n) {
  // n = 시작할 레벨 번호
  level = n;
  particles = [];

  polaroid = {
    x: width / 2 + 18,
    y: height / 2 + 35,
    w: 210,
    h: 254,
    crumpled: false,
  };

  // 편지 (처음엔 한 장. 문지를 때마다 두 조각으로 나뉨)
  letter = {
    x: width / 2 - 62,
    y: height / 2 - 123,
    pieces: [],
    scattered: false,
  };
  letter.pieces.push(newPiece(0, 0, letterG.width, letterG.height)); // 편지 한장 전체 1개로
  cutStart = null; // 아직 안 문지름

  photo = {
    x: width / 2 - 52,
    y: height / 2 + 35,
    w: 149,
    h: 438,
    burning: false,
    bx: 0,
    by: 0,
    r: 0,
    gone: false,
  };
  lighter = {
    x: width / 2 + 149,
    y: height / 2 + 131,
    strikes: 0,
    lit: false,
    drag: false,
  };
}

function draw() {
  drawDesk(); //책상 + 소품
  if (level === 1) {
    drawPolaroid();
  }
  if (level === 2) {
    drawEnvelope();
    drawLetter();
  }
  if (level === 3) {
    updatePhoto();
    drawPhoto();
    drawLighter();
  }
  drawParticles();
  drawUI();
}

// 하트 (동그라미 2개 + 세모 1개)
function drawHeart(x, y, s) {
  noStroke();
  fill(ROSE);
  circle(x - s * 0.25, y - s * 0.1, s * 0.55);
  circle(x + s * 0.25, y - s * 0.1, s * 0.55);
  triangle(x - s * 0.5, y, x + s * 0.5, y, x, y + s * 0.5);
}

// 책상
function drawDesk() {
  background(DESK);
  noStroke();

  // 노트북 (살짝 기울임)
  push();
  translate(width * 0.08, height * 0.12);
  rotate(-0.18);
  fill(0, 25); // 그림자
  rect(-180, -116, 368, 245, 14);
  fill("#dfe2e7");
  rect(-184, -122, 368, 245, 14); // 몸통
  fill("#2f3238");
  for (let r = 0; r < 5; r++) {
    for (let k = 0; k < 13; k++) {
      rect(-158 + k * 24, -88 + r * 19, 22, 16, 3); // 키
    }
  }
  fill("#d4d8de");
  rect(-61, 35, 122, 74, 7); // 트랙패드
  fill("#fbf1cf");
  rect(72, 28, 94, 94); // 포스트잇
  fill("#4a4a4a");
  textAlign(CENTER, CENTER);
  textSize(13);
  text("전남친과의\n추억 지우기", 119, 75);
  pop();

  // 아이스 라떼
  const cx = width * 0.88;
  const cy = height * 0.22;
  fill(0, 25); // 그림자
  circle(cx + 4, cy + 7, 105);
  fill(255);
  circle(cx, cy, 105); // 컵
  fill("#c9a17c");
  circle(cx, cy, 88); // 커피
  fill(255, 255, 255, 150);
  rect(cx - 26, cy - 18, 21, 21, 4); // 얼음
  rect(cx + 2, cy + 2, 21, 21, 4); // 얼음
  stroke("#d6d6d6");
  strokeWeight(7.9);
  line(cx + 9, cy + 4, cx + 61, cy - 52); // 빨대
  noStroke();

  // 노트 (+ 밑에 깔린 편지봉투, 사이에 끼운 인생네컷)
  push();
  translate(width * 0.86, height * 0.8);
  rotate(0.25);
  if (level === 1) {
    fill(0, 25); // 그림자
    rect(-172, 5, 114, 74, 3);
    fill(NAVY);
    rect(-175, 0, 114, 74, 3); // 편지봉투
    drawHeart(-118, 35, 14); // 하트 스티커
  }
  if (level !== 3) {
    image(photoG, -18, -188, 74, 219); // 인생네컷
  }
  fill(0, 30); // 그림자
  rect(-84, -107, 175, 228, 7);
  fill("#1f1f1f");
  rect(-88, -114, 175, 228, 7); // 검정 노트
  fill("#4a4a4a");
  rect(52, -114, 9, 228); // 고무줄
  pop();
}
//  Lv1 : 폴라로이드 (클릭 한 번 → 바로 구겨짐)
// 폴라로이드 그림을 미리 그려 둠
function makePolaroidImage() {
  const w = 210;
  const h = 254;
  polaroidG = createGraphics(w, h);
  const g = polaroidG;
  g.noStroke();
  g.fill(255);
  g.rect(0, 0, w, h, 3); // 흰 테두리
  g.fill("#dde1e7");
  g.rect(13, 13, w - 26, w - 26); // 사진 칸
  g.push();
  g.translate(w / 2, w - 13); // 사진 칸 가운데 아래
  g.scale(1.4);
  drawCut(g, 1, 0, 0); // 두 사람 + 하트
  g.pop();
}

function drawPolaroid() {
  const P = polaroid;
  push();
  translate(P.x, P.y);
  if (P.crumpled) {
    // 구겨진 종이 뭉치 (밝기가 다른 세모 5개)
    fill(0, 30);
    ellipse(5, 12, 95, 75);
    fill("#f2f2f0");
    triangle(-45, -15, 10, -45, 35, 30);
    fill("#dcdcda");
    triangle(10, -45, 48, -5, 35, 30);
    fill("#d2d2d0");
    triangle(-45, -15, 35, 30, -15, 40);
    fill("#e6e6e4");
    triangle(-45, -15, -15, 40, -48, 18);
    fill("#fafaf8");
    triangle(-28, -32, 10, -45, -8, 2);
  } else {
    rotate(-0.05);
    tint(0, 40); // 그림자
    image(polaroidG, -P.w / 2 + 4, -P.h / 2 + 7);
    noTint();
    image(polaroidG, -P.w / 2, -P.h / 2);
  }
  pop();
}
//  Lv2 : 편지봉투 + 편지 (문지르면 찢기고, 손 떼면 사라짐)
function drawEnvelope() {
  push();
  translate(width / 2 - 219, height / 2 + 9);
  rotate(-0.12);
  const w = 201;
  const h = 131;
  noStroke();
  fill(0, 25); // 그림자
  rect(-w / 2 + 4, -h / 2 + 7, w, h, 4);
  fill(NAVY);
  rect(-w / 2, -h / 2, w, h, 4); // 봉투
  fill("#2c3b63");
  triangle(-w / 2, -h / 2, w / 2, -h / 2, 0, -h / 2 - 61); // 열린 뚜껑
  stroke("#3a4b78");
  strokeWeight(1.5);
  line(-w / 2, h / 2, 0, 4); // 접힌 선
  line(w / 2, h / 2, 0, 4);
  drawHeart(0, -h / 2 - 7, 23); // 하트 스티커
  pop();
}

const LETTER_LINES = [
  "ㅇㅇ아, 오늘 벌써 1주년이네!",
  "처음 만난 날 기억나?",
  "나 너무 떨려서 말도 못 했잖아ㅋㅋ",
  "1년 동안 옆에 있어줘서 고마워",
  "앞으로도 지금처럼만 지내자 ♡",
];

// 편지 그림을 미리 그려 둠
function makeLetterImage() {
  const w = 245;
  const h = 315;
  letterG = createGraphics(w, h);
  const g = letterG;
  g.background("#f3f6fa"); // 편지지
  g.noFill();
  g.stroke("#a9bcd6");
  g.strokeWeight(2);
  g.rect(12, 12, w - 24, h - 24, 3); // 안쪽 테두리

  g.noStroke();
  g.fill("#3c4a5c");
  g.textAlign(LEFT, CENTER);
  g.textSize(14);
  g.text("To. ㅇㅇ에게", 28, 48);
  g.textSize(11);
  for (let i = 0; i < 8; i++) {
    const y = 72 + i * 24;
    g.stroke("#dde5ef"); // 밑줄
    g.strokeWeight(1);
    g.line(26, y + 12, w - 26, y + 12);
    g.noStroke();
    if (i < LETTER_LINES.length) {
      g.text(LETTER_LINES[i], 28, y); // 편지 내용
    } else {
      g.fill("#9aa6b6");
      g.rect(28, y - 1, i % 2 ? 96 : 166, 2); // 나머지 줄은 흐릿한 줄
      g.fill("#3c4a5c");
    }
  }
}

// 조각 하나 만들기 : 편지 그림에서 (sx, sy) 위치의 가로 sw, 세로 sh 네모
function newPiece(sx, sy, sw, sh) {
  return {
    sx: sx,
    sy: sy,
    sw: sw,
    sh: sh,
    dx: random(-3, 3),
    dy: random(-3, 3),
    rot: random(-0.05, 0.05),
    alpha: 255,
  };
}

function drawLetter() {
  for (const p of letter.pieces) {
    if (letter.scattered) {
      // 손을 뗀 뒤면 -> 날아가며 흐려짐
      p.vy += 0.25; //중력 아래로
      p.dx += p.vx; // 옆으로 이동
      p.dy += p.vy; // 위아래로 이동
      p.rot += p.vr; // 빙글뱅글
      p.alpha -= 3; // 점점 투명하게
    }
    push();
    translate(
      letter.x + p.sx + p.dx + p.sw / 2,
      letter.y + p.sy + p.dy + p.sh / 2,
    );
    rotate(p.rot);
    tint(255, p.alpha);
    image(letterG, -p.sw / 2, -p.sh / 2, p.sw, p.sh, p.sx, p.sy, p.sw, p.sh);
    pop();
  }
}

// 문지른 방향으로 찢기 : 옆으로 문지르면 가로로, 위아래로 문지르면 세로로
function tearLetter(a, b) {
  const sideways = abs(b.x - a.x) > abs(b.y - a.y);
  const next = [];
  for (const p of letter.pieces) {
    const cx = b.x - letter.x - p.sx;
    const cy = b.y - letter.y - p.sy;
    if (sideways && cx > 0 && cx < p.sw && cy > 18 && cy < p.sh - 18) {
      next.push(newPiece(p.sx, p.sy, p.sw, cy));
      next.push(newPiece(p.sx, p.sy + cy, p.sw, p.sh - cy));
    } else if (!sideways && cy > 0 && cy < p.sh && cx > 18 && cx < p.sw - 18) {
      next.push(newPiece(p.sx, p.sy, cx, p.sh));
      next.push(newPiece(p.sx + cx, p.sy, p.sw - cx, p.sh));
    } else {
      next.push(p);
    }
  }
  letter.pieces = next;
}

// 손을 떼면 조각들이 흩어짐
function scatterLetter() {
  letter.scattered = true;
  for (const p of letter.pieces) {
    p.vx = random(-4, 4); // 옆으로 아무 방향
    p.vy = random(-5, -1); // 위로 튀어오르기
    p.vr = random(-0.15, 0.15); //아무 방향 회전
  }
}
//  Lv3 : 인생네컷 + 라이터

// 인생네컷 그림을 미리 그려 둠
function makePhotoImage() {
  const w = 149;
  const h = 438;
  photoG = createGraphics(w, h);
  burnG = createGraphics(w, h); // 타는 모습을 그릴 도화지
  const g = photoG;
  g.noStroke();
  g.fill(NAVY);
  g.rect(0, 0, w, h, 3); // 남색 테두리
  for (let i = 0; i < 4; i++) {
    const fy = 9 + i * 98;
    g.fill("#dde1e7");
    g.rect(9, fy, w - 18, 91); // 사진 칸
    drawCut(g, i, w / 2, fy + 91); // 두 사람
  }
  g.fill("#c9cfdb");
  g.textAlign(LEFT, CENTER);
  g.textSize(9.6);
  g.text("2025. 02. 14", 10, h - 19); // 날짜
}

// 사진 속 두 사람 (단순한 실루엣)
function drawCut(g, i, cx, base) {
  const t = [0, 5, -4, 9][i]; // 컷마다 자세가 조금씩 다름
  g.noStroke();
  g.fill("#3b3b3b");
  g.circle(cx - 21, base - 46, 26); // 왼쪽 사람 머리
  g.circle(cx + 19 - t, base - 49, 28); // 오른쪽 사람 머리
  g.rect(cx - 44, base - 32, 44, 32, 16, 16, 0, 0); // 왼쪽 몸
  g.rect(cx - 2 - t, base - 33, 46, 33, 16, 16, 0, 0); // 오른쪽 몸
  if (i === 1 || i === 3) {
    // 작은 하트
    g.fill("#f2a7bd");
    g.circle(cx - 3, base - 75, 7);
    g.circle(cx + 3, base - 75, 7);
    g.triangle(cx - 6, base - 74, cx + 6, base - 74, cx, base - 67);
  }
}

// 라이터 불꽃 끝 위치
function flameTip() {
  return { x: lighter.x, y: lighter.y - 54 }; // 라이터 위치에서 54만큼 위
}

function updatePhoto() {
  const P = photo;
  const f = flameTip();

  // 켜진 라이터가 사진에 닿으면 불이 붙음
  if (
    lighter.lit &&
    !P.burning &&
    abs(f.x - P.x) < P.w / 2 &&
    abs(f.y - P.y) < P.h / 2
  ) {
    P.burning = true;
    P.burnStart = millis(); // 불 붙은 시작
    P.bx = f.x - (P.x - P.w / 2); // 사진 안에서 불 붙은 위치
    P.by = f.y - (P.y - P.h / 2);
  }

  // 불이 붙고 0.7초 뒤 라이터는 꺼짐
  if (lighter.lit && P.burning && millis() - P.burnStart > 700) {
    lighter.lit = false;
  }

  // 불이 점점 번짐 + 탄 종이 조각
  if (P.burning && !P.gone) {
    P.r += 1.5; // 구멍 점점 커지기
    const ex = P.x - P.w / 2 + P.bx + random(-P.r, P.r);
    const ey = P.y - P.h / 2 + P.by + random(-P.r, P.r);
    if (abs(ex - P.x) < P.w / 2 && abs(ey - P.y) < P.h / 2) {
      particles.push({
        type: "ash",
        x: ex,
        y: ey,
        vx: random(-0.6, 0.6),
        vy: random(-1.5, -0.5),
        s: random(3, 6),
        life: 255,
      });
    }
    if (P.r > P.h) P.gone = true; // 다 타면 사라짐
  }
}

function drawPhoto() {
  const P = photo;
  if (P.gone) return;
  burnG.clear();
  burnG.image(photoG, 0, 0);
  if (P.burning) {
    burnG.noStroke();
    burnG.fill(90, 60, 40, 90);
    burnG.circle(P.bx, P.by, P.r * 2 + 44); // 그을음
    burnG.fill(40, 25, 20);
    burnG.circle(P.bx, P.by, P.r * 2 + 21); // 까맣게 탄 부분
    burnG.fill(255, 120 + random(60), 40);
    burnG.circle(P.bx, P.by, P.r * 2 + 7); // 불 테두리
    burnG.erase(); // 지우개
    burnG.circle(P.bx, P.by, P.r * 2); // 타서 뚫린 구멍
    burnG.noErase();
  }
  const x = P.x - P.w / 2;
  const y = P.y - P.h / 2;
  tint(0, 40); // 그림자
  image(burnG, x + 4, y + 7);
  noTint();
  image(burnG, x, y);
}

function drawLighter() {
  const L = lighter;
  push();
  translate(L.x, L.y);
  noStroke();
  fill(0, 30); // 그림자
  rect(-18, -24, 42, 84, 9);
  fill("#2e2e2e");
  rect(-21, -32, 42, 84, 9); // 몸통
  fill(255, 255, 255, 40);
  rect(-14, -24, 7, 68, 4); // 반짝임
  fill("#cfd3da");
  rect(-19, -46, 38, 18, 3); // 쇠 뚜껑
  fill("#9aa0aa");
  circle(7, -40, 12); // 바퀴
  pop();

  if (L.lit) {
    const f = flameTip();
    const s = random(0.9, 1.1); // 불꽃 흔들림
    fill(255, 170, 60, 70);
    ellipse(f.x, f.y, 38 * s, 52 * s); // 불빛
    fill(255, 150, 50);
    ellipse(f.x, f.y, 16 * s, 35 * s); // 주황 불꽃
    fill(255, 230, 140);
    ellipse(f.x, f.y + 5, 7 * s, 18 * s); // 노란 속불
  }
}

function onLighter() {
  return abs(mouseX - lighter.x) < 26 && abs(mouseY - lighter.y) < 52;
}

// 라이터 누르기 → 딸깍 (3번째에 불이 켜짐)
function strikeLighter() {
  lighter.strikes++; //딸깍 횟수 + 1
  const f = flameTip();
  if (lighter.strikes >= 3) {
    //3번째면
    lighter.lit = true; // 불켜짐
    addText("화르륵", f.x, f.y - 44);
  } else {
    //1,2번째면
    addText("딸깍", f.x, f.y - 32);
    for (let k = 0; k < 8; k++) {
      particles.push({
        type: "spark",
        x: f.x,
        y: f.y + 9,
        vx: random(-3, 3),
        vy: random(-3, 0),
        s: random(2, 4),
        life: 255,
      });
    }
  }
}

//  효과 (불티, 탄 종이 조각, 글자)
function addText(msg, x, y) {
  particles.push({
    type: "text",
    msg: msg,
    x: x,
    y: y,
    vx: 0,
    vy: -0.5,
    life: 255,
  });
}

function drawParticles() {
  noStroke();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === "spark") {
      p.life -= 8;
      fill(255, 170, 60, p.life);
      circle(p.x, p.y, p.s);
    } else if (p.type === "ash") {
      p.life -= 3;
      fill(60, 50, 45, p.life);
      rect(p.x, p.y, p.s, p.s * 0.6);
    } else if (p.type === "text") {
      p.life -= 5;
      fill(57, 73, 87, p.life);
      textAlign(CENTER, CENTER);
      textSize(18);
      text(p.msg, p.x, p.y);
    }
    if (p.life <= 0) particles.splice(i, 1); // 다 사라진 건 지움
  }
}

// =========================================================
//  버튼 + 안내 문구
// =========================================================
function drawUI() {
  const labels = ["1  폴라로이드", "2  편지", "3  인생네컷"];
  const guide = [
    "폴라로이드를 누르면 구겨집니다",
    "편지를 누른 채 문질러 찢고, 손을 떼면 사라집니다",
    "라이터를 세 번 누르면 불이 켜지고, 사진에 갖다 대면 탑니다",
  ];
  const bw = 105;
  const bh = 35;
  buttons = [];
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);
  for (let i = 0; i < 3; i++) {
    const x = width / 2 - 168 + i * 116;
    const y = 19;
    buttons.push({ x: x, y: y, n: i + 1 });
    if (level === i + 1) fill(DARK);
    else fill(255);
    rect(x, y, bw, bh, bh / 2);
    if (level === i + 1) fill(255);
    else fill(DARK);
    text(labels[i], x + bw / 2, y + bh / 2);
  }
  fill(DARK);
  textSize(14);
  text(guide[level - 1], width / 2, 77);
}

// =========================================================
//  마우스 / 키보드
// =========================================================
function mousePressed() {
  // 버튼 누르면 그 레벨로
  for (const b of buttons) {
    if (
      mouseX > b.x &&
      mouseX < b.x + 105 &&
      mouseY > b.y &&
      mouseY < b.y + 35
    ) {
      resetLevel(b.n);
      return;
    }
  }
  // Lv1 : 폴라로이드 클릭 → 구겨짐
  const P = polaroid;
  if (
    level === 1 &&
    !P.crumpled &&
    abs(mouseX - P.x) < P.w / 2 &&
    abs(mouseY - P.y) < P.h / 2
  ) {
    P.crumpled = true;
  }
  // Lv2 : 문지르기 시작한 점 기억
  if (level === 2) {
    cutStart = { x: mouseX, y: mouseY };
  }
  // Lv3 : 라이터 누르기 (켜지기 전엔 딸깍) + 잡기
  if (level === 3 && onLighter()) {
    if (!lighter.lit && !photo.burning) strikeLighter();
    lighter.drag = true;
  }
}

function mouseDragged() {
  // Lv2 : 문지르면 찢어짐 (50만큼 움직일 때마다 한 번씩)
  if (
    level === 2 &&
    cutStart &&
    !letter.scattered &&
    dist(cutStart.x, cutStart.y, mouseX, mouseY) > 44
  ) {
    tearLetter(cutStart, { x: mouseX, y: mouseY });
    cutStart = { x: mouseX, y: mouseY };
  }
  // Lv3 : 라이터 옮기기
  if (level === 3 && lighter.drag) {
    lighter.x += mouseX - pmouseX;
    lighter.y += mouseY - pmouseY;
  }
}

function mouseReleased() {
  // Lv2 : 한 번이라도 찢었으면 (조각이 2개 이상) 손 뗄 때 흩어짐
  if (level === 2 && !letter.scattered && letter.pieces.length > 1) {
    scatterLetter();
  }
  cutStart = null;
  lighter.drag = false;
}
