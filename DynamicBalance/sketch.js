const Engine = Matter.Engine; // 물리 세계 계산 엔진
const Bodies = Matter.Bodies; // 다각형 물체 만드는 도구
const Body = Matter.Body; // 물체의 속도 회전 바꾸는 도구
const Composite = Matter.Composite; // 물체 세계에 넣고 빼는 도구
const Constraint = Matter.Constraint; // 물체끼리 묶는 도구

let engine, world;
let u; // 화면 크기에 맞춘 기본 단위

let gears = []; //톱니바퀴들
let ramps = []; // 경사판들
let balls = []; // 발사된 공들
let seesaw, pivot; // 시소 몸과 축
let floorY; // 바닥선 좌표

// 대포
let cannon = { x: 0, y: 0, angle: -1.2, dir: 1 }; // 대포의 각도
const TOTAL_BALLS = 24; // 쏠 공의 개수 (다 쏘면 끝 : 24개)
let shotCount = 0; // 공 몇개 쐈는지 새는 도구

// 색
const RED = "#74aac1";
const BLUE = "#e0a3b8";
const YELLOW = "#9b8ec4";
const BLACK = "#394957";
const BG = "#dbe4f0";

function setup() {
  createCanvas(windowWidth, windowHeight); // 창 전체 캔버스
  u = min(width, height) / 800; // 짧은 변 기준 단위

  // 아래 방향 중력
  engine = Engine.create();
  world = engine.world;
  engine.gravity.y = 1; // 아래로 중력 1

  floorY = height - 40 * u; // 바닥의 y좌표 정하는 줄

  makeWalls(); // 바닥과 벽
  makeGears(); // 톱니바퀴 5개
  makeRamps(); // 경사판 2개
  makeSeesaw(); // 시소와 축

  cannon.x = width * 0.1; //대포 x좌표 : 화면 가로의 10%
  cannon.y = floorY - 40 * u; // 대포 y좌표 : 바닥선보다 40u 위
}
// 벽
function makeWalls() {
  const opt = { isStatic: true, friction: 0.3, restitution: 0.7 }; // 마찰 0.3 , 탄성 0.7
  Composite.add(world, [
    // 대괄호 3개를 세계에 넣음
    Bodies.rectangle(width / 2, floorY + 50 * u, width * 2, 100 * u, opt), // 바닥
    Bodies.rectangle(-50, height / 2, 100, height * 3, opt), // 왼쪽 벽
    Bodies.rectangle(width + 50, height / 2, 100, height * 3, opt), // 오른쪽 벽
  ]);
}
// 톱니바퀴
function makeGears() {
  const list = [
    // x비율, y비율, 반지름, 색, 회전속도
    [0.3, 0.18, 64, RED, 0.03],
    [0.62, 0.14, 56, BLUE, -0.035],
    [0.85, 0.3, 60, BLACK, 0.03],
    [0.48, 0.36, 50, YELLOW, -0.04],
    [0.16, 0.42, 46, BLUE, 0.035],
  ]; // 위치를 비율로 적어 다른 화면 크기에도 같은 자리

  for (const g of list) {
    const r = g[2] * u; // g는 0,1,2,3,4 이렇게 세기에 g2는 세번째 칸
    const gear = Bodies.polygon(width * g[0], height * g[1], 12, r, {
      // 각각 몇번째 칸인지 정의 + 12각형으로
      isStatic: true,
      restitution: 1.0, // [탄성] 톱니에 맞으면 힘껏 튕긴다
    });
    gear.r = r; // 여기서 r은 위에서 정의한 g[2]*u 의 값이다
    gear.color = g[3];
    gear.spin = g[4];
    gears.push(gear);
    Composite.add(world, gear);
  }
}
// 경사판
function makeRamps() {
  const list = [
    // x비율, y비율, 길이, 기울기
    [0.8, 0.55, 220, -0.35], //오른쪽 판
    [0.3, 0.62, 180, 0.3], //왼쪽 판
  ];

  for (const r of list) {
    //r = 톱니바퀴의 g와 같은 개념
    const ramp = Bodies.rectangle(
      width * r[0], //가로
      height * r[1], //세로
      r[2] * u, //판 길이
      12 * u, // 판 두께
      {
        isStatic: true, //고정
        angle: r[3], //기울기
        friction: 0.02, //마찰
      },
    );
    ramp.w = r[2] * u;
    ramp.h = 12 * u;
    ramps.push(ramp);
    Composite.add(world, ramp);
  }
}

//시소
function makeSeesaw() {
  const cx = width * 0.55; // 시소의 가운데 가로
  const cy = floorY - 70 * u; // 시소의 가운데 세로
  const len = 360 * u; //시소 길이

  const plank = Bodies.rectangle(cx, cy, len, 14 * u); // 가운데 긴판
  const wallL = Bodies.rectangle(cx - len / 2, cy - 22 * u, 12 * u, 44 * u); //왼쪽 벽
  const wallR = Bodies.rectangle(cx + len / 2, cy - 22 * u, 12 * u, 44 * u); //오른쪽 벽

  seesaw = Body.create({
    parts: [plank, wallL, wallR], // 3개 하나로 묶기
    friction: 0.9, // 마찰
    restitution: 0.5, // 탄성
    frictionAir: 0.03, // 흔들림 감소
  });

  // 측
  pivot = { x: cx, y: cy }; // 시소 가운데 위치 pivot = 못의 위치
  const hinge = Constraint.create({
    //hinge = 못의 역할
    pointA: pivot, // 위에서 정의한 못의 위치
    bodyB: seesaw, // 시소 가운데 잡기
    length: 0, // 못과 시소 거리 없게
    stiffness: 1, // 단단함의 차이
  });

  Composite.add(world, [seesaw, hinge]);
}
//공
function shootBall() {
  const sizes = [11, 15, 20]; // 사이즈 후보
  const r = random(sizes) * u; // 랜덤으로 화면에 맞게

  const x = cannon.x + cos(cannon.angle) * 60 * u; // 대포 중심에서 포구 끝으로
  const y = cannon.y + sin(cannon.angle) * 60 * u;

  const ball = Bodies.circle(x, y, r, {
    // x,y 위치에 크기 r 인 동그라미
    restitution: 0.85, // 탄성
    friction: 0.05, // 마찰
    frictionAir: 0.002, // 공기 저항은 아주 약하게
    density: 0.001 * (r / (15 * u)), // 무게
  });
  ball.r = r;
  // 날리는거
  const speed = sqrt(0.6 * height); //화면에 맞는 속도로 해주는 공식
  Body.setVelocity(ball, {
    x: cos(cannon.angle) * speed, // 옆으로
    y: sin(cannon.angle) * speed, // 위로
  });

  balls.push(ball);
  Composite.add(world, ball);
}
// ---------------- 그리기 함수들 ----------------
function draw() {
  background(BG); // 매번 새롭게 깨끗히
  Engine.update(engine);

  // 1. 대포 : 공을 다 쏠 때까지만 좌우로 움직이며 발사
  if (shotCount < TOTAL_BALLS) {
    //쓴 공 개수가 24개보다 작으면
    cannon.angle += 0.012 * cannon.dir; // 대포 각도를 바꿔
    if (cannon.angle > -0.9) cannon.dir = -1; // 너무 누우면 반대로
    if (cannon.angle < -1.45) cannon.dir = 1; // 너무 서면 반대로

    if (frameCount % 25 === 0) {
      // 약 0.4초마다
      shootBall(); // 공쏘기
      shotCount++; // 쏜 개수 1 늘리기
    }
  } else {
    // if 가 틀리면?
    // 2. 마지막 장면으로 : 톱니가 서서히 멈춘다
    for (const g of gears) g.spin *= 0.985; // 회전 속도 줄이기
  }

  for (const g of gears) Body.rotate(g, g.spin);

  drawFloor(); //바닥
  drawSeesaw(); // 시소
  for (const r of ramps) drawRamp(r); // 위의 경사판 목록에서 꺼내 그려
  for (const g of gears) drawGear(g); // 톱니바퀴 목록에서 꺼내 그려
  drawCannon(); // 대포
  for (const b of balls) drawBall(b); // 공 목록에서 꺼내 그려
}

//바닥
function drawFloor() {
  stroke(BLACK);
  strokeWeight(3 * u);
  line(0, floorY, width, floorY);
}
//톱니바퀴
function drawGear(g) {
  push();
  translate(g.position.x, g.position.y); // 톱니 위치가 0,0
  rotate(g.angle); // 앵글 돌리기
  //톱니바퀴 이빨들
  noStroke();
  fill(g.color); // 위에서 정의한 톱니 색 지정
  for (let i = 0; i < 12; i++) {
    //12번 반복 = 12각형이니까
    push();
    rotate((TWO_PI * i) / 12); // 12각형이니 30도씩
    rect(g.r - 4 * u, -7 * u, 16 * u, 14 * u, 2 * u); //네모 하나 그리기
    pop();
  }
  circle(0, 0, g.r * 2); // 그 가운데 동그라미 하나 그래서 12각형의 각진거 안보임

  // 가운데 원
  fill(BG); // 동그라미 가운데에 배경색과 같은 동그라미 하나
  circle(0, 0, g.r * 0.9);
  // 가운데 십자 막대
  stroke(g.color);
  strokeWeight(4 * u);
  line(-g.r * 0.45, 0, g.r * 0.45, 0);
  line(0, -g.r * 0.45, 0, g.r * 0.45);
  // 십자 가운데에 또 동그라미
  noStroke();
  fill(BLACK);
  circle(0, 0, 8 * u);
  pop();
}
// 경사판
function drawRamp(r) {
  push();
  translate(r.position.x, r.position.y);
  rotate(r.angle);
  noStroke();
  fill(BLACK);
  rectMode(CENTER); // 가운데를 중심으로
  rect(0, 0, r.w, r.h, r.h / 2);
  pop();
} // 위에랑 똑같은 효과
// 시소
function drawSeesaw() {
  // 받침대
  noStroke();
  fill(BLACK);
  triangle(
    //삼각형으로
    pivot.x,
    pivot.y, // 점1 위에서 말한 가운데 점 자리
    pivot.x - 30 * u,
    floorY, // 점2 왼쪽 아래
    pivot.x + 30 * u,
    floorY, // 점3 오른쪽 아래
  );

  // 저울 : 판과 양쪽 벽
  const parts = seesaw.parts.slice(1); // slice(1)은 1번 칸부터 끝까지. 0번인 몸 전체는 빼고 나머지만
  // 판 (빨강)
  fill(RED);
  drawPart(parts[0]);

  // 왼쪽 벽 (파랑)
  fill(BLUE);
  drawPart(parts[1]);

  // 오른쪽 벽 (파랑)
  fill(BLUE);
  drawPart(parts[2]);

  // 노란점
  fill(YELLOW);
  circle(pivot.x, pivot.y, 14 * u); // 위 받침대 점1과 같은 자리에서 동그라미
}
function drawPart(part) {
  beginShape();
  for (const v of part.vertices) vertex(v.x, v.y);
  endShape(CLOSE);
}
// 대포
function drawCannon() {
  push();
  translate(cannon.x, cannon.y); // 종이를 대포 위치로
  rotate(cannon.angle); // 종이 돌리기
  noStroke();
  fill(BLACK);
  rect(0, -13 * u, 64 * u, 26 * u, 4 * u); //오른쪽으로 뻗은거
  pop();
  // 대포 위의 빨간 원
  fill(RED);
  circle(cannon.x, cannon.y, 60 * u);
}
// 농구공
function drawBall(b) {
  const r = b.r;
  push();
  translate(b.position.x, b.position.y);
  rotate(b.angle);

  noStroke();
  fill("#e7bbcd");
  circle(0, 0, r * 2); // 공 몸통

  // 농구공 줄무늬가 공안에만 그려지게 하는 코드
  drawingContext.beginPath();
  drawingContext.arc(0, 0, r, 0, TWO_PI);
  drawingContext.clip();

  noFill(); // 선만
  stroke(BLACK);
  strokeWeight(max(1, r * 0.12)); // 공 크기의 12%의 굵기
  line(-r, 0, r, 0); // 가로줄
  line(0, -r, 0, r); // 세로줄
  arc(-r, 0, r * 1.2, r * 1.8, -HALF_PI, HALF_PI); //왼쪽 곡선
  arc(r, 0, r * 1.2, r * 1.8, HALF_PI, PI + HALF_PI); // 오른쪽 곡선

  pop();
}
