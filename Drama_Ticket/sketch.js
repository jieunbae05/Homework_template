// Rewatch — 드라마 티켓 아카이브 (You memo? I memo!) — p5.js

//    드라마를 많이 보는 사람을 위한 감상 메모장. 노트북·모니터 화면 기준.
//    메모 하나 = 드라마 하나 = 영화표(포토티켓) 한 장. 처음엔 티켓만 벽에 걸려 있고, 누르면 한 장만 크게
//      · 앞면 = 포스터 · 제목,  뒷면 = 기본 정보 간략히 + 내 평점 + 내가 붙인 키워드 + 한줄평 + 회차 띠 + 관람 기록
//      · 볼 때마다(1회차, 2회차 …) 감상이 따로 쌓여서 '그때와 지금'을 비교할 수 있음

//    ─ 동작 ─
//      + 새 티켓 ................ 제목 · 연도 · 방송사 · 평점 · 키워드 · 한줄평 · 포스터 사진까지 직접 입력
//      위 검색창 ................ 제목 · 연도로 찾기 (내 티켓 + 처음 보는 드라마는 TVmaze 정보로 발권)
//      벽의 티켓 톡 ............. 가운데 한 장만 크게 (바깥 = 닫기 · ‹ › / 방향키 = 옆 티켓)
//      큰 티켓 톡 / 옆으로 밀기 ... 뒤집기 (앞면 포스터 ↔ 뒷면 정보 · 평점 · 키워드)
//      뒷면 회차 띠 위를 긋기 .... 회차별 재미 기록 (높게 그을수록 재밌음) · 꾹 = 그 화 메모
//      뒷면 ↻ 다시 보기 .......... 지금 감상을 보관하고 새 회차(2회차 …)로
//      (벽의 티켓을 꾹 눌러 다른 티켓과 잇는 기능은 뺌)
//      (지그재그로 지우기는 뺌 · 크게 연 티켓 옆 '삭제'로 지움)
//      상자 앞판 톡 ............. 그 자리에서 서랍이 열리고 그 해 티켓들이 펼쳐짐 (바깥 / Esc = 닫기)
//      [감상] .................. 볼 때마다 남긴 한줄평 · 회차 메모를 한곳에 (다시 본 드라마는 회차끼리 나란히)
//      [취향] .................. ♥한 드라마를 결 · 연도별로 쌓은 그래프 → "나는 대부분 ○○파" · 아래로 내리면 같은 결 추천
//      [폴더] .................. 직접 만드는 폴더 · 연 폴더의 + 칸 = 티켓 골라 넣기 · 끌어다 놓아도 묶임
//      큰 티켓 왼쪽 ↺ 초기화 ...... 지금 회차의 평점 · 관람평 · 회차 평 · 메모를 비움 (알림 톡 = 되돌리기)

//    ─ 이 파일의 순서 ─
//      1. 설정값   2. 상태 변수   3. setup / draw   4. 데이터·저장   5. 드라마 정보 (TVmaze)
//      6. 화면 배치 · 위쪽   7. 티켓 벽   8. 크게 연 티켓   9. 감상   10. 취향 그래프 · 추천   11. 폴더
//      12. 알림 · 사용법   13. 그리기 도우미 (글자 · 별 · 하트 · 티켓 모양 · 바코드)
//      14. 터치 제스처   15. 기능   16. HTML: 검색창 · 발권 · 감상 · 회차 메모 · 모든 감상 · 폴더

//    ─ 주의 ─
//    p5가 이미 쓰는 이름(save, remove, shuffle, text, select, year, month …)으로
//    함수나 변수를 만들면 앱이 멈춰요. 그래서 saveData, fitStr, yearNow처럼 이름을 지었어요.
//  ===================================================================== */

/* =========================================================
   1. 설정값
========================================================= */
const DAY = 24 * 60 * 60 * 1000;
const W0 = 1280; // 화면을 이 크기로 그린 뒤 창에 맞춰 통째로 늘리고 줄임
const H0 = 800;
const HOLD_MS = 450; // 이만큼 꾹 누르면 회차 메모 / 티켓 들기
const DOUBLE_MS = 320; // 이 안에 두 번 톡 = ♥
const ZIGZAG_TURNS = 3; // 좌우로 이만큼 꺾으면 '지우기'
const ZIGZAG_MIN = 40;
const SWIPE_MIN = 60; // 이만큼 옆으로 밀면 뒤집기 · 다른 해
const PEAK_MIN = 0.6; // 이 위로 재밌었던 화만 강조
const REVIEW_MAX = 400; // 관람평 글자 수 (한 줄도, 길게도)
const STORAGE_KEY = "rewatch-ticket-v1";

// ★ 저장 칸 고르기 — 이 한 줄만 바꾸면 됨 · 칸마다 티켓 · 감상 · 폴더가 따로 저장돼요
//   "v1" = 내 일지 (지금까지 쓴 것)
//   "v2" = 체험용 (발표 · 다른 사람용) · "v3", "v4" … 얼마든지
//   새 칸은 예시 티켓으로 시작하고, 시작 화면 · 탭 시연도 그 칸에서 처음 한 번 나와요
//   (주소 끝에 ?slot=v2 를 붙여 열면 그 칸으로)
const SLOT = "final"; // 제출용 칸 (어느 컴퓨터든 처음 열면 맨 아래 STARTER 76장으로 시작 · 예전 v1·v2 저장과 안 섞임)

// ★ 새로고침할 때마다 시작 화면 + 손가락 시연을 띄울지 (false = 처음 한 번만)
const INTRO_EVERY = true; // 새로고침할 때마다 시작 화면 · 시연을 다시 (false = 처음 한 번만)
const CAT_KEY = "rewatch-ticket-catalog"; // 연도별 목록의 포스터 정보 (한 번 찾으면 기억)

// 색 — 어두운 바탕 위 크림색 종이 티켓, 드라마마다 강조색 하나
const C = {
  bg: "#161618",
  panel: "#1F1F23",
  box: "#28282D",
  paper: "#F2EDE3",
  ink: "#17171A",
  dim: "#A3A09A",
  faint: "#5E5B57",
};
const ACCENTS = [
  "#E8483B",
  "#F2B53A",
  "#2FA39A",
  "#8C6CE0",
  "#F07A2E",
  "#4C86E8",
  "#E05D8C",
  "#7DBB52",
];
const HEART = "#FF4F6D";
const HINT_SPEED = 0.0016; // 안내 글자(↻ 뒤집기 · ↓ 아래로)가 깜빡이고 들썩이는 속도 — 작을수록 천천히 (한 번에 약 4초)

// 글꼴
const DISP = "Black Han Sans, Noto Sans KR, sans-serif"; // 한글 제목
const LAB = "Bebas Neue, Noto Sans KR, sans-serif"; // 티켓 라벨 · 숫자
const BODY = "Noto Sans KR, sans-serif"; // 본문

const STATUS = {
  watching: { ko: "보는 중" },
  done: { ko: "완주" },
  want: { ko: "볼 것" },
};
const ORDER = ["watching", "done", "want"];

// 드라마의 '결' — 취향 그래프와 "나는 대부분 ○○파"에 씀
const KINDS = [
  "로맨스",
  "휴먼",
  "스릴러",
  "판타지",
  "코미디",
  "사극",
  "메디컬",
  "가족",
];
const KIND_COL = {
  로맨스: "#E05D8C",
  휴먼: "#F2B53A",
  스릴러: "#8C6CE0",
  판타지: "#4C86E8",
  코미디: "#F07A2E",
  사극: "#E8483B",
  메디컬: "#2FA39A",
  가족: "#7DBB52",
};

// 키워드 · 폴더 이름 추천
const KEY_PRESETS = [
  "인생작",
  "눈물버튼",
  "설렘",
  "힐링",
  "여운",
  "도파민",
  "밤샘정주행",
  "OST맛집",
  "성장",
  "가족",
];
const FOLDER_NAMES = [
  "주말에 몰아보기",
  "엄마랑 같이 본",
  "비 오는 날",
  "우울할 때 처방",
  "N회차 필수",
];

// 오른쪽 화면 탭
const VIEWS = [
  ["ticket", "티켓"],
  ["reviews", "감상"],
  ["taste", "취향"],
  ["folders", "폴더"],
];

// 연도별 대표 드라마 목록 [한글 제목, 영어 제목(TVmaze 검색용), 방송사, 회차, 결]
// 모든 드라마가 아니라 해마다 화제작 몇 편 — 목록에 없는 건 위 검색창으로 발권하면 그 해에 같이 보여요
const CATALOG = {
  2015: [
    ["응답하라 1988", "Reply 1988", "tvN", 20, "휴먼"],
    ["그녀는 예뻤다", "She Was Pretty", "MBC", 16, "로맨스"],
    ["오 나의 귀신님", "Oh My Ghost", "tvN", 16, "판타지"],
    ["킬미, 힐미", "Kill Me, Heal Me", "MBC", 20, "로맨스"],
    ["프로듀사", "The Producers", "KBS2", 12, "코미디"],
    ["육룡이 나르샤", "Six Flying Dragons", "SBS", 50, "사극"],
  ],
  2016: [
    ["도깨비", "Guardian: The Lonely and Great God", "tvN", 16, "판타지"],
    ["태양의 후예", "Descendants of the Sun", "KBS2", 16, "로맨스"],
    ["시그널", "Signal", "tvN", 16, "스릴러"],
    ["또 오해영", "Another Miss Oh", "tvN", 18, "로맨스"],
    ["구르미 그린 달빛", "Love in the Moonlight", "KBS2", 18, "사극"],
    ["역도요정 김복주", "Weightlifting Fairy Kim Bok-joo", "MBC", 16, "로맨스"],
  ],
  2017: [
    ["비밀의 숲", "Stranger", "tvN", 16, "스릴러"],
    ["슬기로운 감빵생활", "Prison Playbook", "tvN", 16, "휴먼"],
    ["쌈, 마이웨이", "Fight for My Way", "KBS2", 16, "로맨스"],
    [
      "이번 생은 처음이라",
      "Because This Is My First Life",
      "tvN",
      16,
      "로맨스",
    ],
    ["힘쎈여자 도봉순", "Strong Woman Do Bong-soon", "JTBC", 16, "코미디"],
    ["당신이 잠든 사이에", "While You Were Sleeping", "SBS", 32, "판타지"],
  ],
  2018: [
    ["나의 아저씨", "My Mister", "tvN", 16, "휴먼"],
    ["미스터 션샤인", "Mr. Sunshine", "tvN", 24, "사극"],
    ["SKY 캐슬", "SKY Castle", "JTBC", 20, "스릴러"],
    [
      "김비서가 왜 그럴까",
      "What's Wrong with Secretary Kim",
      "tvN",
      16,
      "로맨스",
    ],
    ["라이브", "Live", "tvN", 18, "휴먼"],
    ["백일의 낭군님", "100 Days My Prince", "tvN", 16, "사극"],
  ],
  2019: [
    ["사랑의 불시착", "Crash Landing on You", "tvN", 16, "로맨스"],
    ["동백꽃 필 무렵", "When the Camellia Blooms", "KBS2", 20, "휴먼"],
    ["호텔 델루나", "Hotel del Luna", "tvN", 16, "판타지"],
    ["스토브리그", "Hot Stove League", "SBS", 16, "휴먼"],
    ["킹덤", "Kingdom", "Netflix", 6, "스릴러"],
    ["멜로가 체질", "Be Melodramatic", "JTBC", 16, "코미디"],
  ],
  2020: [
    ["이태원 클라쓰", "Itaewon Class", "JTBC", 16, "휴먼"],
    ["슬기로운 의사생활", "Hospital Playlist", "tvN", 12, "메디컬"],
    ["사이코지만 괜찮아", "It's Okay to Not Be Okay", "tvN", 16, "로맨스"],
    ["부부의 세계", "The World of the Married", "JTBC", 16, "스릴러"],
    ["스타트업", "Start-Up", "tvN", 16, "로맨스"],
    ["스위트홈", "Sweet Home", "Netflix", 10, "스릴러"],
  ],
  2021: [
    ["오징어 게임", "Squid Game", "Netflix", 9, "스릴러"],
    ["빈센조", "Vincenzo", "tvN", 20, "코미디"],
    ["갯마을 차차차", "Hometown Cha-Cha-Cha", "tvN", 16, "로맨스"],
    ["그 해 우리는", "Our Beloved Summer", "SBS", 16, "로맨스"],
    ["D.P.", "D.P.", "Netflix", 6, "휴먼"],
  ],
  2022: [
    ["이상한 변호사 우영우", "Extraordinary Attorney Woo", "ENA", 16, "휴먼"],
    ["나의 해방일지", "My Liberation Notes", "JTBC", 16, "휴먼"],
    ["스물다섯 스물하나", "Twenty-Five Twenty-One", "tvN", 16, "로맨스"],
    ["재벌집 막내아들", "Reborn Rich", "JTBC", 16, "판타지"],
    ["사내맞선", "Business Proposal", "SBS", 12, "코미디"],
    ["우리들의 블루스", "Our Blues", "tvN", 20, "휴먼"],
  ],
  2023: [
    ["무빙", "Moving", "Disney+", 20, "판타지"],
    ["더 글로리 파트2", "The Glory", "Netflix", 16, "스릴러"],
    ["닥터 차정숙", "Doctor Cha", "JTBC", 16, "가족"],
    ["킹더랜드", "King the Land", "JTBC", 16, "로맨스"],
    ["연인", "My Dearest", "MBC", 21, "사극"],
    [
      "정신병동에도 아침이 와요",
      "Daily Dose of Sunshine",
      "Netflix",
      12,
      "메디컬",
    ],
  ],
  2024: [
    ["눈물의 여왕", "Queen of Tears", "tvN", 16, "로맨스"],
    ["선재 업고 튀어", "Lovely Runner", "tvN", 16, "로맨스"],
    ["정년이", "Jeongnyeon: The Star Is Born", "tvN", 12, "휴먼"],
    ["내 남편과 결혼해줘", "Marry My Husband", "tvN", 16, "판타지"],
    ["엄마친구아들", "Love Next Door", "tvN", 16, "로맨스"],
    ["지금 거신 전화는", "When the Phone Rings", "MBC", 12, "로맨스"],
  ],
  2025: [
    ["폭싹 속았수다", "When Life Gives You Tangerines", "Netflix", 16, "가족"],
    ["미지의 서울", "Our Unwritten Seoul", "tvN", 12, "휴먼"],
    ["언젠가는 슬기로운 전공의생활", "Resident Playbook", "tvN", 12, "메디컬"],
    ["중증외상센터", "The Trauma Code: Heroes on Call", "Netflix", 8, "메디컬"],
  ],
};

// 추천용으로 더 넣은 드라마 (위 목록에 그 해 칸으로 합쳐짐) — 추천을 다 발권해도 같은 결이 계속 나오게
const CATALOG_MORE = {
  2005: [["내 이름은 김삼순", "My Lovely Sam Soon", "MBC", 16, "로맨스"]],
  2007: [
    ["커피프린스 1호점", "Coffee Prince", "MBC", 17, "로맨스"],
    ["하얀거탑", "The White Tower", "MBC", 20, "메디컬"],
  ],
  2010: [["시크릿 가든", "Secret Garden", "SBS", 20, "로맨스"]],
  2012: [
    ["응답하라 1997", "Reply 1997", "tvN", 16, "휴먼"],
    ["해를 품은 달", "The Moon Embracing the Sun", "MBC", 20, "사극"],
  ],
  2013: [
    ["별에서 온 그대", "My Love from the Star", "SBS", 21, "판타지"],
    ["응답하라 1994", "Reply 1994", "tvN", 21, "휴먼"],
    ["굿 닥터", "Good Doctor", "KBS2", 20, "메디컬"],
  ],
  2014: [
    ["괜찮아, 사랑이야", "It's Okay, That's Love", "SBS", 16, "로맨스"],
    ["미생", "Misaeng", "tvN", 20, "휴먼"],
  ],
  2016: [
    ["질투의 화신", "Don't Dare to Dream", "SBS", 24, "로맨스"],
    ["W", "W", "MBC", 16, "판타지"],
    ["낭만닥터 김사부", "Dr. Romantic", "SBS", 20, "메디컬"],
    ["디어 마이 프렌즈", "Dear My Friends", "tvN", 16, "가족"],
  ],
  2017: [
    ["보이스", "Voice", "OCN", 16, "스릴러"],
    ["고백부부", "Go Back Couple", "KBS2", 12, "가족"],
  ],
  2020: [
    ["런 온", "Run On", "JTBC", 16, "로맨스"],
    ["여신강림", "True Beauty", "tvN", 16, "로맨스"],
    ["하이에나", "Hyena", "SBS", 16, "스릴러"],
    ["구미호뎐", "Tale of the Nine Tailed", "tvN", 16, "판타지"],
    ["경이로운 소문", "The Uncanny Counter", "OCN", 16, "판타지"],
    ["철인왕후", "Mr. Queen", "tvN", 20, "사극"],
  ],
  2021: [
    ["유미의 세포들", "Yumi's Cells", "tvN", 14, "로맨스"],
    ["옷소매 붉은 끝동", "The Red Sleeve", "MBC", 17, "사극"],
    ["나빌레라", "Navillera", "tvN", 12, "휴먼"],
    ["모범택시", "Taxi Driver", "SBS", 16, "스릴러"],
    ["괴물", "Beyond Evil", "JTBC", 16, "스릴러"],
    ["마우스", "Mouse", "tvN", 20, "스릴러"],
    ["술꾼도시여자들", "Work Later, Drink Now", "TVING", 12, "코미디"],
  ],
  2022: [
    ["사랑의 이해", "The Interest of Love", "JTBC", 16, "로맨스"],
    ["기상청 사람들", "Forecasting Love and Weather", "JTBC", 16, "로맨스"],
    ["슈룹", "Under the Queen's Umbrella", "tvN", 16, "사극"],
  ],
  2023: [["웰컴투 삼달리", "Welcome to Samdal-ri", "JTBC", 16, "가족"]],
};
Object.entries(CATALOG_MORE).forEach(([y, rows]) =>
  rows.forEach((row) => {
    const list = (CATALOG[y] = CATALOG[y] || []);
    if (!list.some((r0) => r0[1] === row[1])) list.push(row);
  }),
);

/* =========================================================
   2. 상태 변수
========================================================= */
let data; // 저장되는 데이터 { dramas: [...], sets: [...] }
let cnv;
let K = 1; // 1280×800 그림 → 실제 창 배율
let OX = 0; // 가운데 맞춤 여백
let OY = 0;
let L = {}; // 이번 프레임에 누를 수 있는 자리들
let g = null; // 지금 손가락으로 하는 동작 (gesture의 g) — 누르면 만들고 떼면 지움
let panel = null; // 열려 있는 카드 창 (HTML)
let ui = {}; // 검색창 HTML 요소들 { wrap, input, drop, linkTo }
let view = "ticket"; // 오른쪽 화면: ticket | years | taste | folders
let selId = null; // 크게 보고 있는 티켓
let opened = false; // 티켓 한 장을 크게 열어 둔 상태인지
let filter = "all"; // 티켓 벽 칸: all(전체 티켓) | rewatch(재시청) | want(예매 = 아직 안 본, 미리 뽑아 둔 티켓) | liked(♥)
const SHELVES = [
  ["all", "전체 티켓"],
  ["rewatch", "재시청"],
  ["want", "예매"],
  ["liked", "♥"],
];
let rackScroll = 0;
let newestFirst = true; // 상자 정렬: 최신순 ↔ 오래된순
let peekId = null; // 상자에서 쏙 올라와 오른쪽에 보이는 티켓
const liftT = {}; // 티켓마다 올라온 정도 (0~1)
let folderScroll = 0;
let folderSel = null; // 열어 본 폴더 (없으면 폴더 전체)
let openScroll = 0; // 연 폴더 안 스크롤 (빨랫줄이 여러 줄일 때)
let openFor = null; // 스크롤을 기억하는 폴더
let yearNow = 2024; // 연도별에서 보고 있는 해
let flipT = 0; // 큰 티켓 뒤집힌 정도 (0 앞면 → 1 뒷면)
let flipTo = 0;
let openT = 1; // 새 티켓을 열 때 올라오는 정도
let toastBox = null;
let helpOpen = false;
let helpManual = false; // ?를 눌러 직접 연 사용법인지
let helpOnly = false; // ? 메뉴에서 '처음 화면'만 고른 경우
let helpMenu = false; // ? 를 눌러 연 '다시 보기' 메뉴
let catInfo = {}; // 연도별 목록의 포스터 정보 { 영어 제목: TVmaze 결과 }
const catTried = new Set();
let catBusy = false;
let lastTap = null; // 두 번 톡 판단용 { key, t }
let pendingTap = null; // 한 번 톡 예약 (두 번째 톡이 오면 취소)
let heartPop = null; // ♥ 터지는 효과 { key, t }
let wheelLock = false;
let tasteScroll = 0; // 취향 화면 스크롤 (아래 = 취향 추천)
let reviewScroll = 0; // 감상 화면 스크롤
// 서랍: 상자 앞판 톡 = 그 자리에서 서랍이 살짝 빠져나오고, 안의 티켓들이 펼쳐지며 위로 뜸
let drawerYr = null; // 열린 상자의 연도 (없으면 null)
let drawerAt = 0; // 연 시각
let drawerClosing = 0; // 닫기 시작한 시각 (0 = 닫는 중 아님)
const drawerFace = {}; // 상자마다 앞판이 빠져나온 정도 (0~1)
let drawerBox = null; // 이번 프레임에 열린 상자 자리 { gp, bx, by }

/* =========================================================
   3. p5 기본 함수
========================================================= */
// ▶ setup — 앱을 켤 때 한 번: 캔버스, 데이터, 검색창, 터치 연결, 정보 찾기
// 오래된 사파리 등 roundRect가 없는 브라우저용 (없으면 그냥 네모로)
if (
  typeof CanvasRenderingContext2D !== "undefined" &&
  !CanvasRenderingContext2D.prototype.roundRect
)
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) {
    this.rect(x, y, w, h);
  };
// 한글 입력 중(글자 조합 중)에 버튼을 누르면, 사파리 등은 첫 클릭을 '글자 확정'에만 써서 버튼이 안 눌림
//   → 조합 중에 커서가 버튼 위로 올라가면 미리 글자를 확정(blur)해 둠 → 저장 버튼이 한 번에 눌림
let imeComposing = false;
document.addEventListener(
  "compositionstart",
  () => (imeComposing = true),
  true,
);
document.addEventListener("compositionend", () => (imeComposing = false), true);
document.addEventListener(
  "pointerover",
  (e) => {
    if (!imeComposing) return;
    const b = e.target && e.target.closest && e.target.closest("button");
    const a = document.activeElement;
    if (b && inline && inline.box.contains(b)) return; // 제목 칸 옆 '자동 찾기'는 그대로 (조합 중 글자도 읽음)
    if (b && a && a !== document.body && !b.contains(a)) {
      imeComposing = false;
      a.blur();
    }
  },
  true,
);
function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.elt.style.touchAction = "none";
  cnv.elt.style.display = "block";
  if (document.fonts && document.fonts.load)
    ["16px Black Han Sans", "16px Bebas Neue", "16px Noto Sans KR"].forEach(
      (f) => document.fonts.load(f).catch(() => {}),
    );

  loadProfiles(); // 저장 칸 정하기 (맨 위 SLOT · 주소 ?slot=)
  initData(); // 티켓 불러오기 · 같은 드라마 합치기 · 상태 맞추기 (없으면 예시 티켓)
  catInfo = loadCat();
  makeSearch();
  layout();

  helpOpen = !seenOnce("start") || INTRO_EVERY; // '무슨 앱인지 · 쓰는 법' 시작 화면은 처음 한 번만 (다시 보기 = 오른쪽 위 ?)

  const el = cnv.elt;
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.addEventListener("wheel", onWheel, { passive: false });

  fetchMissingInfo();
  watchBebas(); // 창 · 검색창의 Bebas 라벨 속 한글을 본문 글꼴로
}

// ▶ draw — 1초에 60번: 바탕 → 위쪽 → 티켓 벽(또는 연도별 · 취향 · 폴더) → 크게 연 티켓 → 들고 있는 티켓 → 알림 → 사용법
function draw() {
  if (width !== windowWidth || height !== windowHeight) fitToWindow();
  checkHold();
  const sp = Math.min(1, (deltaTime / 1000) * 10);
  openT += (1 - openT) * sp;
  flipT += (flipTo - flipT) * sp;
  if (Math.abs(flipTo - flipT) < 0.003) flipT = flipTo;

  background(C.bg);
  push();
  translate(OX, OY);
  scale(K);
  L = { hits: [] };
  drawTop();
  if (ui.input) {
    const ph =
      view === "reviews"
        ? "감상에서 찾기 · 제목 · 관람평 · 메모"
        : "제목 · 방송사 · 연도로 찾기";
    if (ui.input.placeholder !== ph) ui.input.placeholder = ph;
  }
  if (view === "reviews") drawReviews();
  else if (view === "taste") drawTaste();
  else if (view === "folders") {
    drawFolders();
    if (opened) drawOpen();
  } else {
    drawWall();
    if (opened) drawOpen();
  }
  drawCarry();
  drawTabTip();
  if (tour) drawTour();
  if (helpMenu) drawHelpMenu();
  drawToast();
  if (helpOpen) drawHelp();
  else helpT0 = 0; // 다음에 열 때 처음부터 다시 움직이게
  pop();
  if (ui.wrap)
    ui.wrap.style.visibility =
      helpOpen || tour || !demoSearch ? "hidden" : "visible"; // 사용법이 떠 있으면 검색창 숨김
}

function windowResized() {
  fitToWindow();
}

// ▶ fitToWindow — 캔버스를 창 크기에 맞추고 배치를 다시 계산
function fitToWindow() {
  resizeCanvas(windowWidth, windowHeight);
  layout();
}

/* =========================================================
   4. 데이터 · 저장
   드라마 하나: { id, title, en, tvId, poster, posterBig, year, network, eps, info{genres, summary, premiered, ended},
                 status, upTo, scores[회차], review, rating(1~10), watchLabel("2회차"), watchStart,
                 history[{ label, start, end, scores, review, rating, upTo }]   ← 지난 감상들
                 keys[키워드], liked(♥), kind(결), notes{회차: 메모}, times{회차: "38:20"}, savedAt, touched, infoTried }
   직접 만든 폴더 하나: { id, name, color, ids: [드라마 id …] }
   (키워드 폴더는 저장하지 않고, 같은 키워드를 단 티켓을 그때그때 모아서 보여 줌)
========================================================= */
// ▶ makeDrama — 드라마 하나 만들기
function makeDrama(info, extra = {}) {
  const now = Date.now();
  const eps = Math.max(1, Math.min(60, info.eps || 16));
  const fill = (arr) =>
    (arr || [])
      .slice(0, eps)
      .concat(new Array(Math.max(0, eps - (arr || []).length)).fill(null));
  return {
    id: String(now) + Math.random().toString(16).slice(2, 6),
    title: info.title,
    en: info.en || "",
    tvId: info.tvId || null,
    poster: info.poster || "",
    posterBig: info.posterBig || "",
    year: info.year || "",
    network: info.network || "",
    eps,
    info: info.info || null,
    kind: info.kind || null,
    status: extra.status || "watching",
    upTo: Math.min(eps, extra.upTo || 0),
    scores: fill(extra.scores),
    review: extra.review || "",
    rating: extra.rating || null,
    keys: extra.keys || [],
    liked: !!extra.liked,
    watchLabel: extra.watchLabel || "1회차",
    watchStart: extra.watchStart || now,
    history: (extra.history || []).map((h) => ({
      ...h,
      scores: fill(h.scores),
    })),
    notes: extra.notes || {},
    times: extra.times || {},
    savedAt: extra.savedAt || now,
    touched: extra.touched || now,
    infoTried: !!info.poster,
  };
}

// ▶ upgrade — 예전에 저장한 데이터에 새 칸이 없으면 채워 줌
function upgrade(d) {
  d.history = d.history || [];
  d.notes = d.notes || {};
  d.times = d.times || {};
  d.keys = d.keys || [];
  d.liked = !!d.liked;
  d.watchLabel = d.watchLabel || `${d.history.length + 1}회차`;
  d.watchStart = d.watchStart || d.savedAt || Date.now();
  if (d.rating === undefined) d.rating = null;
  if (d.kind === undefined) d.kind = null;
}

// ▶ sampleDramas — 처음 열었을 때 보여 줄 예시 (감상·재미 값은 예시)
function sampleDramas() {
  const t = (y, m) => new Date(y, m - 1, 10).getTime();
  const c = (arr) => arr.map((v) => v / 10);
  return [
    makeDrama(
      {
        title: "나의 아저씨",
        en: "My Mister",
        year: "2018",
        network: "tvN",
        eps: 16,
        kind: "휴먼",
      },
      {
        liked: true,
        status: "done",
        upTo: 16,
        rating: 10,
        watchLabel: "2회차",
        watchStart: t(2026, 9),
        keys: ["인생작", "눈물버튼", "여운"],
        scores: c([7, 7, 8, 9, 8, 8, 9, 9, 8, 9, 10, 9, 8, 9, 9, 10]),
        review: "힘들 때 다시 보는 드라마. 이번엔 지안이 대사가 다 들렸다",
        history: [
          {
            label: "1회차",
            start: t(2019, 5),
            end: t(2019, 6),
            rating: 7,
            upTo: 16,
            scores: c([4, 5, 5, 4, 6, 6, 7, 8, 7, 8, 9, 8, 7, 8, 8, 9]),
            review: "처음엔 너무 어둡다고 생각함. 후반부는 좋았다",
          },
        ],
        notes: { 10: "후계동 술자리", 15: '"파이팅"' },
        times: { 15: "1:12:40" },
      },
    ),
    makeDrama(
      {
        title: "눈물의 여왕",
        en: "Queen of Tears",
        year: "2024",
        network: "tvN",
        eps: 16,
        kind: "로맨스",
      },
      {
        liked: true,
        status: "watching",
        upTo: 6,
        watchLabel: "2회차",
        watchStart: t(2026, 10),
        keys: ["설렘", "OST맛집"],
        scores: c([8, 8, 7, 8, 9, 8]),
        history: [
          {
            label: "1회차",
            start: t(2024, 3),
            end: t(2024, 4),
            rating: 8,
            upTo: 16,
            scores: c([7, 8, 7, 7, 8, 7, 9, 10, 8, 7, 7, 8, 7, 9, 8, 9]),
            review: "8화 엔딩 미쳤다. 중반은 좀 늘어짐",
          },
        ],
        notes: { 7: "엔딩 직전 대사" },
        times: { 7: "1:08:30" },
      },
    ),
    makeDrama(
      {
        title: "정년이",
        en: "Jeongnyeon: The Star Is Born",
        year: "2024",
        network: "tvN",
        eps: 12,
        kind: "휴먼",
      },
      {
        status: "watching",
        upTo: 7,
        keys: ["성장"],
        scores: c([6, 7, 6, 8, 9, 7, 8]),
        notes: { 3: "첫 무대, 소름" },
        times: { 3: "52:10" },
      },
    ),
    makeDrama(
      {
        title: "선재 업고 튀어",
        en: "Lovely Runner",
        year: "2024",
        network: "tvN",
        eps: 16,
        kind: "로맨스",
      },
      {
        liked: true,
        status: "done",
        upTo: 16,
        rating: 9,
        keys: ["설렘", "OST맛집"],
        scores: c([8, 9, 7, 8, 7, 8, 9, 10, 8, 7, 8, 9, 7, 8, 9, 10]),
        review: "비 오는 날 우산 장면 = 레전드",
        notes: { 7: "타임슬립 반전" },
      },
    ),
    makeDrama(
      {
        title: "폭싹 속았수다",
        en: "When Life Gives You Tangerines",
        year: "2025",
        network: "Netflix",
        eps: 16,
        kind: "가족",
      },
      {
        liked: true,
        status: "done",
        upTo: 16,
        rating: 10,
        keys: ["인생작", "눈물버튼"],
        scores: c([8, 8, 9, 10, 8, 8, 7, 9, 8, 8, 9, 10, 8, 8, 9, 9]),
        review: "휴지 필수. 엄마한테 전화하게 되는 드라마",
      },
    ),
    makeDrama(
      {
        title: "무빙",
        en: "Moving",
        year: "2023",
        network: "Disney+",
        eps: 20,
        kind: "판타지",
      },
      {
        liked: true,
        status: "watching",
        upTo: 12,
        keys: ["도파민", "밤샘정주행"],
        scores: c([7, 7, 6, 6, 7, 8, 9, 7, 9, 10, 8, 7]),
      },
    ),
    makeDrama(
      {
        title: "비밀의 숲",
        en: "Stranger",
        year: "2017",
        network: "tvN",
        eps: 16,
        kind: "스릴러",
      },
      { status: "want" },
    ),
    makeDrama(
      {
        title: "미스터 션샤인",
        en: "Mr. Sunshine",
        year: "2018",
        network: "tvN",
        eps: 24,
        kind: "사극",
      },
      { status: "want" },
    ),
    // 예전에 다 보고 ♥한 드라마들 (연도별 · 취향 그래프 · 키워드 폴더 예시)
    ...[
      [
        "응답하라 1988",
        "Reply 1988",
        "2015",
        "tvN",
        20,
        "휴먼",
        10,
        ["인생작", "가족", "힐링"],
      ],
      [
        "도깨비",
        "Guardian: The Lonely and Great God",
        "2016",
        "tvN",
        16,
        "판타지",
        9,
        ["설렘", "OST맛집"],
      ],
      [
        "슬기로운 감빵생활",
        "Prison Playbook",
        "2017",
        "tvN",
        16,
        "휴먼",
        9,
        ["힐링", "밤샘정주행"],
      ],
      [
        "사랑의 불시착",
        "Crash Landing on You",
        "2019",
        "tvN",
        16,
        "로맨스",
        9,
        ["설렘"],
      ],
      [
        "동백꽃 필 무렵",
        "When the Camellia Blooms",
        "2019",
        "KBS2",
        20,
        "휴먼",
        10,
        ["눈물버튼", "힐링"],
      ],
      [
        "슬기로운 의사생활",
        "Hospital Playlist",
        "2020",
        "tvN",
        12,
        "메디컬",
        9,
        ["힐링", "OST맛집"],
      ],
      [
        "그 해 우리는",
        "Our Beloved Summer",
        "2021",
        "SBS",
        16,
        "로맨스",
        8,
        ["설렘", "여운"],
      ],
      [
        "스물다섯 스물하나",
        "Twenty-Five Twenty-One",
        "2022",
        "tvN",
        16,
        "로맨스",
        8,
        ["설렘", "성장", "여운"],
      ],
      [
        "나의 해방일지",
        "My Liberation Notes",
        "2022",
        "JTBC",
        16,
        "휴먼",
        10,
        ["인생작", "여운"],
      ],
    ].map(([title, en, year, network, eps, kind, rating, keys], k) =>
      makeDrama(
        { title, en, year, network, eps, kind },
        {
          liked: true,
          status: "done",
          upTo: eps,
          // 예전에 끝까지 본 예시 = 모든 화에 평이 있음 (그래서 '완주')
          scores: Array.from(
            { length: eps },
            (_, i) =>
              Math.round(
                Math.min(
                  1,
                  Math.max(0, rating / 10 - 0.2 + ((i * 37 + k * 11) % 7) / 20),
                ) * 10,
              ) / 10,
          ),
          rating,
          keys,
          touched: Date.now() - (k + 30) * DAY,
        },
      ),
    ),
  ];
}

// ▶ sampleSets — 처음 열었을 때 보여 줄 '직접 만든 폴더' 예시
function sampleSets() {
  const id = (t) => (data.dramas.find((d) => d.title === t) || {}).id;
  const folder = (name, color, titles) => ({
    id: "s" + name,
    name,
    color,
    ids: titles.map(id).filter(Boolean),
  });
  return [
    folder("엄마랑 같이 본", "#7DBB52", [
      "폭싹 속았수다",
      "응답하라 1988",
      "동백꽃 필 무렵",
    ]),
    folder("주말에 몰아보기", "#F07A2E", [
      "무빙",
      "비밀의 숲",
      "미스터 션샤인",
    ]),
  ];
}

// ▶ selected — 크게 보고 있는 티켓의 드라마
function selected() {
  return data.dramas.find((d) => d.id === selId) || null;
}

// ▶ rackDramas — 왼쪽 꽂이에 보일 드라마: 칸 + 검색어 + 연도로 거름, 최근에 만진 순서
function rackDramas() {
  const q = ui.input
    ? ui.input.value.trim().toLowerCase().replace(/^#/, "")
    : "";
  return data.dramas
    .filter((d) => inShelf(d, filter))
    .filter(
      (d) =>
        !q ||
        [
          d.title,
          d.en,
          d.network,
          d.year,
          kindOf(d),
          ...((d.info && d.info.genres) || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
    )
    .sort(
      (a, b) =>
        ((+b.year || 0) - (+a.year || 0)) * (newestFirst ? 1 : -1) ||
        b.touched - a.touched,
    );
}

// ▶ inShelf — 이 티켓이 그 칸에 들어가는지 (재시청 = 지난 회차 기록이 있는 것 · 예매 = 아직 안 본 '볼 것')
function inShelf(d, key) {
  if (key === "all") return true;
  if (key === "rewatch") return d.history.length > 0;
  if (key === "liked") return d.liked;
  if (key === "want") return d.status === "want";
  return false;
}

// ▶ kindOf — 드라마의 결 (직접 정한 게 없으면 TVmaze 장르로 짐작)
function kindOf(d) {
  if (d.kind) return d.kind;
  const gs = (d.info && d.info.genres) || [];
  const has = (...a) => a.some((x) => gs.includes(x));
  if (has("Romance")) return "로맨스";
  if (has("Thriller", "Crime", "Mystery", "Horror", "Action")) return "스릴러";
  if (has("Fantasy", "Science-Fiction", "Supernatural")) return "판타지";
  if (has("Comedy")) return "코미디";
  if (has("History")) return "사극";
  if (has("Medical")) return "메디컬";
  if (has("Family")) return "가족";
  return "휴먼";
}

// ▶ hashColor — 글자마다 정해지는 색 (드라마 강조색 · 키워드 폴더 색)
function hashColor(str) {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return ACCENTS[h % ACCENTS.length];
}
function accentOf(d) {
  return KIND_COL[kindOf(d)] || hashColor(d.title); // 장르 색 (취향 그래프와 같은 색) — 상자 띠만 봐도 어떤 결인지 보임
}

// ▶ posterColor — 포스터에서 대표색 뽑기: 채도 있는 픽셀을 색상별로 모아 제일 많은 색 → 글자가 잘 읽히는 밝기로 맞춤
//   (포스터 서버가 허락하지 않으면 못 읽으니 그땐 null)
const colorCache = {};
function posterColor(d) {
  const url = d.posterBig || d.poster;
  if (!url) return null;
  let o = colorCache[url];
  if (o) return o.col;
  o = colorCache[url] = { col: null };
  const im = new Image();
  if (!url.startsWith("data:")) im.crossOrigin = "anonymous";
  im.onload = () => {
    try {
      const cv = document.createElement("canvas");
      cv.width = 30;
      cv.height = 45;
      const cx = cv.getContext("2d");
      cx.drawImage(im, 0, 0, 30, 45);
      const px = cx.getImageData(0, 0, 30, 45).data;
      const bins = Array.from({ length: 18 }, () => ({
        w: 0,
        r: 0,
        g: 0,
        b: 0,
      }));
      for (let i = 0; i < px.length; i += 4) {
        const [r, gg, b] = [px[i], px[i + 1], px[i + 2]];
        const mx = Math.max(r, gg, b);
        const mn = Math.min(r, gg, b);
        const sat = mx ? (mx - mn) / mx : 0;
        const bri = mx / 255;
        if (sat < 0.25 || bri < 0.25 || bri > 0.97) continue; // 회색 · 너무 어둡거나 밝은 건 빼고
        let h = 0;
        if (mx === r) h = ((gg - b) / (mx - mn)) % 6;
        else if (mx === gg) h = (b - r) / (mx - mn) + 2;
        else h = (r - gg) / (mx - mn) + 4;
        const bin = bins[Math.floor(((h * 60 + 360) % 360) / 20)];
        const wt = sat * bri;
        bin.w += wt;
        bin.r += r * wt;
        bin.g += gg * wt;
        bin.b += b * wt;
      }
      const best = bins.reduce((a, q) => (q.w > a.w ? q : a));
      if (best.w < 2) return; // 거의 흑백 포스터
      const c = color(best.r / best.w, best.g / best.w, best.b / best.w);
      push();
      colorMode(HSL, 360, 100, 100);
      const out = color(
        hue(c),
        constrain(saturation(c), 45, 80),
        constrain(lightness(c), 50, 62),
      );
      pop();
      o.col = out.toString("#rrggbb");
    } catch (e) {} // 포스터 서버가 색 읽기를 막으면 제목 색 그대로
  };
  im.src = url;
  return null;
}

// ▶ watches — 이 드라마의 모든 감상 (지난 감상들 + 지금 감상), 오래된 순서
function watches(d) {
  return [
    ...d.history,
    {
      label: d.watchLabel,
      start: d.watchStart,
      scores: d.scores,
      review: d.review,
      rating: d.rating,
      upTo: d.upTo,
      now: true,
    },
  ];
}

// ▶ prevWatch — 바로 지난 감상 (없으면 null)
function prevWatch(d) {
  return d.history.length ? d.history[d.history.length - 1] : null;
}

// ▶ pastAvg — 지난 감상들의 회차별 평균 (점선용) · 지난 감상이 없으면 null
function pastAvg(d) {
  if (!d.history.length) return null;
  const scores = [];
  for (let i = 0; i < d.eps; i++) {
    const vs = d.history
      .map((q) => q.scores[i])
      .filter((v) => v !== null && v !== undefined);
    scores.push(vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null);
  }
  const n = d.history.length;
  return { scores, label: n === 1 ? d.history[0].label : `지난 ${n}번 평균` };
}

// ▶ peaks — 지금 감상에서 가장 재밌었던 회차 세 개 (번호는 0부터)
function peaks(d) {
  const list = [];
  for (let i = 0; i < d.upTo; i++)
    if (d.scores[i] !== null && d.scores[i] >= PEAK_MIN) list.push(i);
  return list.sort((a, b) => d.scores[b] - d.scores[a] || a - b).slice(0, 3);
}

// ▶ allKeys — 내가 쓴 키워드들 (많이 쓴 순서) [[키워드, 개수] …]
function allKeys() {
  const n = {};
  data.dramas.forEach((d) => d.keys.forEach((k) => (n[k] = (n[k] || 0) + 1)));
  return Object.entries(n).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
}

// ▶ membersOf — 직접 만든 폴더 안의 드라마들
function membersOf(st) {
  return st.ids
    .map((id) => data.dramas.find((d) => d.id === id))
    .filter(Boolean);
}

// ▶ allFolders — 폴더 전부 (직접 만든 폴더)
function allFolders() {
  const mine = data.sets.map((st) => ({
    type: "set",
    key: st.id,
    name: st.name,
    color: st.color,
    st,
    members: membersOf(st),
  }));
  return mine; // (해시태그 키워드 폴더는 없앰)
}

// ▶ foldersOf — 이 드라마가 들어 있는 직접 만든 폴더들
function foldersOf(d) {
  return data.sets.filter((st) => st.ids.includes(d.id));
}

// ▶ saveData / loadData — 브라우저 저장소에 저장하고 꺼내기
// ▶ 저장 칸 — 맨 위 SLOT (주소의 ?slot= 이 있으면 그걸로)
let slot = SLOT;
function dataKey() {
  return `rewatch-ticket-${slot}`; // v1 = 원래 저장 자리 그대로 (rewatch-ticket-v1)
}
function loadProfiles() {
  const m = location.search.match(/[?&]slot=([\w-]+)/);
  if (m) slot = m[1];
}
// ▶ initData — 지금 저장 칸의 티켓을 불러와 정리 (없으면 예시 티켓)
function initData() {
  let saved = loadData();
  // 새 칸(v2 …): 내 일지(v1)의 절반을 복사해서 시작 (아직 손대지 않은 예시 티켓뿐이어도 다시 채움)
  // 코드 안 STARTER가 바뀌었거나(새로 담은 76장 등) 이 칸이 STARTER로 시작한 게 아니면 → STARTER로 다시 채움
  const sid = typeof STARTER !== "undefined" && STARTER ? STARTER_ID : null;
  if (slot !== "v1" && sid && saved && saved.starter !== sid) saved = null;
  if (slot !== "v1" && (!saved || saved.sample)) {
    // 다른 컴퓨터로 보낸 시연용: 같은 폴더의 seed.js(내 일지 내보내기 파일)가 있으면 그 티켓으로 시작
    // 순서: 보낸 파일의 SEED → 코드 맨 아래 STARTER(76장) → (둘 다 없을 때만) 이 브라우저 내 일지의 절반
    const starter =
      typeof STARTER !== "undefined" && STARTER && STARTER.dramas
        ? STARTER
        : null;
    const pre =
      typeof window !== "undefined" && window.SEED && window.SEED.dramas
        ? window.SEED
        : starter;
    const half = pre ? JSON.parse(JSON.stringify(pre)) : halfOfMine();
    if (half && pre && sid) half.starter = sid; // 이 칸은 이 STARTER(또는 공유받은 SEED)로 시작했다는 표시 → 새로고침해도 다시 안 채움
    if (half) {
      saved = half;
      data = half;
      saveData();
    }
  }
  // 저장된 게 없으면(처음 여는 컴퓨터) 맨 아래 STARTER(미리 담아 둔 내 티켓)로 시작 · 그것도 없으면 예시 티켓
  if (!saved && typeof STARTER !== "undefined" && STARTER && STARTER.dramas) {
    saved = JSON.parse(JSON.stringify(STARTER));
    data = saved;
    saveData();
  }
  data = saved || { dramas: sampleDramas(), sets: [], sample: true };
  data.dramas.forEach(upgrade);
  const mergedN = mergeDups(); // 같은 드라마 티켓이 여러 장이면 한 장으로
  data.dramas.forEach(syncStatus); // 상태는 회차 평으로 정해짐 (예매 · 보는 중 · 완주)
  if (!data.sets) data.sets = [];
  if (!saved) data.sets = sampleSets();
  if (mergedN) toast(`같은 드라마 티켓 ${mergedN}장을 하나로 합쳤어요`);
}

// ▶ halfOfMine — 내 일지(v1) 티켓의 절반 복사본: 관람평 · 평점 · 메모가 많이 남은 것부터 고르고, 순서는 원래대로
//   폴더도 고른 티켓만 남겨서 같이 (비는 폴더는 뺌) · v1이 비어 있으면 null (→ 예시 티켓)
function halfOfMine() {
  let mine = null;
  try {
    mine = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {}
  const all = (mine && mine.dramas) || [];
  if (all.length < 2) return null;
  const rich = (d) =>
    (d.review ? 3 : 0) +
    (d.rating ? 2 : 0) +
    Object.keys(d.notes || {}).length +
    (d.scores || []).filter((v) => v !== null && v !== undefined).length / 8 +
    (d.history || []).length * 2 +
    (d.poster ? 1 : 0);
  const pick = new Set(
    all
      .map((d, k) => ({ d, k, r: rich(d) }))
      .sort((a, b) => b.r - a.r || a.k - b.k)
      .slice(0, Math.ceil(all.length / 2))
      .map((q) => q.d.id),
  );
  const copy = JSON.parse(JSON.stringify(mine)); // v1은 그대로 두고 복사본만
  copy.dramas = copy.dramas.filter((d) => pick.has(d.id));
  copy.sets = (copy.sets || [])
    .map((st) => ({ ...st, ids: (st.ids || []).filter((id) => pick.has(id)) }))
    .filter((st) => st.ids.length);
  copy.sample = false;
  return copy;
}
function saveData() {
  try {
    localStorage.setItem(dataKey(), JSON.stringify(data));
  } catch (e) {
    toast("저장 공간이 부족해요");
  }
}
function loadData() {
  try {
    return JSON.parse(localStorage.getItem(dataKey()));
  } catch (e) {
    return null;
  }
}

// ▶ saveCat / loadCat — 연도별 목록의 포스터 정보 기억
function saveCat() {
  try {
    localStorage.setItem(CAT_KEY, JSON.stringify(catInfo));
  } catch (e) {}
}
function loadCat() {
  try {
    return JSON.parse(localStorage.getItem(CAT_KEY)) || {};
  } catch (e) {
    return {};
  }
}

// ▶ fmtMonth — 날짜 숫자 → "2026년 10월" / fmtDot → "2026.10"
function fmtMonth(t) {
  const d = new Date(t);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}
function fmtDot(t) {
  const d = new Date(t);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* =========================================================
   5. 드라마 정보 — TVmaze 공개 검색 (키 필요 없음, 한국 드라마는 영어 제목이 잘 찾아짐)
========================================================= */
// ▶ tvSearch — 제목으로 찾기 → [{ tvId, title, year, network, poster, posterBig, lang, info }]
function tvSearch(q) {
  return fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`)
    .then((r) => r.json())
    .then(
      (list) =>
        list
          .map(({ show }) => ({
            tvId: show.id,
            title: show.name,
            year: (show.premiered || "").slice(0, 4),
            network:
              (show.network && show.network.name) ||
              (show.webChannel && show.webChannel.name) ||
              "",
            poster: (show.image && show.image.medium) || "",
            posterBig: (show.image && show.image.original) || "",
            lang: show.language || "",
            info: {
              genres: show.genres || [],
              summary: (show.summary || "").replace(/<[^>]+>/g, "").trim(), // HTML 태그 빼기
              premiered: show.premiered || "",
              ended: show.ended || "",
            },
          }))
          .sort((a, b) => (b.lang === "Korean") - (a.lang === "Korean")), // 한국 드라마를 위로
    );
}

// ▶ tvEpisodes — 회차 수 (시즌 1 기준)
function tvEpisodes(tvId, season = 1) {
  return fetch(`https://api.tvmaze.com/shows/${tvId}/episodes`)
    .then((r) => r.json())
    .then((eps) => eps.filter((e) => e.season === season).length || eps.length);
}

// ▶ tvSeasons — 시즌 목록 [{ n, eps, year }] (시즌이 하나면 길이 1)
//   시즌 정보에 첫 방송일이 비어 있는 드라마가 많아서, 회차 목록에서 그 시즌 1화가 나온 날로 연도 · 회차 수를 채움
function tvSeasons(tvId) {
  return Promise.all([
    fetch(`https://api.tvmaze.com/shows/${tvId}/seasons`).then((r) => r.json()),
    fetch(`https://api.tvmaze.com/shows/${tvId}/episodes`)
      .then((r) => r.json())
      .catch(() => []),
  ])
    .then(([list, eps]) =>
      list
        .filter((q) => q.number > 0)
        .map((q) => {
          const mine = eps.filter((e) => e.season === q.number);
          const first = mine
            .map((e) => e.airdate || "")
            .filter(Boolean)
            .sort()[0];
          return {
            n: q.number,
            eps: mine.length || q.episodeOrder || 0,
            year: (first || q.premiereDate || "").slice(0, 4),
          };
        }),
    )
    .catch(() => []);
}

// ▶ parseSeason — 검색어 끝의 시즌 번호 떼기: "슬기로운 의사생활 2" · "시즌2" · "season 3" · "2기" · "파트2"
//   → { base: "슬기로운 의사생활", season: 2 }  (연도 같은 큰 숫자 "응답하라 1988"은 시즌으로 안 봄)
function parseSeason(q) {
  const t = String(q || "").trim();
  const m =
    t.match(/^(.*?)[\s:]*(?:시즌|season|s|파트|part)\s*(\d{1,2})$/i) ||
    t.match(/^(.*?)\s*(\d{1,2})\s*기$/) ||
    t.match(/^(.*\D)\s+(\d)$/) ||
    t.match(/^(.*[가-힣])(\d)$/); // "비밀의 숲2"
  if (m && m[1].trim().length >= 1 && +m[2] >= 1 && +m[2] <= 20)
    return { base: m[1].trim(), season: +m[2] };
  return { base: t, season: 0 };
}

// ▶ seasonTitle — 시즌 2부터는 제목 뒤에 '시즌N'
function seasonTitle(title, n) {
  const base = parseSeason(title).base;
  return n > 1 ? `${base} 시즌${n}` : base;
}

// ▶ tvKoreanName — TVmaze에 등록된 한국어 제목 (다른 이름 목록에서 나라가 KR인 것 · 없으면 null)
function tvKoreanName(tvId) {
  return fetch(`https://api.tvmaze.com/shows/${tvId}/akas`)
    .then((r) => r.json())
    .then((list) => {
      const kr = list.find(
        (a) => a.country && a.country.code === "KR" && /[가-힣]/.test(a.name),
      );
      return kr ? kr.name : null;
    })
    .catch(() => null);
}

// ▶ fullTitle — 덜 쓴 제목을 진짜 제목으로: '악의 마음을' → '악의 마음을 읽는 자들' (쓴 글자가 들어 있을 때만 바꿈)
function fullTitle(typed, found) {
  if (!found) return typed;
  const n = (t) => t.replace(/\s+/g, "").toLowerCase();
  if (n(found).includes(n(typed)) || !/[가-힣]/.test(typed)) return found; // 영어로 쳤으면 한국어 제목으로
  return typed;
}

// ▶ fetchMissingInfo — 포스터·정보가 없는 드라마를 하나씩 찾아서 채움
function fetchMissingInfo() {
  const d = data.dramas.find((q) => !q.poster && !q.infoTried);
  if (!d) return;
  d.infoTried = true;
  tvSearch(d.en || d.title)
    .then((res) => {
      const hit = res.find((r) => r.lang === "Korean"); // 한국 드라마만 (엉뚱한 외국 드라마 포스터가 붙지 않게)
      if (hit) linkInfo(d, hit);
      saveData();
      setTimeout(fetchMissingInfo, 300);
    })
    .catch(() => (d.infoTried = false)); // 인터넷이 안 되면 다음에 다시
}

// ▶ linkInfo — 찾은 정보(포스터 · 연도 · 방송사 · 장르)를 드라마에 붙임
function linkInfo(d, r) {
  d.tvId = r.tvId;
  d.poster = r.poster || d.poster;
  d.posterBig = r.posterBig || d.posterBig;
  d.year = d.year || r.year;
  d.network = d.network || r.network;
  d.info = r.info;
  if (!d.en) d.en = r.title;
}

const imgCache = {};
// ▶ posterImg — 포스터 그림 (다 불러왔으면 그림, 아직이면 null)
function posterImg(url) {
  if (!url) return null;
  let o = imgCache[url];
  if (!o) {
    o = { im: new Image(), ok: false };
    o.im.onload = () => (o.ok = true);
    o.im.src = url;
    imgCache[url] = o;
  }
  return o.ok ? o.im : null;
}

// ▶ drawPoster — 포스터를 둥근 모서리로 잘라서 (그림이 없으면 강조색 바탕에 제목을 쓴 포스터)
function drawPoster(d, x, y, w, h, r = 4) {
  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.clip();
  const im = posterImg(d.posterBig) || posterImg(d.poster);
  noStroke();
  if (im) {
    let sw = im.width;
    let sh = im.height;
    if (sw / sh > w / h) sw = sh * (w / h);
    else sh = sw / (w / h);
    ctx.drawImage(
      im,
      (im.width - sw) / 2,
      (im.height - sh) / 2,
      sw,
      sh,
      x,
      y,
      w,
      h,
    );
  } else {
    fill(accentOf(d));
    rect(x, y, w, h);
    fill(0, 0, 0, 60);
    rect(x, y + h * 0.6, w, h * 0.4);
    const fs = Math.max(11, w * 0.14);
    wrapStr(d.title, w - 16, fs, DISP)
      .slice(0, 3)
      .forEach((ln, i) =>
        say(
          ln,
          x + 9,
          y + h * 0.6 + fs * 1.18 * (i + 1),
          fs,
          C.paper,
          LEFT,
          BASELINE,
          DISP,
        ),
      );
    if (w < 200)
      say(
        // 큰 티켓에선 왼쪽 위에 회차 뱃지가 있어서 연도는 생략 (아래 정보줄에 있음)
        d.year || "",
        x + 9,
        y + 8 + Math.max(11, w * 0.1),
        Math.max(11, w * 0.1),
        C.paper,
        LEFT,
        BASELINE,
        LAB,
      );
  }
  ctx.restore();
}

/* =========================================================
   6. 화면 배치 · 위쪽 — 1280×800 기준으로 그리고 창에 맞춰 통째로 늘리고 줄임
========================================================= */
const WALL = { x: 40, y: 88, w: 1200, h: 712 }; // 티켓 벽 (맨 위 칸 고르기 줄 포함)
const AREA = { x: 48, y: 96, w: 1184, h: 680 }; // 연도별 · 취향 · 폴더 화면
const TK = { x: 928, y: 120, w: 312, h: 668, ph: 474 }; // 오른쪽에 크게 뜬 티켓 (상자 · 폴더 옆) (ph = 절취선 높이)
const MW = 150; // 벽에 걸린 작은 티켓
const MH = 232;
const COLS = 7;

// ▶ layout — 배율을 정하고, 검색창(HTML)을 그 배율에 맞는 자리로 옮김
function layout() {
  K = Math.min(width / W0, height / H0);
  OX = (width - W0 * K) / 2;
  OY = (height - H0 * K) / 2;
  if (ui.wrap) {
    const sc = Math.max(0.7, Math.min(1.3, K));
    const s = ui.wrap.style;
    s.left = `${OX + 260 * K}px`;
    s.top = `${OY + 20 * K}px`;
    s.transform = `scale(${sc})`;
    s.transformOrigin = "top left";
    s.width = `${(440 * K) / sc}px`;
  }
}

// ▶ drawLogo — 로고 '정주행 | 일지': 선으로 그린 티켓 한 장, 가운데 절취선 (양옆 반달 홈)
function drawLogo(x, y, w, h) {
  const ctx = drawingContext;
  const r = 5; // 모서리
  const n = 7; // 홈 반지름
  const my = y + h / 2;
  ctx.save();
  ctx.strokeStyle = C.paper;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, my - n);
  ctx.arc(x + w, my, n, -Math.PI / 2, Math.PI / 2, true);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, my + n);
  ctx.arc(x, my, n, Math.PI / 2, -Math.PI / 2, true);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([2, 3]);
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 6);
  ctx.lineTo(x + w / 2, y + h - 6);
  ctx.stroke();
  ctx.restore();
  say("정주행", x + w / 4, my + 1, 24, C.paper, CENTER, CENTER, DISP);
  say("일지", x + (w * 3) / 4, my + 1, 24, C.paper, CENTER, CENTER, DISP);
}

// ▶ drawTabTip — 탭을 누를 때마다 '눈으로' 쓰는 법: 화면을 어둡게 하고 진짜 버튼 자리에 불을 켠 뒤
//   손가락이 직접 가서 톡 / 쓸어 올리기를 해 보임 (단계마다 짧은 이름표만) · 아무 데나 톡 = 닫기
// 검색창 자리: 실제 화면에 그려진 검색 칸(.search)의 위치를 그대로 읽어서 (어긋나지 않게)
const searchRect = () => {
  if (!ui.wrap) return null;
  const el =
    (ui.input && ui.input.closest && ui.input.closest(".search")) || ui.wrap;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return { x: 260, y: 22, w: 440, h: 44 };
  return {
    x: (r.left - OX) / K + 4,
    y: (r.top - OY) / K + 4,
    w: r.width / K - 8,
    h: r.height / K - 8,
  }; // (불빛 테두리가 칸에 딱 맞게 살짝 안쪽으로)
};
const TAB_DEMO = {
  ticket: [
    () => L.newBtn && { r: L.newBtn, g: "tap", t: "새 티켓 발권" },
    () =>
      L.boxes &&
      L.boxes[0] && { r: L.boxes[0], g: "tap", t: "그 해 티켓 펼치기" },
    () =>
      (L.peek || L.ticket) && {
        r: L.peek || L.ticket,
        g: "tap",
        t: "톡 = 뒤집어서 관람평",
      },
  ],
  reviews: [
    () =>
      searchRect() && {
        r: searchRect(),
        g: "tap",
        t: "제목으로 찾기",
        search: true,
      },
    () =>
      L.sortChips &&
      L.sortChips[0] && { r: L.sortChips[0], g: "tap", t: "정렬 바꾸기" },
    () =>
      L.reviewRows &&
      L.reviewRows[0] && {
        r: L.reviewRows[0],
        g: "tap",
        t: "크게 보기",
        open: L.reviewRows[0].d,
      }, // 톡 하면 진짜 크게 보기 창까지
  ],
  taste: [
    () => ({
      r: { x: AREA.x, y: AREA.y + 44, w: AREA.w, h: 250 },
      g: "none",
      t: "♥한 드라마 = 내 취향",
    }), // 위: 나의 취향 · 장르 막대
    () => ({
      r: {
        x: AREA.x,
        y: AREA.y + 262 + 60,
        w: AREA.w,
        h: AREA.h - 34 - TASTE_UP + 40 - 262 - 60,
      },
      g: "none",
      t: "연도별로 쌓인 내 티켓",
    }), // 가운데: 연도 그래프
    () => ({
      r: { x: AREA.x, y: AREA.y + 44, w: AREA.w, h: AREA.h - 60 },
      g: "swipe",
      t: "쓸어 올리면 추천",
    }),
  ],
  folders: [
    () => {
      const t = (L.tiles || []).find((q) => q.f.type === "new");
      return t && { r: t, g: "tap", t: "새 폴더" };
    },
    () =>
      L.tileDels &&
      L.tileDels[0] && { r: L.tileDels[0], g: "tap", t: "폴더 지우기" },
    () => {
      const t = (L.tiles || []).find((q) => q.f.type !== "new");
      return t && { r: t, g: "tap", t: "폴더 열기" }; // 톡 하는 모습만 (진짜로 들어가진 않음)
    },
  ],
};
const TASTE_UP = 0; // 취향 그래프를 위로 올릴 만큼 (0 = 원래 자리 · 아래 추천이 첫 화면에 안 보이게)
const DEMO_STEP = 2300; // 한 단계 길이(ms)
let tabTip = null;
// ▶ seenOnce — 이 안내를 본 적 있는지 (처음이면 false를 돌려주고 '봤음'으로 기록)
const seenNow = new Set(); // INTRO_EVERY일 때: 이번에 연 동안만 기억 (새로고침하면 다시 처음부터)
function seenOnce(name) {
  if (INTRO_EVERY) {
    if (seenNow.has(name)) return true;
    seenNow.add(name);
    return false;
  }
  const k = STORAGE_KEY + "-seen-" + (slot === "v1" ? "" : slot + "-") + name; // 칸마다 따로
  try {
    if (localStorage.getItem(k)) return true;
    localStorage.setItem(k, "1");
  } catch (e) {}
  return false;
}
let demoSearch = true; // 시연 중 검색창(HTML)을 보일지
function drawTabTip() {
  L.tabTip = null;
  demoSearch = true;
  if (!tabTip || helpOpen) return;
  const steps = (TAB_DEMO[tabTip.key] || []).map((f) => f()).filter(Boolean);
  if (!steps.length) return (tabTip = null);
  // 단계마다 움직임을 한 번 보여 주고 멈춰 기다림 (톡 = 다음 단계 · 처음 티켓 시연과 같은 방식)
  const e = millis() - tabTip.t0;
  if (tabTip.step === undefined) tabTip.step = 0;
  if (tabTip.st0 === undefined) tabTip.st0 = tabTip.t0;
  tabTip.n = steps.length;
  const si = Math.min(tabTip.step, steps.length - 1);
  const st = steps[si];
  const prev = steps[Math.max(0, si - 1)];
  const HOLD = 1600; // 손가락 움직임이 끝나는 시각 → 여기서 멈춤
  const local = millis() - tabTip.st0;
  const waiting = local >= HOLD && !(st.open || st.openFolder);
  const lt = Math.min(local, st.open || st.openFolder ? local : HOLD); // 이 단계 안에서 지난 시간
  const acc =
    ACCENTS[VIEWS.findIndex(([k]) => k === tabTip.key) % ACCENTS.length];
  const ctx = drawingContext;
  const pad = 8;
  const R = {
    x: st.r.x - pad,
    y: st.r.y - pad,
    w: st.r.w + pad * 2,
    h: st.r.h + pad * 2,
  };
  demoSearch = !!st.search;

  // 1) 어둡게 + 그 자리만 구멍 (불 켜진 것처럼)
  const fadeIn = span(e, 0, 300);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W0, H0);
  ctx.roundRect(R.x, R.y, R.w, R.h, 14);
  ctx.fillStyle = `rgba(10,10,12,${0.72 * fadeIn})`;
  ctx.fill("evenodd");
  // 불 켜진 테두리 (살짝 숨 쉬듯)
  const pulse = 0.5 + 0.5 * Math.sin(lt * 0.006);
  ctx.strokeStyle = acc;
  ctx.globalAlpha = fadeIn * (0.6 + 0.4 * pulse);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(R.x, R.y, R.w, R.h, 14);
  ctx.stroke();
  ctx.restore();

  // 2) 손가락: 지난 자리 → 이번 자리로 이동 → 톡 (또는 쓸어 올리기)
  const tc = { x: st.r.x + st.r.w / 2, y: st.r.y + st.r.h / 2 };
  const pc = { x: prev.r.x + prev.r.w / 2, y: prev.r.y + prev.r.h / 2 };
  let fx;
  let fy;
  let press = 0;
  if (st.g === "swipe") {
    const m = span(lt, 0, 400);
    const sw = span(lt, 600, 1500); // 아래 → 위로 쓸기
    fx = lerp(pc.x, tc.x, m);
    fy = lerp(pc.y, tc.y + 150, m) - 300 * sw;
    press = lt > 550 && lt < 1550 ? 1 : 0;
    if (press) {
      // 지나간 자국
      for (let k = 1; k <= 6; k++) {
        fill(255, 255, 255, 40 - k * 6);
        circle(fx, fy + k * 18, 30 - k * 3);
      }
    }
  } else {
    const m = span(lt, 0, 600);
    fx = lerp(pc.x, tc.x, m);
    fy = lerp(pc.y, tc.y, m);
    if (si === 0) {
      // 첫 단계는 아래쪽에서 손가락이 들어옴
      fx = lerp(tc.x + 60, tc.x, m);
      fy = lerp(tc.y + 140, tc.y, m);
    }
    if (st.g === "tap") {
      press = lt > 750 && lt < 950 ? 1 : 0;
      const rp = span(lt, 800, 1400); // 톡 물결
      if (lt > 800) {
        noFill();
        stroke(255, 255, 255, 200 * (1 - rp));
        strokeWeight(2);
        circle(fx, fy, 20 + 50 * rp);
        circle(fx, fy, 10 + 30 * rp);
        noStroke();
      }
    }
  }
  if (st.g !== "none") {
    const fs = press ? 0.82 : 1;
    fill(0, 0, 0, 70);
    circle(fx + 3, fy + 5, 34 * fs);
    fill(255, 255, 255, 235);
    circle(fx, fy, 34 * fs);
    fill(acc);
    circle(fx, fy, 12 * fs);
  }

  // 마지막 '크게 보기'는 톡 한 뒤 진짜 창을 띄워 어떻게 보이는지까지 보여 주고 시연 끝 (창은 ✕로 닫기)
  if (st.open && lt > 1250) {
    tabTip = null;
    openReviewCard(st.open);
    // 크게 보기 창을 잠깐 보여 준 뒤 저절로 닫음 (그새 직접 닫았거나 다른 창이면 그대로)
    const shown = panel;
    setTimeout(() => {
      if (panel && panel === shown) {
        panel.elt.style.transition = "opacity .35s";
        panel.elt.style.opacity = "0";
        setTimeout(() => panel === shown && closePanel(), 350);
      }
    }, 3200);
    return;
  }
  if (st.openFolder && lt > 1250) {
    tabTip = null;
    folderSel = st.openFolder; // 폴더 안 화면까지 열어 보여 주고 → 잠깐 뒤 모든 폴더로 돌아옴
    const key = st.openFolder;
    setTimeout(() => {
      if (view === "folders" && folderSel === key && !panel && !g)
        folderSel = null;
    }, 3500);
    return;
  }
  // 3) 짧은 이름표: 불 켜진 칸 아래(자리 없으면 위)에 · 단계 점
  const lab = st.t;
  const lw = textWidthOf(lab, 16, BODY, true) + 34;
  const below = R.y + R.h + 60 < H0;
  const ly = below ? R.y + R.h + 14 : R.y - 14 - 40;
  const lx = constrain(tc.x - lw / 2, 20, W0 - 20 - lw);
  const la = span(lt, 150, 450);
  ctx.save();
  ctx.globalAlpha = la;
  fill(acc);
  rect(lx, ly + 4 * (1 - la), lw, 40, 20);
  say(
    lab,
    lx + lw / 2,
    ly + 26 + 4 * (1 - la),
    16,
    C.ink,
    CENTER,
    BASELINE,
    BODY,
    255,
    true,
  );
  ctx.restore();
  // 이름표 옆: 몇 번째인지 + '톡 하면 다음' (화면 아래 그래프 · 축 글자를 안 가리게 이름표 바로 옆에)
  const hint =
    `${si + 1}/${steps.length}` +
    (waiting
      ? si < steps.length - 1
        ? "   톡 하면 다음 ›"
        : "   톡 하면 끝"
      : "");
  const hw = textWidthOf(hint, 13, BODY, true);
  const right = lx + lw + 12 + hw < W0 - 20;
  const blink = waiting
    ? 150 + 105 * Math.sin(millis() * HINT_SPEED * 1.5)
    : 160;
  ctx.save();
  ctx.globalAlpha = la;
  say(
    hint,
    right ? lx + lw + 12 : lx - 12,
    ly + 25,
    13,
    C.paper,
    right ? LEFT : RIGHT,
    BASELINE,
    BODY,
    blink,
    true,
  );
  ctx.restore();
  // 건너뛰기 (오른쪽 위 · ? 아래)
  const sk = "건너뛰기  ›";
  const skw = textWidthOf(sk, 13, BODY, true) + 28;
  fill(255, 255, 255, 22);
  rect(W0 - 40 - skw, 72, skw, 32, 16);
  say(sk, W0 - 40 - skw / 2, 93, 13, C.dim, CENTER, BASELINE, BODY, 255, true);
  L.tabSkip = { x: W0 - 40 - skw, y: 66, w: skw, h: 44 };
  L.tabTip = { x: 0, y: 0, w: W0, h: H0 }; // 시연 중엔 화면 어디를 눌러도 닫기만
}

// ▶ drawTop — 로고 · 탭(티켓 / 연도별 / 취향 / 폴더, 글자만) · ? 버튼 (검색창은 HTML이 그 위에 떠 있음)
function drawTop() {
  drawLogo(40, 22, 196, 46);
  L.tabs = [];
  let x = 830;
  VIEWS.forEach(([key, label]) => {
    const on = view === key;
    const tw = textWidthOf(label, 15, BODY, true);
    say(label, x, 48, 15, on ? C.paper : C.dim, LEFT, BASELINE, BODY, 255, on);
    if (on) {
      fill(C.paper);
      rect(x, 58, tw, 2);
    }
    L.tabs.push({ key, x: x - 10, y: 22, w: tw + 20, h: 44 });
    x += tw + 34;
  });
  const h = { x: 1206, y: 24, w: 36, h: 36 };
  noFill();
  stroke(C.faint);
  strokeWeight(1.5);
  circle(h.x + 18, h.y + 18, 30);
  noStroke();
  say("?", h.x + 18, h.y + 20, 16, C.dim, CENTER, CENTER, LAB);
  L.help = h;
}

/* =========================================================
   7. 티켓 벽
========================================================= */
// ▶ drawWall — 칸 고르기(글자만: 전체 / 재시청 / 예매 / ♥) + 벽에 걸린 티켓들 (스크롤)
function drawWall() {
  const S = WALL;
  if (!opened && !inline && data.dramas.some((d) => d.draft && !d.title))
    data.dramas = data.dramas.filter((d) => !(d.draft && !d.title)); // 제목 없이 닫은 새 티켓은 버림
  L.chips = [];
  let x = S.x;
  for (const [key, label] of SHELVES) {
    const t = `${label} ${data.dramas.filter((d) => inShelf(d, key)).length}`;
    const on = filter === key;
    const tw = textWidthOf(t, 14, BODY, on);
    say(t, x, 114, 14, on ? C.paper : C.dim, LEFT, BASELINE, BODY, 255, on);
    if (on) {
      fill(C.paper);
      rect(x, 122, tw, 2);
    }
    L.chips.push({ key, x: x - 8, y: 94, w: tw + 16, h: 34 });
    x += tw + 26;
  }
  const nb = { x: S.x + 820 - 112, y: 94, w: 112, h: 36 }; // 상자 줄 오른쪽 끝 (그 오른쪽은 큰 티켓 자리)
  fill(C.paper);
  rect(nb.x, nb.y, nb.w, nb.h, 18);
  say(
    "+ 새 티켓",
    nb.x + nb.w / 2,
    nb.y + 19,
    14,
    C.ink,
    CENTER,
    CENTER,
    BODY,
    255,
    true,
  );
  L.newBtn = nb;
  if (data.sample && slot === "v1") {
    // (시연용 칸에선 숨김 — '+ 새 티켓' 바로 옆이라 잘못 누르면 예시가 다 사라짐)
    const t = "예시 티켓 비우기";
    const tw = textWidthOf(t, 12, BODY);
    say(t, nb.x - 20, 114, 12, C.dim, RIGHT, BASELINE, BODY);
    stroke(C.faint);
    line(nb.x - 20 - tw, 118, nb.x - 20, 118);
    noStroke();
    L.clearBtn = { x: nb.x - 28 - tw, y: 96, w: tw + 16, h: 30 };
  } else L.clearBtn = null;

  // 카드 상자: 연도 하나 = 회색 상자 하나 · 티켓이 상자에 꽂혀 윗부분만 보임 · 손이 지나가면 그 티켓이 쏙 올라옴
  const list = rackDramas();
  const top = 150;
  const BW = 250; // 상자 폭
  const BGAP = 30;
  const FACE = 118; // 상자 앞판 높이
  const TOPA = 112; // 상자 위로 티켓이 보이는 높이
  const ROWH = TOPA + FACE + 70; // 한 선반
  const groups = [];
  for (const d of list) {
    const yr = d.year ? String(d.year) : "—";
    let gp = groups.find((q) => q.yr === yr);
    if (!gp) groups.push((gp = { yr, ds: [] }));
    gp.ds.push(d);
  }
  // 전체 티켓 = 연도별 상자 · 재시청 / 예매 / ♥ = 몇 장 안 되니 티켓을 바로 펼쳐 보여줌 (한 줄에 5장)
  const flat = filter !== "all";
  const GW = 150; // 펼친 티켓 크기 (감상 · 취향 화면과 같은 작은 티켓)
  const GH = 232;
  const GCOL = 5;
  const GGX = (820 - GCOL * GW) / (GCOL - 1);
  const GGY = 24;
  const rowsN = flat
    ? Math.ceil(list.length / GCOL)
    : Math.ceil(groups.length / 3);
  const maxS = Math.max(
    0,
    rowsN * (flat ? GH + GGY : ROWH) + 44 - (H0 - top) + 10,
  );
  if (!(g && g.mode === "scroll"))
    rackScroll += (constrain(rackScroll, 0, maxS) - rackScroll) * 0.3;
  L.minis = [];
  L.boxes = [];
  if (!list.find((d) => d.id === peekId))
    peekId = list.length ? list[0].id : null;
  const peek = list.find((d) => d.id === peekId);
  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top - 16, W0, H0 - top + 16);
  ctx.clip();
  if (!list.length) {
    say(
      data.dramas.length ? "찾는 티켓이 없어요" : "아직 티켓이 없어요",
      S.x,
      top + 40,
      26,
      C.paper,
      LEFT,
      BASELINE,
      DISP,
    );
    say(
      "오른쪽 위 '+ 새 티켓'으로 직접 쓰거나, 위 검색창에서 찾아 발권해요",
      S.x,
      top + 68,
      13,
      C.dim,
      LEFT,
      BASELINE,
      BODY,
    );
  }
  // 왼쪽 위 작은 정렬 기준 (톡 = 바꾸기)
  if (list.length) {
    const st = newestFirst ? "최신순 ↓" : "오래된순 ↑";
    say(st, S.x, top + 14, 12, C.dim, LEFT, BASELINE, BODY);
    L.sortBtn = {
      x: S.x - 6,
      y: top - 4,
      w: textWidthOf(st, 12, BODY) + 12,
      h: 26,
    };
  } else L.sortBtn = null;
  const carrying = g && g.mode === "carry";
  const sp = Math.min(1, (deltaTime / 1000) * 12);
  drawerBox = null;
  if (flat)
    list.forEach((d, i) => {
      const cx = S.x + (i % GCOL) * (GW + GGX);
      const cy = top + 44 + Math.floor(i / GCOL) * (GH + GGY) - rackScroll;
      if (cy > H0 || cy + GH < top - 16) return;
      const hb = drawMini(d, cx, cy, GW, GH, {
        line2: [d.year, d.network].filter(Boolean).join(" · "),
        heartToggle: true,
        sel: d === peek,
        dim: carrying && g.d === d,
        hot: carrying && g.target && g.target.d === d,
      });
      // 누르기는 상자 속 티켓과 똑같이 동작
      L.minis.push({ d, x: cx, y: cy, w: GW, h: GH, heart: hb });
    });
  else
    groups.forEach((gp, bi) => {
      const row = Math.floor(bi / 3);
      const bx = S.x + (bi % 3) * (BW + BGAP);
      const by = top + 44 + row * ROWH - rackScroll; // 상자 맨 위 (티켓 보이는 곳 시작)
      const faceY = by + TOPA;
      // 선반 (줄의 첫 상자에서 한 번)
      if (bi % 3 === 0) {
        fill(40, 40, 44);
        rect(S.x - 6, faceY + FACE, 3 * BW + 2 * BGAP + 12, 12);
        fill(0, 0, 0, 90);
        rect(S.x - 6, faceY + FACE + 12, 3 * BW + 2 * BGAP + 12, 6);
      }
      if (faceY + FACE < top - 16 || by > H0) return;
      drawBox(gp, bx, by, {
        peek,
        carrying,
        sp,
        step: Math.min(8, 90 / Math.max(1, gp.ds.length)),
        lift: 56,
      });
      L.boxes.push({ x: bx, y: faceY, w: BW, h: FACE, gp });
      if (gp.yr === drawerYr) drawerBox = { gp, bx, by };
    });
  ctx.restore();
  // 오른쪽: 올라온 티켓의 앞면 (크게 연 티켓과 같은 자리 · 같은 모양) · 톡 = 그 자리에서 바로 뒷면
  L.peek = null;
  if (peek && !opened) {
    push();
    translate(TK.x, TK.y);
    noStroke();
    fill(0, 0, 0, 140);
    rect(8, 14, TK.w, TK.h, 14);
    ticketPath(0, 0, TK.w, TK.h, TK.ph, 14, 13);
    drawingContext.fillStyle = C.paper;
    drawingContext.fill();
    drawTicketFront(peek, accentOf(peek), false);
    pop();
    const hb = { x: TK.x + TK.w - 70, y: TK.y + TK.ph + 18, w: 52, h: 52 };
    L.peek = {
      d: peek,
      x: TK.x,
      y: TK.y - 30,
      w: TK.w,
      h: TK.h + 30,
      heart: hb,
    };
    // 뒤집기 안내 (크게 연 티켓과 같은 글자 · 처음 보이는 티켓에도 바로)
    const a = 140 + 110 * Math.sin(millis() * HINT_SPEED);
    say(
      peek.review
        ? "↻  눌러서 뒤집으면 관람평"
        : "↻  눌러서 뒤집으면 관람평 쓰기",
      TK.x + TK.w / 2,
      TK.y - 14 + 3 * Math.sin(millis() * HINT_SPEED),
      13,
      C.paper,
      CENTER,
      BASELINE,
      BODY,
      a,
    );
  }
  drawDrawer(); // 열린 서랍 + 떠오른 티켓들 (맨 위에)
}

// ▶ drawDrawer — 열린 서랍: 뒤를 살짝 어둡게 → 그 상자만 다시 그림 → 안의 티켓들이 하나씩 펼쳐지며 위로 뜸
function drawDrawer() {
  L.drawerCards = [];
  if (!drawerYr) return;
  const CLOSE_MS = 260;
  let fade = constrain((millis() - drawerAt) / 200, 0, 1);
  let closeK = 1;
  if (drawerClosing) {
    closeK = 1 - constrain((millis() - drawerClosing) / CLOSE_MS, 0, 1);
    if (closeK <= 0) {
      drawerYr = null;
      drawerClosing = 0;
      return;
    }
    fade = Math.min(fade, closeK);
  }
  const B = drawerBox;
  if (!B) {
    // 상자가 화면 밖으로 나갔거나 목록이 바뀜
    drawerYr = null;
    drawerClosing = 0;
    return;
  }
  // 뒤를 살짝 어둡게
  noStroke();
  fill(22, 22, 24, 150 * fade);
  rect(0, 0, W0, H0);
  // 열린 상자만 어둠 위로 다시 (디자인 그대로)
  drawBox(B.gp, B.bx, B.by, {
    peek: null,
    carrying: false,
    sp: 0,
    step: Math.min(8, 90 / Math.max(1, B.gp.ds.length)),
    lift: 56,
    redraw: true,
  });

  // 티켓들 — 연도별 화면과 같은 작은 티켓(drawMini)
  const ds = B.gp.ds;
  const n = ds.length;
  const tw = 150;
  const th = 232;
  const gap = 18;
  const cols = Math.min(n, 7);
  const rows = Math.ceil(n / 7);
  const rowW = cols * tw + (cols - 1) * gap;
  const faceY = B.by + 112;
  const left = constrain(B.bx + 125 - rowW / 2, 40, W0 - 40 - rowW);
  const top = Math.max(96, faceY - 10 - rows * (th + gap) + gap);
  const sx = B.bx + 125; // 서랍 안 (출발점)
  const sy = faceY - 20;
  ds.forEach((d, i) => {
    const ex = left + (i % cols) * (tw + gap);
    const ey = top + Math.floor(i / cols) * (th + gap);
    let t = constrain((millis() - drawerAt - 140 - i * 60) / 480, 0, 1);
    if (drawerClosing) t = Math.min(t, closeK);
    if (t <= 0) return;
    const e = easeBack(t); // 살짝 튀어 오름
    const e2 = 1 - Math.pow(1 - t, 3);
    const cx = lerp(sx, ex + tw / 2, e2);
    const cy = lerp(sy, ey + th / 2, e);
    const sc = lerp(0.25, 1, e2);
    const unfold = lerp(0.05, 1, e2); // 접혀 있던 티켓이 펴짐
    push();
    drawingContext.globalAlpha = Math.min(1, t * 3);
    translate(cx, cy);
    rotate((1 - e2) * (i - (n - 1) / 2) * 0.12);
    scale(sc, sc * unfold);
    drawMini(d, -tw / 2, -th / 2, tw, th, {
      heartBtn: true,
      line2: [d.network, kindOf(d)].filter(Boolean).join(" · "),
    });
    pop();
    if (t > 0.7 && !drawerClosing)
      L.drawerCards.push({
        d,
        x: ex,
        y: ey,
        w: tw,
        h: th,
        heart: { x: ex + tw - 42, y: ey + 6, w: 36, h: 36 },
      });
  });
}

// ▶ easeBack — 끝에서 살짝 넘쳤다가 돌아오는 움직임
function easeBack(t) {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

// ▶ openDrawer / closeDrawer — 서랍 열고 닫기
function openDrawer(yr) {
  opened = false;
  drawerYr = yr;
  drawerAt = millis();
  drawerClosing = 0;
}
function closeDrawer() {
  if (!drawerYr || drawerClosing) return;
  drawerClosing = millis();
}

// ▶ drawerTap — 서랍이 열려 있을 때 톡: ♥ = 켜고 끄기 · 티켓 = 크게 보기 · 다른 상자 = 그 서랍 · 나머지 = 닫기
function drawerTap(p) {
  const c = (L.drawerCards || []).find((q) => inRect(p, q));
  if (c) {
    if (inRect(p, c.heart)) return toggleLikeDrama(c.d);
    closeDrawer();
    return openTicket(c.d);
  }
  const b = (L.boxes || []).find((q) => inRect(p, q));
  if (b && b.gp.yr !== drawerYr) return openDrawer(b.gp.yr);
  closeDrawer();
}

// ▶ drawBox — 카드 상자 하나: 꽂힌 티켓들(뒤 → 앞) + 회색 앞판 + 철제 이름표
//   o = { peek(올라온 티켓), carrying, sp(움직임 속도), step(티켓 사이 간격), lift(올라오는 높이) }
function drawBox(gp, bx, by, o) {
  const BW = 250;
  const FACE = 118;
  const TOPA = 112;
  const faceY = by + TOPA;
  const ctx = drawingContext;
  const n = gp.ds.length;
  const step = o.step;
  // 서랍이 빠져나온 정도 (다시 그릴 때는 이미 계산한 값 그대로)
  const out = o.redraw
    ? drawerFace[gp.yr] || 0
    : (drawerFace[gp.yr] =
        (drawerFace[gp.yr] || 0) +
        ((gp.yr === drawerYr && !drawerClosing ? 1 : 0) -
          (drawerFace[gp.yr] || 0)) *
          o.sp);
  // 뒤 → 앞 순서로 그림 (i = 0이 맨 앞)
  for (let i = n - 1; i >= 0; i--) {
    const d = gp.ds[i];
    const lift = (liftT[d.id] =
      (liftT[d.id] || 0) +
      ((d === o.peek && !o.carrying && gp.yr !== drawerYr ? 1 : 0) -
        (liftT[d.id] || 0)) *
        o.sp); // 서랍이 열린 상자는 올라와 있던 티켓도 제자리로
    const inset = 8 + Math.min(i, 14) * 1.1;
    const jit = ((i * 37 + n * 11) % 7) - 3; // 살짝 삐뚤게 꽂힘
    const shake = 0; // (지그재그 지우기를 빼서 흔들림도 없음)
    const tx =
      bx + inset + jit * 0.6 + (shake ? Math.sin(millis() * 0.07) * 3 : 0);
    const tw = BW - inset * 2;
    const ty =
      faceY - 8 - (i + 1) * step - lift * o.lift + ((i * 13) % 3) - out * 14; // 서랍이 열리면 안의 티켓도 살짝 올라옴
    if (o.carrying && g.d === d) ctx.globalAlpha = 0.3;
    noStroke();
    if (lift > 0.05) {
      fill(0, 0, 0, 120 * lift);
      rect(tx + 3, ty + 4, tw, faceY - ty, 4);
    }
    fill(C.paper);
    rect(tx, ty, tw, faceY - ty + 2, 4, 4, 0, 0);
    fill(lerpColor(color(accentOf(d)), color(C.paper), 0.35)); // 대표색을 살짝 바래게 (눈 안 아프게)
    rect(tx, ty, tw, 5, 4, 4, 0, 0);
    if (lift > 0.3) {
      say(
        fitStr(d.title, tw - 40, 14, DISP),
        tx + 10,
        ty + 24,
        14,
        C.ink,
        LEFT,
        BASELINE,
        DISP,
        255 * lift,
      );
      if (d.liked) heart(tx + tw - 16, ty + 19, 11, true, HEART);
    }
    if (o.carrying && g.target && g.target.d === d) {
      ctx.setLineDash([5, 4]);
      noFill();
      stroke(C.paper);
      strokeWeight(2);
      rect(tx - 3, ty - 3, tw + 6, 20, 5);
      ctx.setLineDash([]);
      noStroke();
    }
    ctx.globalAlpha = 1;
    // 누르는 자리: 그 티켓이 위로 보이는 띠 (맨 앞 티켓은 상자 앞판 위까지)
    //   (올라오기 전 자리 기준이라 올라와도 깜빡이지 않음 · 올라온 티켓은 올라간 곳까지 넓혀서 맨 먼저 잡힘)
    const ty0 = faceY - 8 - (i + 1) * step + ((i * 13) % 3);
    const bandTop = Math.min(i === n - 1 ? by - 20 : ty0, ty);
    const bandBot = i === 0 ? faceY : ty0 + step;
    const band = {
      d,
      x: bx,
      y: bandTop,
      w: BW,
      h: Math.max(4, bandBot - bandTop),
    };
    if (!o.redraw) {
      if (d === o.peek) L.minis.unshift(band);
      else L.minis.push(band);
    }
  }
  // 상자 앞판: 회색 종이 상자 + 철제 이름표
  //   서랍이 열리면 앞판이 아래로 조금 내려오며 살짝 커짐 (앞으로 빠져나온 느낌) + 그림자 진하게
  push();
  if (out > 0.001) {
    const ox = bx + BW / 2;
    const oy = faceY + FACE;
    translate(ox, oy + 14 * out);
    scale(1 + 0.05 * out);
    translate(-ox, -oy);
    fill(0, 0, 0, 90 * out);
    rect(bx + 4, faceY + 12, BW, FACE, 4);
  }
  fill(0, 0, 0, 110);
  rect(bx + 2, faceY + 6, BW, FACE, 3);
  fill(150, 150, 146);
  rect(bx, faceY, BW, FACE, 3);
  fill(132, 132, 128);
  rect(bx, faceY + FACE - 7, BW, 7, 0, 0, 3, 3);
  fill(160, 160, 156);
  for (let yy = faceY + 6; yy < faceY + FACE - 10; yy += 7)
    for (let xx = bx + 5 + ((yy / 7) % 2) * 3; xx < bx + BW - 4; xx += 7)
      rect(xx, yy, 1.2, 1.2);
  const lx = bx + BW / 2 - 56;
  const ly = faceY + 30;
  fill(205, 205, 200);
  rect(lx - 3, ly - 3, 118, 56, 4);
  fill("#f5f2ea");
  rect(lx, ly, 112, 50, 2);
  say(
    gp.yr === "—" ? "연도 미상" : gp.yr,
    lx + 56,
    ly + 26,
    gp.yr === "—" ? 15 : 22,
    C.ink,
    CENTER,
    BASELINE,
    LAB,
  );
  say(`${n}장`, lx + 56, ly + 42, 10, "#666", CENTER, BASELINE, BODY);
  noFill();
  stroke(205, 205, 200);
  strokeWeight(3);
  arc(lx + 56, ly + 50, 34, 18, 0, PI);
  noStroke();
  pop();
}

// ▶ drawMini — 작은 티켓 한 장: 종이 · 포스터 · 절취선 · 제목 · 한 줄 정보 (o = 그리는 방법)
//   o.dim(들고 있음) · o.hot(놓을 자리) · o.scratch(지그재그 중) · o.line2 · o.right · o.heartBtn(♥ 버튼) · o.tag
function drawMini(d, x, y, w, h, o = {}) {
  const ph = Math.round(h * 0.75); // 절취선 높이
  const ctx = drawingContext;
  push();
  translate(x, y);
  if (o.dim) ctx.globalAlpha = 0.3;
  noStroke();
  fill(0, 0, 0, 110);
  rect(3, 6, w, h, 8);
  ticketPath(0, 0, w, h, ph, 8, 7);
  ctx.fillStyle = C.paper;
  ctx.fill();
  if (o.sel) {
    ctx.strokeStyle = accentOf(d);
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  drawPoster(d, 6, 6, w - 12, ph - 12);
  perforation(10, ph, w - 20);
  say(
    fitStr(d.title, w - 16, 13, BODY, true),
    8,
    ph + 22,
    13,
    C.ink,
    LEFT,
    BASELINE,
    BODY,
    255,
    true,
  );
  if (o.line2)
    say(
      fitStr(o.line2, w - 50, 11, BODY),
      8,
      ph + 40,
      11,
      C.ink,
      LEFT,
      BASELINE,
      BODY,
      150,
    );
  if (o.right) say(o.right, w - 8, ph + 40, 14, C.ink, RIGHT, BASELINE, LAB);
  if (o.tag) {
    const tw = textWidthOf(o.tag, 10, BODY, true) + 12;
    fill(C.ink);
    rect(10, ph - 28, tw, 18, 9);
    say(o.tag, 16, ph - 19, 10, C.paper, LEFT, CENTER, BODY, 255, true);
  }
  let hb = null;
  if (o.heartBtn) {
    fill(23, 23, 26, 210);
    circle(w - 24, 24, 32);
    heart(w - 24, 25, 15, d.liked, d.liked ? HEART : C.paper);
    hb = { x: x + w - 42, y: y + 6, w: 36, h: 36 };
  } else if (d.liked || o.heartToggle) {
    // 벽에서는 ♥를 바로 눌러 켜고 끔 (안 누른 건 흐린 빈 하트)
    fill(23, 23, 26, d.liked ? 255 : 150);
    circle(w - 20, 20, 24);
    heart(w - 20, 21, 12, d.liked, d.liked ? HEART : "rgba(243,241,236,0.75)");
    if (o.heartToggle) hb = { x: x + w - 38, y: y + 2, w: 36, h: 36 };
  }
  if (o.scratch) {
    stroke(C.paper);
    strokeWeight(2.5);
    for (let k = 0; k < o.scratch; k++)
      line(14, 30 + k * 28, w - 12, 58 + k * 28);
    noStroke();
  }
  if (o.hot) {
    ctx.setLineDash([6, 5]);
    noFill();
    stroke(C.paper);
    strokeWeight(2);
    rect(-6, -6, w + 12, h + 12, 12);
    ctx.setLineDash([]);
    noStroke();
  }
  ctx.globalAlpha = 1;
  pop();
  return hb;
}

/* =========================================================
   8. 크게 연 티켓 — 가운데 한 장만 (앞면 포스터 ↔ 뒷면 정보 · 평점 · 키워드 · 회차 띠)
========================================================= */
// ▶ drawOpen — 오른쪽에 큰 티켓 (왼쪽 상자 · 폴더는 그대로 보임) + 티켓 왼쪽에 ✕ · 삭제
function drawOpen() {
  const d = selected();
  if (!d) return (opened = false);
  drawBigTicket(d);
  if (hoverEp && hoverEp.id === d.id && flipT > 0.9 && !g)
    drawEpTip(d, hoverEp.i);
  const dx = TK.x - 34;
  say("✕", dx, TK.y + 24, 24, C.dim, CENTER, CENTER, LAB);
  L.closeBtn = { x: dx - 22, y: TK.y, w: 44, h: 48 };
  // 티켓 바로 삭제 (✕ 아래 · 잠깐 동안 되돌리기 가능)
  const dy = TK.y + 84;
  stroke(C.dim);
  strokeWeight(1.6);
  noFill();
  line(dx - 9, dy - 7, dx + 9, dy - 7);
  line(dx - 3, dy - 10, dx + 3, dy - 10);
  rect(dx - 6.5, dy - 4, 13, 15, 0, 0, 2, 2);
  line(dx - 2, dy, dx - 2, dy + 7);
  line(dx + 2, dy, dx + 2, dy + 7);
  noStroke();
  say("삭제", dx, dy + 30, 12, C.dim, CENTER, BASELINE, BODY);
  L.hits.push({ act: "del", x: dx - 24, y: dy - 20, w: 48, h: 58 });
  // 초기화 (삭제 아래): 잘못 적었을 때 지금 회차 기록만 비움 · 잠깐 동안 되돌리기 가능
  const ry = dy + 70;
  say("↺", dx, ry, 24, C.dim, CENTER, CENTER, LAB);
  say("초기화", dx, ry + 30, 12, C.dim, CENTER, BASELINE, BODY);
  L.hits.push({ act: "reset", x: dx - 26, y: ry - 20, w: 52, h: 58 });
  if (!d.tvId && !d.poster) {
    // 포스터 · 정보 연결하기 (초기화 아래)
    const ly = ry + 76;
    say("정보", dx, ly, 12, accentOf(d), CENTER, BASELINE, BODY, 255, true);
    say(
      "연결",
      dx,
      ly + 16,
      12,
      accentOf(d),
      CENTER,
      BASELINE,
      BODY,
      255,
      true,
    );
    L.hits.push({ act: "link", x: dx - 24, y: ly - 16, w: 48, h: 40 });
  }
}

// ▶ drawEpTip — 회차 띠 위 말풍선: EP 번호 · 그 화 재미 · 메모 · 명장면 시간 (메모가 없으면 쓰는 법 안내)
function drawEpTip(d, i) {
  const R = (L.eps || [])[0];
  if (!R || i < R.first || i >= R.first + R.n) return;
  const cx = R.bx + (i - R.first + 0.5) * R.bw;
  const v = d.scores[i];
  const memo = d.notes[i];
  const W = 230;
  const pad = 14;
  const lines = memo
    ? wrapStr(memo.replace(/\n/g, " "), W - pad * 2, 14, BODY).slice(0, 4)
    : [];
  const H = 46 + (memo ? lines.length * 21 : 20) + 6;
  const x = constrain(cx - W / 2, 20, W0 - W - 20);
  const y = R.y - H - 16;
  noStroke();
  fill(0, 0, 0, 90);
  rect(x + 4, y + 6, W, H, 12);
  fill(C.ink);
  rect(x, y, W, H, 12);
  triangle(cx - 8, y + H, cx + 8, y + H, cx, y + H + 10); // 꼬리: 그 화 막대를 가리킴
  say(
    `EP ${String(i + 1).padStart(2, "0")}`,
    x + pad,
    y + 30,
    22,
    C.paper,
    LEFT,
    BASELINE,
    LAB,
  );
  say(
    v !== null && v !== undefined
      ? `재미 ${Math.round(v * 10)}/10`
      : "아직 평 없음",
    x + W - pad,
    y + 28,
    13,
    accentOf(d),
    RIGHT,
    BASELINE,
    LAB,
  );
  let ly = y + 56;
  if (memo)
    lines.forEach((ln, k) => {
      const last =
        k === lines.length - 1 &&
        wrapStr(memo, W - pad * 2, 14, BODY).length > 4;
      say(
        last ? fitStr(ln + "……", W - pad * 2, 14, BODY) : ln,
        x + pad,
        ly,
        14,
        C.paper,
        LEFT,
        BASELINE,
        BODY,
      );
      ly += 21;
    });
  else {
    say(
      "메모 없음 · 꾹 누르면 이 화 메모 쓰기",
      x + pad,
      ly,
      12,
      C.dim,
      LEFT,
      BASELINE,
      BODY,
    );
    ly += 20;
  }
}

// ▶ drawBigTicket — 큰 티켓: 열 때 살짝 커지며 나오고, 뒤집을 때 가로로 납작해졌다 펴짐
function drawBigTicket(d) {
  const T = TK;
  const acc = accentOf(d);
  const sx = Math.cos(flipT * PI); // 1(앞) → 0(옆) → -1(뒤)
  const back = flipT > 0.5;
  const sc = Math.max(0.02, Math.abs(sx));
  const grow = 0.92 + 0.08 * openT;
  const ready = sc > 0.98 && openT > 0.97; // 다 펴졌을 때만 안쪽 버튼을 누를 수 있음
  L.ticket = { x: T.x, y: T.y - 34, w: T.w, h: T.h + 34 }; // (위 '뒤집기' 탭까지 티켓으로)
  L.eps = [];
  push();
  translate(T.x + T.w / 2, T.y + T.h / 2);
  scale(sc * grow, grow);
  translate(-T.w / 2, -T.h / 2);
  noStroke();

  fill(0, 0, 0, 140);
  rect(8, 14, T.w, T.h, 14);
  ticketPath(0, 0, T.w, T.h, T.ph, 14, 13);
  drawingContext.fillStyle = C.paper;
  drawingContext.fill();
  if (back) drawTicketBack(d, acc, ready);
  else drawTicketFront(d, acc, ready);
  pop();
  // 뒤집기 안내: 티켓 위에 떠 있는 글자 한 줄 (취향 탭의 '↓ 아래로 내리면…'과 같은 결 · 티켓 모양은 그대로)
  const hint = back
    ? "↻  눌러서 앞면 보기"
    : d.review
      ? "↻  눌러서 뒤집으면 관람평"
      : "↻  눌러서 뒤집으면 관람평 쓰기";
  const a = 140 + 110 * Math.sin(millis() * HINT_SPEED);
  say(
    hint,
    T.x + T.w / 2,
    T.y - 14 + 3 * Math.sin(millis() * HINT_SPEED),
    13,
    C.paper,
    CENTER,
    BASELINE,
    BODY,
    back ? 150 : a,
  );
}

// ▶ drawTicketFront — 앞면: 포스터 + 아래 쪽지(제목 · 연도 · 방송사 · ♥ · 바코드)
function drawTicketFront(d, acc, ready) {
  const T = TK;
  const w = T.w;
  const ph = T.ph;
  drawPoster(d, 14, 14, w - 28, ph - 28, 6);
  const sn = d.watchLabel; // 몇 번째로 본 표인지 (날짜는 안 보여 줌)
  fill(C.ink);
  rect(24, 24, textWidthOf(sn, 15, LAB) + 16, 24, 12);
  say(sn, 32, 37, 15, C.paper, LEFT, CENTER, LAB);
  perforation(18, ph, w - 36);

  const ts = textWidthOf(d.title, 30, DISP) > w - 96 ? 24 : 30;
  say(
    fitStr(d.title, w - 96, ts, DISP),
    22,
    ph + 52,
    ts,
    C.ink,
    LEFT,
    BASELINE,
    DISP,
  );
  say(
    fitStr((d.en || "").toUpperCase(), w - 96, 17, LAB),
    22,
    ph + 75,
    17,
    acc,
    LEFT,
    BASELINE,
    LAB,
  );
  say(
    [d.year, d.network, `${d.eps}부작`, kindOf(d)]
      .filter(Boolean)
      .join("  ·  "),
    22,
    ph + 98,
    12,
    C.ink,
    LEFT,
    BASELINE,
    BODY,
    170,
  );
  fill(d.liked ? HEART : "rgba(23,23,26,0.08)");
  circle(w - 44, ph + 44, 46);
  heart(w - 44, ph + 46, 20, d.liked, d.liked ? C.paper : C.ink);
  const ghost = pastAvg(d); // 지난 회차 그래프 (이번 회차에 평이 없는 화는 흐리게 대신 보여 줌)
  // 앞면: 지금 회차 막대 + 지난 회차는 점선 (메모 점은 뒷면에만)
  scoreBarcode(d, 22, T.h - 62, w - 44 - 140, 34, acc, {
    prev: ghost,
    noDots: true,
  });
  say(
    `EP 01 — ${String(d.eps).padStart(2, "0")}` +
      (ghost ? `  ·  점선 = ${ghost.label}` : ""),
    22,
    T.h - 14,
    10,
    C.ink,
    LEFT,
    BASELINE,
    LAB,
    140,
  );
  say(
    d.status === "done"
      ? "완주"
      : d.status === "want"
        ? "예매"
        : `보는 중 · EP ${ratedEps(d)}/${d.eps}`, // 뒷면 STATUS와 같은 말
    w - 22,
    T.h - 26,
    13,
    C.ink,
    RIGHT,
    BASELINE,
    BODY,
    200,
    true,
  );
  if (ready)
    L.hits.push({
      act: "like",
      x: T.x + w - 70,
      y: T.y + ph + 18,
      w: 52,
      h: 52,
    });
}

// ▶ drawTicketBack — 뒷면: 기본 정보 · 내 평점 · 내 키워드 | 절취선 | 한줄평 · 회차 띠 · 관람 기록
function drawTicketBack(d, acc, ready) {
  const T = TK;
  const w = T.w;
  const ph = T.ph;
  const ab = (r) => ({ x: T.x + r.x, y: T.y + r.y, w: r.w, h: r.h }); // 티켓 안 위치 → 화면 위치
  fill(acc);
  rect(0, 0, w, 44, 14, 14, 0, 0);
  say(
    d.history.length ? "REWATCHED TICKET" : "TICKET",
    20,
    30,
    20,
    C.ink,
    LEFT,
    BASELINE,
    LAB,
  ); // 처음 본 건 그냥 TICKET, 두 번 이상 본 건 REWATCHED
  say(d.watchLabel, w - 20, 30, 20, C.ink, RIGHT, BASELINE, LAB);

  // ── 위: 제목 · 정보 한 줄 · 전체 평점 ──
  const ts = textWidthOf(d.title, 28, DISP) > w - 40 ? 22 : 28;
  const editing = inline && inline.o.titleOf === d; // 제목을 고치는 중이면 그 자리는 글자 칸이 대신
  if (editing);
  else if (d.title)
    say(
      fitStr(d.title, w - 40, ts, DISP),
      20,
      82,
      ts,
      C.ink,
      LEFT,
      BASELINE,
      DISP,
    );
  else say("제목을 써 주세요", 20, 80, 22, C.ink, LEFT, BASELINE, DISP, 70);
  if (ready)
    L.hits.push({ act: "title", ...ab({ x: 10, y: 50, w: w - 20, h: 42 }) });

  // 정보 한 줄: 연도 · 방송사 · 회차 · 장르 · 상태 (각각 톡 = 고치기 / 바꾸기)
  const prog =
    d.status === "done"
      ? "완주"
      : d.status === "want"
        ? "예매"
        : `보는 중 ${ratedEps(d)}/${d.eps}`; // 보는 중 = 평을 남긴 화 수
  const infos = [
    [d.year || "연도", "year"],
    [d.network || "방송사", "network"],
    [`${d.eps}부작`, "eps"],
    [kindOf(d), "kind"],
    [prog, "status"],
  ];
  let ix = 20;
  const iy = 106;
  infos.forEach(([v, act], i) => {
    const tint = act === "kind" || act === "status";
    const tw = textWidthOf(v, 12, BODY, tint);
    say(
      v,
      ix,
      iy,
      12,
      tint ? acc : C.ink,
      LEFT,
      BASELINE,
      BODY,
      tint ? 255 : 170,
      tint,
    );
    if (ready)
      L.hits.push(
        tint
          ? { act, ...ab({ x: ix - 3, y: iy - 18, w: tw + 6, h: 26 }) }
          : {
              act: "field",
              key: act,
              ...ab({ x: ix - 3, y: iy - 18, w: tw + 6, h: 26 }),
              box: ab({
                x: ix - 6,
                y: iy - 18,
                w: Math.max(70, tw + 20),
                h: 26,
              }),
            },
      );
    ix += tw;
    if (i < infos.length - 1) {
      say("·", ix + 5, iy, 12, C.ink, LEFT, BASELINE, BODY, 120);
      ix += 14;
    }
  });

  // 전체 평점 (이 드라마 전체에 대한 내 점수) — 위쪽에 크게
  const r = d.rating;
  say("MY RATING", 20, 134, 12, C.ink, LEFT, BASELINE, LAB, 120);
  say(
    r ? String(r) : "?",
    18,
    184,
    52,
    C.ink,
    LEFT,
    BASELINE,
    LAB,
    r ? 255 : 60,
  );
  say(
    "/10",
    22 + textWidthOf(r ? String(r) : "?", 52, LAB),
    184,
    18,
    C.ink,
    LEFT,
    BASELINE,
    LAB,
    110,
  );
  drawStars(w - 132, 160, 20, r || 0, acc);
  if (ready)
    for (let n = 1; n <= 10; n++)
      L.hits.push({
        act: "rate",
        n,
        ...ab({
          x: w - 132 + Math.floor((n - 1) / 2) * 23 + ((n - 1) % 2) * 10,
          y: 142,
          w: 11.5,
          h: 40,
        }),
      });
  const prev = prevWatch(d);
  if (prev && prev.rating)
    say(
      `${prev.label} ★${prev.rating}`,
      w - 20,
      190,
      12,
      C.ink,
      RIGHT,
      BASELINE,
      BODY,
      130,
    );
  else if (!r)
    say(
      "별을 눌러 평점",
      w - 20,
      190,
      12,
      acc,
      RIGHT,
      BASELINE,
      BODY,
      255,
      true,
    );
  stroke(23, 23, 26, 40);
  strokeWeight(1);
  line(20, 202, w - 20, 202);
  noStroke();

  // ── 가운데(가장 크게): 관람평 — 이 앱의 중심 ──
  say("MY REVIEW", 20, 226, 14, C.ink, LEFT, BASELINE, LAB, 150);
  if (d.review) {
    // 관람평 지우기: 'MY REVIEW' 오른쪽에 작게 (알림 톡 = 되돌리기)
    const dx0 = 26 + textWidthOf("MY REVIEW", 14, LAB);
    say("지우기", dx0, 225, 11, C.ink, LEFT, BASELINE, BODY, 120);
    stroke(23, 23, 26, 70);
    strokeWeight(1);
    line(dx0, 228, dx0 + textWidthOf("지우기", 11, BODY), 228);
    noStroke();
    if (ready)
      L.hits.push({
        act: "delrev",
        ...ab({ x: dx0 - 6, y: 208, w: 44, h: 26 }),
      });
  }
  say(d.watchLabel, w - 20, 226, 12, C.ink, RIGHT, BASELINE, LAB, 120);
  const PX = 14; // 줄 노트 종이
  const PY = 236;
  const PW = w - 28;
  const PH = 158;
  const LH = 24;
  fill(251, 248, 241);
  rect(PX, PY, PW, PH, 10);
  stroke(220, 211, 194);
  strokeWeight(1);
  for (let ly = PY + LH + 6; ly < PY + PH - 4; ly += LH)
    line(PX + 10, ly, PX + PW - 10, ly);
  noStroke();
  const before =
    [...d.history].reverse().find((h) => h.review) ||
    (d.history.length ? d.history[d.history.length - 1] : null); // 지난 회차 관람평 (없어도 줄은 보여서 거기서 쓰기)
  const maxLines = before ? 4 : 5;
  if (d.review) {
    let lines = [];
    d.review
      .split("\n")
      .forEach((para, j) =>
        wrapStr(j === 0 ? `“${para}` : para, PW - 24, 15, BODY).forEach((ln) =>
          lines.push(ln),
        ),
      );
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = fitStr(
        lines[maxLines - 1] + "……",
        PW - 24,
        15,
        BODY,
      );
    } else lines[lines.length - 1] += "”";
    lines.forEach(
      (ln, i) =>
        say(ln, PX + 12, PY + 24 + i * LH, 15, C.ink, LEFT, BASELINE, BODY), // 쓴 그대로 (모든 줄 같은 굵기)
    );
  } else {
    say(
      "이 드라마는 어땠나요?",
      PX + 12,
      PY + 24,
      14,
      C.ink,
      LEFT,
      BASELINE,
      BODY,
      90,
    ); // 빈 칸: 조용한 안내 한 줄
  }
  if (before) {
    // 지난 회차 관람평 한 줄 + 오른쪽 '보기 · 고치기 ›' (톡 = 모든 회차 창에서 회차마다 고치기)
    const more = "보기 · 고치기 ›";
    const mw = textWidthOf(more, 11, BODY, true);
    say(
      more,
      PX + PW - 12,
      PY + PH - 12,
      11,
      acc,
      RIGHT,
      BASELINE,
      BODY,
      255,
      true,
    );
    say(
      fitStr(
        before.review
          ? `${before.label}  “${before.review.replace(/\n/g, " ")}”`
          : `${before.label}  관람평 없음`,
        PW - 24 - mw - 10,
        12,
        BODY,
      ),
      PX + 12,
      PY + PH - 12,
      12,
      C.ink,
      LEFT,
      BASELINE,
      BODY,
      120,
    );
    if (ready)
      L.hits.push({
        act: "all",
        ...ab({ x: PX, y: PY + PH - 28, w: PW, h: 28 }),
      }); // 지난 관람평 톡 = 모든 회차 감상
  }
  if (ready)
    L.hits.push({
      act: "line",
      ...ab({ x: PX, y: PY, w: PW, h: before ? PH - 28 : PH }),
      box: ab({ x: PX, y: PY, w: PW, h: before ? PH - 28 : PH }), // 쓰는 칸 = 종이 그대로
    });

  // ── 회차 메모 (EP MEMO) — 몇 화에 뭐가 좋았는지 · 톡 = 그 화 메모 · + = 새 메모 (띠를 꾹 눌러도 그 화 메모)
  const my = 440;
  say("EP MEMO", 20, my - 2, 14, C.ink, LEFT, BASELINE, LAB, 150);
  const noteIdx = Object.keys(d.notes)
    .map(Number)
    .filter((i) => i < d.eps)
    .sort((a, b) => a - b);
  let nx = 20 + textWidthOf("EP MEMO", 14, LAB) + 10;
  const plusW = noteIdx.length ? 30 : 0;
  const right = w - 20 - plusW - 6;
  let shown = 0;
  for (const i of noteIdx) {
    const room = right - nx;
    if (room < 70) break;
    const t = fitStr(
      `${i + 1}화 ${d.notes[i]}`,
      Math.min(room, 180) - 20,
      12,
      BODY,
    );
    const tw = textWidthOf(t, 12, BODY) + 20;
    fill(lerpColor(color(acc), color(C.paper), 0.82));
    rect(nx, my - 18, tw, 26, 13);
    say(t, nx + 10, my - 4, 12, C.ink, LEFT, CENTER, BODY, 255);
    if (ready)
      L.hits.push({
        act: "note",
        i,
        ...ab({ x: nx, y: my - 20, w: tw, h: 30 }),
      });
    nx += tw + 6;
    shown++;
  }
  if (shown < noteIdx.length)
    say(`+${noteIdx.length - shown}`, nx, my - 4, 12, acc, LEFT, CENTER, LAB);
  const nextEp = Math.max(0, Math.min(d.eps - 1, (d.upTo || 1) - 1)); // 새 메모: 지금 보고 있는 화
  if (noteIdx.length) {
    noFill();
    stroke(acc);
    strokeWeight(1.2);
    drawingContext.setLineDash([3, 3]);
    rect(w - 20 - plusW, my - 18, plusW, 26, 13);
    drawingContext.setLineDash([]);
    noStroke();
    say(
      "+",
      w - 20 - plusW / 2,
      my - 4,
      15,
      acc,
      CENTER,
      CENTER,
      BODY,
      255,
      true,
    );
    if (ready)
      L.hits.push({
        act: "note",
        i: nextEp,
        ...ab({ x: w - 20 - plusW - 4, y: my - 20, w: plusW + 8, h: 30 }),
      });
  } else {
    say(
      `+ ${nextEp + 1}화 메모 쓰기 · 띠를 꾹 = 그 화에`,
      nx,
      my,
      12,
      acc,
      LEFT,
      BASELINE,
      BODY,
      255,
      true,
    );
    if (ready)
      L.hits.push({
        act: "note",
        i: nextEp,
        ...ab({ x: nx - 4, y: my - 20, w: w - 20 - nx, h: 30 }),
      });
  }
  perforation(18, ph, w - 36);

  // ── 절취선 아래(티켓 꼬리): 회차 띠 · 관람 기록 ──
  // 회차 띠: 막대 = 지금 감상 · 점선 = 지난 감상 · 점 = 그 화 메모
  say("EPISODES", 22, ph + 34, 13, C.ink, LEFT, BASELINE, LAB, 120);
  if (prev)
    say(
      `점선 = ${pastAvg(d).label}`,
      22 + textWidthOf("EPISODES", 13, LAB) + 10,
      ph + 34,
      11,
      acc,
      LEFT,
      BASELINE,
      LAB,
      170,
    );
  const sx = 22;
  const sw = w - 44;
  const sy = ph + 50;
  const sh = 76;
  const bw = sw / d.eps;
  scoreBarcode(d, sx, sy, sw, sh, acc, {
    holding: g && g.chart ? g.idx : -1,
    prev: pastAvg(d),
    ghost: pastAvg(d), // 이번 회차에 평 없는 화 = 지난 회차 막대를 흐리게
  });
  if (ready)
    L.eps = [
      {
        first: 0,
        n: d.eps,
        bx: T.x + sx,
        bw,
        y: T.y + sy - 6,
        barH: sh,
        h: sh + 6,
      },
    ];

  // 관람 기록 (1회차 ★7 → 2회차 ★10) + 다시 보기
  const rb = { x: w - 22 - 96, y: ph + 160, w: 96, h: 26 };
  const all = watches(d);
  const label = (q) => `${q.label}${q.rating ? " ★" + q.rating : ""}`;
  let ws = [];
  for (let k = all.length - 1; k >= 0; k--) {
    const next = [all[k], ...ws];
    const width =
      next.reduce((a, q) => a + textWidthOf(label(q), 15, LAB) + 6, 0) +
      (next.length - 1) * 16 +
      (k > 0 ? 20 : 0);
    if (width > rb.x - 30 && ws.length) break;
    ws = next;
  }
  let wx = 22;
  if (ws.length < all.length) {
    say("…", wx, ph + 178, 15, C.ink, LEFT, BASELINE, LAB, 110);
    wx += 16;
  }
  ws.forEach((q, i) => {
    const t = label(q);
    say(
      t,
      wx,
      ph + 178,
      15,
      q.now ? acc : C.ink,
      LEFT,
      BASELINE,
      LAB,
      q.now ? 255 : 150,
    );
    wx += textWidthOf(t, 15, LAB) + 6;
    if (i < ws.length - 1) {
      say("→", wx, ph + 178, 13, C.ink, LEFT, BASELINE, LAB, 110);
      wx += 16;
    }
  });
  if (ready && all.length > 1)
    L.hits.push({ act: "all", ...ab({ x: 14, y: ph + 158, w: wx, h: 28 }) });

  noFill();
  stroke(C.ink);
  strokeWeight(1.2);
  rect(rb.x, rb.y, rb.w, rb.h, 13);
  noStroke();
  say(
    `↻ ${d.history.length + 2}회차 보기`,
    rb.x + rb.w / 2,
    rb.y + 13,
    11,
    C.ink,
    CENTER,
    CENTER,
    BODY,
    255,
    true,
  );
  if (ready) L.hits.push({ act: "rewatch", ...ab(rb) });
}

/* =========================================================
   9. 연도별 — 그 해에 나온 드라마 중 내가 좋아한 것에 ♥
========================================================= */
// ▶ findMine — 연도별 목록의 드라마가 이미 내 티켓에 있는지
function findMine(ko, en) {
  return findDup({ title: ko, en });
}

// ▶ normTitle — 제목 비교용: 띄어쓰기 · 문장부호 · 대소문자 무시 ("갯마을 차차차" = "갯마을차차차")
function normTitle(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[\s·.,:;!?'"“”‘’~\-_()\[\]]/g, "");
}

// 드라마 '느낌' 꼬리표 — 같은 장르(로맨스)라도 결이 다른 걸 가르려고 (비슷한 드라마 고를 때 씀)
//   로코 · 멜로 · 첫사랑 · 청춘 · 학원 · 직장 · 힐링 · 위로 · 가족 · 레트로 · 타임슬립 · 판타지 · 귀신 · 사극 · 궁중 · 정치
//   재벌 · 계약 · 군인 · 의사 · 법정 · 수사 · 복수 · 웹툰
const MOOD = {
  "나의 아저씨": "위로 직장 힐링",
  "눈물의 여왕": "재벌 멜로 로코",
  정년이: "청춘 레트로",
  "선재 업고 튀어": "타임슬립 첫사랑 청춘 로코",
  "폭싹 속았수다": "가족 레트로 멜로 위로",
  무빙: "판타지 가족 청춘",
  "비밀의 숲": "수사 법정",
  "미스터 션샤인": "사극 멜로",
  "응답하라 1988": "레트로 가족 첫사랑 청춘",
  도깨비: "판타지 귀신 멜로",
  "슬기로운 감빵생활": "위로 힐링",
  "사랑의 불시착": "군인 재벌 로코",
  "동백꽃 필 무렵": "힐링 수사 로코 위로",
  "슬기로운 의사생활": "의사 힐링 위로",
  "그 해 우리는": "첫사랑 청춘 힐링",
  "스물다섯 스물하나": "청춘 레트로 첫사랑",
  "나의 해방일지": "위로 힐링 멜로",
  "달의 연인": "사극 타임슬립 멜로 궁중",
  "악의 마음을 읽는 자들": "수사",
  "100일의 거짓말": "로코 계약",
  엄마친구아들: "로코 첫사랑 힐링",
  "우리들의 블루스": "힐링 위로 가족",
  프로듀사: "직장 로코",
  "오 나의 귀신님": "귀신 로코",
  "육룡이 나르샤": "사극 정치",
  "시크릿 가든": "판타지 재벌 로코",
  "장난스런 키스": "학원 로코 첫사랑",
  "성균관 스캔들": "사극 청춘 로코",
  "김비서가 왜 그럴까": "직장 재벌 로코",
  "뷰티 인사이드": "판타지 로코",
  라이브: "직장 수사 위로",
  "더 글로리": "복수",
  구미호뎐: "귀신 판타지",
  마스크걸: "복수 수사",
  킹더랜드: "재벌 직장 로코",
  "경이로운 소문": "귀신 판타지",
  악귀: "귀신 수사",
  퀸메이커: "정치 직장",
  연인: "사극 멜로",
  "일타 스캔들": "로코 직장",
  "나쁜 엄마": "가족 위로 복수",
  "수상한 파트너": "법정 로코",
  "사랑의 온도": "멜로 직장",
  "로봇이 아니야": "로코 판타지",
  "또 오해영": "로코 멜로",
  더블유: "판타지 웹툰 멜로",
  W: "판타지 웹툰 멜로",
  "태양의 후예": "군인 의사 로코",
  "구르미 그린 달빛": "사극 궁중 청춘 로코",
  "낭만닥터 김사부": "의사",
  "질투의 화신": "직장 로코",
  "푸른 바다의 전설": "판타지 로코",
  "나의 완벽한 비서": "직장 로코",
  원경: "사극 정치 궁중",
  "언젠가는 슬기로운 전공의생활": "의사 청춘",
  "폭군의 셰프": "사극 타임슬립 로코 궁중",
  "뿌리깊은 나무": "사극 수사 정치",
  드림하이: "학원 청춘",
  "내 남편과 결혼해줘": "타임슬립 복수 직장",
  굿파트너: "법정",
  "유미의 세포들": "웹툰 로코 직장",
  "응답하라 1997": "레트로 첫사랑 학원",
  "미지의 서울": "위로 힐링 가족",
  "멋진 신세계": "타임슬립 로코",
  "이 사랑 통역 되나요?": "로코 직장",
  환혼: "판타지 사극 청춘",
  "알고있지만,": "청춘 멜로",
  "어쩌다 발견한 하루": "웹툰 학원 판타지",
  "아는 와이프": "타임슬립 로코 가족",
  "황후의 품격": "궁중 복수",
  "알함브라 궁전의 추억": "판타지 수사",
  "힘쎈여자 도봉순": "판타지 로코",
  "쌈 마이웨이": "청춘 로코",
  "SKY 캐슬": "가족 학원",
  "킬미, 힐미": "로코 위로",
  하이에나: "법정 로코",
  "그녀는 예뻤다": "직장 첫사랑 로코",
  시그널: "수사 판타지",
  "역도요정 김복주": "청춘 학원 로코 첫사랑",
  "이번 생은 처음이라": "계약 로코 위로",
  "당신이 잠든 사이에": "판타지 수사",
  "백일의 낭군님": "사극 로코",
  "호텔 델루나": "귀신 판타지 멜로",
  스토브리그: "직장",
  킹덤: "사극 정치",
  "멜로가 체질": "직장 위로 로코",
  "이태원 클라쓰": "복수 청춘",
  "사이코지만 괜찮아": "위로 멜로",
  "부부의 세계": "복수 가족",
  스타트업: "직장 청춘 첫사랑",
  스위트홈: "판타지",
  빈센조: "복수 법정",
  "갯마을 차차차": "힐링 로코",
  "D.P.": "군인",
  "이상한 변호사 우영우": "법정 위로",
  "재벌집 막내아들": "타임슬립 재벌 복수",
  사내맞선: "계약 직장 로코",
  "닥터 차정숙": "의사 가족",
  "정신병동에도 아침이 와요": "의사 위로",
  "지금 거신 전화는": "계약 멜로 수사",
  중증외상센터: "의사",
  "내 이름은 김삼순": "로코 위로",
  "커피프린스 1호점": "로코 청춘",
  하얀거탑: "의사 정치",
  "해를 품은 달": "사극 궁중 멜로",
  "별에서 온 그대": "판타지 로코",
  "응답하라 1994": "레트로 첫사랑 청춘",
  "굿 닥터": "의사 위로",
  "괜찮아, 사랑이야": "위로 멜로",
  미생: "직장 위로",
  "디어 마이 프렌즈": "가족 위로",
  보이스: "수사",
  고백부부: "타임슬립 가족",
  "런 온": "로코 청춘",
  여신강림: "학원 웹툰 로코",
  철인왕후: "사극 궁중 로코 판타지",
  "옷소매 붉은 끝동": "사극 궁중 멜로",
  나빌레라: "위로 가족",
  모범택시: "복수",
  괴물: "수사",
  마우스: "수사",
  술꾼도시여자들: "위로 직장",
  "사랑의 이해": "직장 멜로",
  "기상청 사람들": "직장 로코",
  슈룹: "사극 가족 궁중",
  "웰컴투 삼달리": "힐링 로코 첫사랑",
  "오징어 게임": "복수",
};
const MOOD_N = {};
Object.entries(MOOD).forEach(([k, v]) => (MOOD_N[normTitle(k)] = v.split(" ")));
// ▶ moodOf — 그 드라마의 느낌 꼬리표 (모르면 빈 목록) · '더 글로리 파트2', '환혼 1' 같은 것도 찾음
function moodOf(title) {
  const t = String(title || "");
  return (
    MOOD_N[normTitle(t)] ||
    MOOD_N[normTitle(t.replace(/\s*(파트|시즌|part|season)?\s*\d+$/i, ""))] ||
    []
  );
}

// ▶ sameDrama — 같은 드라마인지: 한글 제목 · 영어 제목 · TVmaze 번호 중 하나라도 같으면
function sameDrama(a, b) {
  if ((a.season || 1) !== (b.season || 1)) return false; // 같은 드라마라도 시즌이 다르면 다른 티켓
  if (a.tvId && b.tvId && a.tvId === b.tvId) return true;
  if (a.en && b.en && normTitle(a.en) === normTitle(b.en)) return true;
  const ta = normTitle(a.title);
  return !!ta && ta === normTitle(b.title);
}

// ▶ findDup — 이미 발권한 티켓 찾기 (except = 지금 만들고 있는 그 티켓은 빼고)
function findDup(info, except) {
  return (
    data.dramas.find((d) => d !== except && !d.draft && sameDrama(info, d)) ||
    null
  );
}

// ▶ alreadyHave — 이미 있는 드라마를 또 발권하려 할 때: 그 티켓을 열고 알림
function alreadyHave(d) {
  filter = "all";
  openTicket(d);
  toast(`이미 발권한 티켓입니다 · '${d.title}'`);
}

// ▶ mergeDups — 예전에 같은 드라마로 여러 장 발권된 티켓을 한 장으로 합침
//   내용이 더 많은 티켓을 남기고, 빈 칸(한줄평 · 평점 · 포스터 · 회차 평 · 메모 · 키워드 · ♥)은 다른 장에서 채움
function mergeDups() {
  const rich = (d) =>
    d.history.length * 100 +
    d.scores.filter((v) => v !== null && v !== undefined).length +
    (d.review ? 10 : 0) +
    (d.rating ? 5 : 0) +
    Object.keys(d.notes).length * 3 +
    d.keys.length;
  const keep = [];
  const moved = {}; // 없어진 티켓 id → 남긴 티켓 id (폴더 연결 옮기기)
  let merged = 0;
  data.dramas.forEach((d) => {
    const k = keep.find((q) => sameDrama(q, d));
    if (!k) return keep.push(d);
    merged++;
    const [a, b] = rich(d) > rich(k) ? [d, k] : [k, d]; // a = 남길 티켓
    a.liked = a.liked || b.liked;
    a.keys = [...new Set([...a.keys, ...b.keys])];
    for (const i in b.notes) if (!a.notes[i]) a.notes[i] = b.notes[i];
    [
      "review",
      "rating",
      "poster",
      "posterBig",
      "en",
      "tvId",
      "year",
      "network",
      "kind",
      "info",
    ].forEach((f) => {
      if (!a[f] && b[f]) a[f] = b[f];
    });
    if (a.eps === b.eps)
      a.scores = a.scores.map((v, i) =>
        v === null || v === undefined ? b.scores[i] : v,
      );
    a.touched = Math.max(a.touched || 0, b.touched || 0);
    moved[b.id] = a.id;
    if (a !== k) keep[keep.indexOf(k)] = a;
  });
  if (!merged) return 0;
  const real = (id) => (moved[id] ? real(moved[id]) : id);
  (data.sets || []).forEach((st) => {
    if (st.ids) st.ids = [...new Set(st.ids.map(real))];
  });
  data.dramas = keep;
  saveData();
  return merged;
}

// ▶ yearRange — 위쪽 연도 줄에 보일 해들 (2015 ~ 올해, 내 티켓에 더 옛날 드라마가 있으면 거기부터, 최대 20년)
function yearRange() {
  const ys = data.dramas
    .map((d) => parseInt(d.year, 10))
    .filter((y) => y > 1950);
  const hi = Math.max(new Date().getFullYear(), ...ys);
  const lo = Math.max(hi - 19, Math.min(2015, ...ys));
  const out = [];
  for (let y = lo; y <= hi; y++) out.push(y);
  return out;
}

/* =========================================================
   9. 감상 — 볼 때마다 남긴 한줄평 · 회차 메모를 한곳에 (드라마 하나 = 티켓 한 줄)
========================================================= */
// ▶ reviewList — 감상이 있는 드라마들: 한줄평이나 회차 메모가 하나라도 있으면, 최근에 만진 순서
// ▶ lastRating — 보여 줄 평점: 지금 회차 평점, 아직 없으면 가장 최근 회차의 평점 { r, label(지난 회차면 '3회차') }
function lastRating(d) {
  if (d.rating) return { r: d.rating, label: "" };
  const h = [...d.history].reverse().find((q) => q.rating);
  return h ? { r: h.rating, label: h.label } : { r: null, label: "" };
}

// 감상 정렬: 최근 · 이름 · 평점 높은 · 평점 낮은 · 많이 본
const REVIEW_SORTS = [
  ["recent", "최근순 ↓"],
  ["name", "이름순 ↓"],
  ["high", "평점 높은순 ↓"],
  ["low", "평점 낮은순 ↑"],
  ["most", "많이 본순 ↓"],
];
let reviewSort = "recent";
// 감상 카드 바탕: "paper"(크림 종이) · "clear"(투명 · 테두리만) · "tint"(티켓 색이 살짝 밴 종이)
let REVIEW_CARD = "paper";
function reviewList() {
  const recent = (a, b) => (b.touched || 0) - (a.touched || 0);
  const byRating = (dir) => (a, b) => {
    const ra = lastRating(a).r;
    const rb = lastRating(b).r;
    if (!ra !== !rb) return ra ? -1 : 1; // 평점 없는 건 맨 뒤
    return dir * ((rb || 0) - (ra || 0)) || recent(a, b);
  };
  const cmp = {
    recent,
    name: (a, b) => a.title.localeCompare(b.title, "ko"),
    high: byRating(1),
    low: byRating(-1),
    most: (a, b) => watches(b).length - watches(a).length || recent(a, b),
  }[reviewSort];
  // 위 검색창에 쓴 글자로 거르기: 제목 · 영어 제목 · 연도 · 방송사 · 장르 · 관람평 내용 · 회차 메모 내용
  const q = ui.input ? ui.input.value.trim().toLowerCase() : "";
  const hit = (d) =>
    !q ||
    [
      d.title,
      d.en,
      d.year,
      d.network,
      kindOf(d),
      ...watches(d).map((x) => x.review || ""),
      ...Object.values(d.notes),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  return data.dramas
    .filter(
      (d) =>
        d.title &&
        (watches(d).some((x) => x.review) || Object.keys(d.notes).length) &&
        hit(d),
    )
    .sort(cmp);
}

// ▶ drawReviews — 감상 모아 보기: 왼쪽 = 포스터 · 제목 · 평점, 절취선, 오른쪽 = 회차별 한줄평을 나란히 (→), 아래 = 회차 메모
function drawReviews() {
  const I = AREA;
  const x = I.x;
  const w = I.w;
  const y0 = I.y;
  const list = reviewList();
  const total = list.reduce(
    (a, d) => a + watches(d).filter((q) => q.review).length,
    0,
  );
  say("MY REVIEWS", x, y0 + 30, 20, C.dim, LEFT, BASELINE, LAB);
  // 정렬: 티켓 벽의 '최신순 ↓'처럼 작은 글자 하나 · 톡 = 다음 정렬로 (최근 → 이름 → 평점 높은 → 평점 낮은 → 많이 본)
  const sortLabel = REVIEW_SORTS.find(([k]) => k === reviewSort)[1];
  say(sortLabel, x, y0 + 58, 12, C.dim, LEFT, BASELINE, BODY);
  const sq = ui.input ? ui.input.value.trim() : "";
  if (sq)
    say(
      `'${fitStr(sq, 200, 12, BODY)}' 찾은 감상 ${list.length}개 · 검색창을 비우면 전체`,
      x + textWidthOf(sortLabel, 12, BODY) + 18,
      y0 + 58,
      12,
      C.paper,
      LEFT,
      BASELINE,
      BODY,
    );
  L.sortChips = [
    {
      key: "next",
      x: x - 6,
      y: y0 + 40,
      w: textWidthOf(sortLabel, 12, BODY) + 12,
      h: 26,
    },
  ];
  say(`${total}`, x + w - 74, y0 + 34, 40, C.paper, RIGHT, BASELINE, LAB);
  say("개의 감상", x + w, y0 + 30, 13, C.dim, RIGHT, BASELINE, BODY);
  L.reviewRows = [];
  if (!list.length) {
    if (sq) {
      say("찾는 감상이 없어요", x, y0 + 130, 30, C.paper, LEFT, BASELINE, DISP);
      return;
    }
    say(
      "아직 남긴 감상이 없어요",
      x,
      y0 + 120,
      34,
      C.paper,
      LEFT,
      BASELINE,
      DISP,
    );
    say(
      "티켓 뒷면에서 한줄평을 쓰거나, 회차 띠를 꾹 눌러 그 화 메모를 남겨 보세요",
      x,
      y0 + 152,
      14,
      C.dim,
      LEFT,
      BASELINE,
      BODY,
    );
    return;
  }

  // 카드 높이 = 내용만큼 · 두 줄에 번갈아 쌓기 (짧은 쪽에 다음 카드) → 빈 칸 없이
  const CG = 20; // 좌우 간격
  const RG = 14; // 위아래 간격
  const CW = (w - CG) / 2; // 카드 폭
  const SW = 84; // 왼쪽 포스터 쪽지 폭 (절취선 자리)
  const top = y0 + 76; // (위: MY REVIEWS · 정렬 글자)
  const qx0 = SW + 16; // 카드 안에서 글이 시작하는 곳
  const qw = CW - qx0 - 18;
  const FS = 14; // 관람평 글자
  const LH = 21;
  // 회차 메모 칸 높이: 한 화 = 한 줄 (아래로 쌓임 · 최대 4줄 + '외 N개')
  const MROW = 22;
  const memoH = (n) =>
    n ? 6 + Math.min(n, 4) * MROW + (n > 4 ? 16 : 0) + 6 : 0;
  // 1) 카드마다 그릴 내용과 높이 계산
  const cards = list.map((d) => {
    const ws = watches(d)
      .filter((q) => q.review)
      .slice(-3);
    const notes = Object.keys(d.notes)
      .map(Number)
      .filter((i) => i < d.eps)
      .sort((a, b) => a - b);
    let lines = [];
    if (ws.length === 1) {
      // 한 번 본 드라마: 관람평을 줄바꿈까지 그대로 (최대 5줄)
      ws[0].review
        .split("\n")
        .forEach((para, j, arr) =>
          wrapStr(
            (j === 0 ? "“" : "") + para + (j === arr.length - 1 ? "”" : ""),
            qw,
            FS,
            BODY,
          ).forEach((ln) => lines.push({ t: ln })),
        );
      if (lines.length > 5) {
        lines = lines.slice(0, 5);
        lines[4].t = fitStr(lines[4].t + "……", qw, FS, BODY);
      }
    } else
      // 다시 본 드라마: 회차마다 한 줄 (위 = 처음, 아래 = 지금)
      ws.forEach((q, j) =>
        lines.push({
          lab: q.label || `${j + 1}회차`,
          now: q.now,
          t: fitStr(`“${q.review.replace(/\n/g, " ")}”`, qw - 44, FS, BODY),
        }),
      );
    const h = Math.max(
      108, // 포스터 높이
      14 +
        20 +
        18 +
        10 +
        Math.max(1, lines.length) * LH +
        memoH(notes.length) +
        12,
    );
    return { d, lines, notes, h };
  });
  // 2) 두 줄에 쌓을 자리 정하기
  const colY = [0, 0];
  cards.forEach((c, k) => {
    const col = k % 2; // 왼쪽 → 오른쪽 번갈아 (정렬 순서가 그대로 읽히게)
    c.x = x + col * (CW + CG);
    c.y0 = colY[col];
    colY[col] += c.h + RG;
  });
  const maxS = Math.max(0, Math.max(...colY) - (H0 - top) + 10);
  if (!(g && g.mode === "rscroll"))
    reviewScroll += (constrain(reviewScroll, 0, maxS) - reviewScroll) * 0.3;
  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top - 10, W0, H0 - top + 10);
  ctx.clip();
  // 3) 그리기
  cards.forEach((c) => {
    const { d, lines, notes, h } = c;
    const x0 = c.x;
    const ry = top + c.y0 - reviewScroll;
    if (ry > H0 || ry + h < top - 10) return;
    const acc = accentOf(d);
    // 카드 바탕: paper(크림 종이) · clear(투명 · 테두리만) · tint(티켓 색이 살짝 밴 종이)
    const clear = REVIEW_CARD === "clear";
    const INK = clear ? C.paper : C.ink;
    const FAINT = clear ? "#8C877E" : C.faint;
    noStroke();
    if (clear) {
      fill(255, 255, 255, 10);
      stroke(255, 255, 255, 34);
      strokeWeight(1);
      rect(x0, ry, CW, h, 9);
      noStroke();
      fill(acc);
      rect(x0, ry + 10, 3, h - 20, 2); // 왼쪽 가장자리에 티켓 색 한 줄
    } else {
      fill(0, 0, 0, 110);
      rect(x0 + 3, ry + 5, CW, h, 9);
      fill(
        REVIEW_CARD === "tint"
          ? lerpColor(color(acc), color(C.paper), 0.82)
          : color(C.paper),
      );
      rect(x0, ry, CW, h, 9);
    }
    // 왼쪽 쪽지: 포스터 + 절취선
    drawPoster(
      d,
      x0 + 12,
      ry + 12,
      SW - 24,
      Math.min(h - 24, (SW - 24) * 1.45),
    );
    ctx.setLineDash([3, 4]);
    stroke(clear ? color(255, 255, 255, 40) : color(0, 0, 0, 55));
    strokeWeight(1.5);
    line(x0 + SW, ry + 10, x0 + SW, ry + h - 10);
    ctx.setLineDash([]);
    noStroke();
    // 절취선 위아래 반달 홈 (투명 카드는 홈 둘레에도 테두리를 이어 그림)
    fill(C.bg);
    circle(x0 + SW, ry, 12);
    circle(x0 + SW, ry + h, 12);
    if (clear) {
      noFill();
      stroke(255, 255, 255, 34);
      strokeWeight(1);
      arc(x0 + SW, ry, 12, 12, 0, PI);
      arc(x0 + SW, ry + h, 12, 12, PI, TWO_PI);
      noStroke();
    }
    // 오른쪽: 제목 · 정보 한 줄
    const qx = x0 + qx0;
    // 평점: 오른쪽 위에 크게 (한눈에 비교되게)
    const LR = lastRating(d); // 지금 회차 평점이 없으면 지난 회차 평점
    const rt = LR.r ? String(LR.r) : "–";
    const rw = textWidthOf("/10", 11, LAB);
    say("/10", x0 + CW - 16, ry + 34, 11, INK, RIGHT, BASELINE, LAB, 120);
    say(
      rt,
      x0 + CW - 18 - rw,
      ry + 36,
      28,
      LR.r ? INK : FAINT,
      RIGHT,
      BASELINE,
      LAB,
      LR.label ? 150 : 255,
    );
    if (LR.label)
      say(
        `${LR.label} 평점`,
        x0 + CW - 16,
        ry + 50,
        10,
        INK,
        RIGHT,
        BASELINE,
        BODY,
        130,
      );
    const rTot = textWidthOf(rt, 28, LAB) + rw + 6;
    if (d.liked) heart(x0 + CW - 24 - rTot, ry + 22, 11, true, HEART);
    say(
      fitStr(d.title, qw - rTot - 30, 15, DISP),
      qx,
      ry + 30,
      15,
      INK,
      LEFT,
      BASELINE,
      DISP,
    );
    say(
      fitStr(
        [d.year, d.network, kindOf(d), d.watchLabel]
          .filter(Boolean)
          .join(" · "),
        qw - rTot - 10,
        11,
        BODY,
      ),
      qx,
      ry + 48,
      11,
      INK,
      LEFT,
      BASELINE,
      BODY,
      140,
    );
    // 관람평
    let ly = ry + 48 + 10 + LH - 4;
    if (!lines.length)
      say("관람평 없음", qx, ly, 12, INK, LEFT, BASELINE, BODY, 90);
    lines.forEach((L1) => {
      if (L1.lab) {
        say(
          L1.lab,
          qx,
          ly,
          11,
          L1.now ? acc : FAINT,
          LEFT,
          BASELINE,
          BODY,
          255,
          true,
        );
        say(
          L1.t,
          qx + 44,
          ly,
          FS,
          INK,
          LEFT,
          BASELINE,
          BODY,
          L1.now ? 255 : 150,
        );
      } else say(L1.t, qx, ly, FS, INK, LEFT, BASELINE, BODY);
      ly += LH;
    });
    // 회차 메모
    if (notes.length) {
      // 회차 메모: 티켓 색으로 물든 띠 + EP 꼬리표 (리뷰 창과 같은 모양)
      const mh = memoH(notes.length) - 4;
      const my = ry + h - 12 - mh;
      if (clear) {
        const tc = color(acc);
        tc.setAlpha(46);
        fill(tc);
      } else
        fill(
          lerpColor(
            color(acc),
            color(C.paper),
            REVIEW_CARD === "tint" ? 0.6 : 0.78,
          ),
        );
      rect(qx - 6, my, qw + 12, mh, 6);
      fill(acc);
      rect(qx - 6, my, 4, mh, 6, 0, 0, 6);
      notes.slice(0, 4).forEach((i, k) => {
        const ly = my + 6 + k * MROW;
        const ep = `EP ${String(i + 1).padStart(2, "0")}`;
        const ew = textWidthOf("EP 00", 12, LAB) + 10; // 꼬리표 너비를 같게 → 메모 글이 세로로 줄 맞음
        fill(acc);
        rect(qx + 4, ly + 2, ew, 16, 4);
        say(ep, qx + 4 + ew / 2, ly + 15, 12, "#17171A", CENTER, BASELINE, LAB);
        const t = d.notes[i].replace(/\n/g, " ");
        say(
          fitStr(t, qw - ew - 20, 13, BODY),
          qx + ew + 12,
          ly + 15,
          13,
          INK,
          LEFT,
          BASELINE,
          BODY,
          255,
        );
      });
      if (notes.length > 4)
        say(
          `+ 메모 ${notes.length - 4}개 더 · 톡 = 크게 보기`,
          qx + 4,
          my + 6 + 4 * MROW + 11,
          11,
          INK,
          LEFT,
          BASELINE,
          BODY,
          140,
        );
    }
    L.reviewRows.push({ d, x: x0, y: ry, w: CW, h });
  });
  ctx.restore();
}

/* =========================================================
   10. 취향 그래프 — ♥한 드라마를 결과 연도로
========================================================= */
// ▶ drawTaste — "나는 대부분 ○○파" · 결별 비율 · 자주 쓴 키워드 · 연도별로 쌓인 티켓 그래프
function drawTaste() {
  const I = AREA;
  const x = I.x;
  const w = I.w;
  const y0 = I.y;
  const list = data.dramas.filter((d) => d.liked);
  say("MY TASTE", x, y0 + 30, 20, C.dim, LEFT, BASELINE, LAB);
  if (!list.length) {
    say(
      "아직 ♥한 드라마가 없어요",
      x,
      y0 + 120,
      34,
      C.paper,
      LEFT,
      BASELINE,
      DISP,
    );
    say(
      "연도별 탭에서 좋아한 드라마 포스터를 두 번 톡 해 보세요",
      x,
      y0 + 152,
      14,
      C.dim,
      LEFT,
      BASELINE,
      BODY,
    );
    return;
  }
  // 결별 개수
  const cnt = {};
  list.forEach((d) => (cnt[kindOf(d)] = (cnt[kindOf(d)] || 0) + 1));

  // 아래로 내리기: 그래프 아래에 취향 추천이 이어짐
  const recs = recGroups(list, cnt);
  const GRAPH_UP = TASTE_UP;
  const recTop = y0 + I.h + 40 - GRAPH_UP + 6; // 추천이 시작되는 곳 (그래프 바로 아래 · 안내 글자 밑)
  const ROW = 316; // 추천 한 줄 높이
  const maxT = recs.length
    ? Math.max(0, recTop + 70 + recs.length * ROW - H0 + 20)
    : 0;
  if (!(g && g.mode === "tscroll"))
    tasteScroll += (constrain(tasteScroll, 0, maxT) - tasteScroll) * 0.3;
  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y0 + 40, W0, H0 - y0 - 40); // 위쪽 'MY TASTE' 줄 아래부터 스크롤
  ctx.clip();
  push();
  translate(0, -tasteScroll);
  const kinds = KINDS.filter((k) => cnt[k]).sort((a, b) => cnt[b] - cnt[a]);
  const top = kinds.filter((k) => cnt[k] === cnt[kinds[0]]).slice(0, 2); // 같은 수면 둘 다
  const headline = top.join(" · ") + "파";
  say("나의 취향은", x, y0 + 72, 22, C.paper, LEFT, BASELINE, DISP);
  const hs = textWidthOf(headline, 64, DISP) > 430 ? 46 : 64;
  say(headline, x - 2, y0 + 140, hs, KIND_COL[top[0]], LEFT, BASELINE, DISP);
  const rated = list.filter((d) => d.rating);
  const avg = rated.length
    ? (rated.reduce((a, d) => a + d.rating, 0) / rated.length).toFixed(1)
    : "–";
  say(`♥한 드라마 평균 ★ ${avg}`, x, y0 + 176, 15, C.dim, LEFT, BASELINE, BODY); // 한 줄만

  // 결별 비율 (오른쪽)
  const kw = 340;
  const kx = x + w - kw;
  say("장르 (♥ 기준)", kx, y0 + 58, 12, C.dim, LEFT, BASELINE, BODY);
  KINDS.filter((k) => cnt[k]).forEach((k, i) => {
    // 0인 장르는 안 보임
    const ry = y0 + 68 + i * 20;
    const n = cnt[k] || 0;
    fill(KIND_COL[k]);
    circle(kx + 5, ry + 8, 9);
    say(k, kx + 16, ry + 13, 12, n ? C.paper : C.faint, LEFT, BASELINE, BODY);
    fill(C.box);
    rect(kx + 70, ry + 4, kw - 100, 8, 4);
    if (n) {
      fill(KIND_COL[k]);
      rect(kx + 70, ry + 4, ((kw - 100) * n) / list.length, 8, 4);
    }
    say(
      String(n),
      kx + kw,
      ry + 14,
      15,
      n ? C.paper : C.faint,
      RIGHT,
      BASELINE,
      LAB,
    );
  });

  // 연도별로 쌓인 티켓
  const base = y0 + I.h - 34 - GRAPH_UP;
  const topY = y0 + 236;
  const yrs = yearRange();
  const bw = w / yrs.length;
  const byYear = {};
  list.forEach((d) => (byYear[d.year] = byYear[d.year] || []).push(d));
  const maxN = Math.max(1, ...yrs.map((yy) => (byYear[yy] || []).length));
  const unit = Math.min(40, (base - topY - 30) / maxN); // 티켓 한 장 높이 (너무 길쭉하지 않게 최대 40)
  L.cols = [];
  stroke(255, 255, 255, 40);
  strokeWeight(1);
  line(x, base, x + w, base);
  noStroke();
  yrs.forEach((yy, k) => {
    const cx = x + k * bw;
    const stack = (byYear[yy] || [])
      .slice()
      .sort((a, b) => KINDS.indexOf(kindOf(a)) - KINDS.indexOf(kindOf(b)));
    stack.forEach((d, j) => {
      const sy = base - (j + 1) * unit;
      const sw = bw * 0.78;
      ticketPathSide(cx + bw * 0.11, sy + 2, sw, unit - 4);
      drawingContext.fillStyle = KIND_COL[kindOf(d)];
      drawingContext.fill();
      if (unit >= 18)
        say(
          fitStr(d.title, sw - 12, Math.min(11, unit * 0.42), BODY, true),
          cx + bw / 2,
          sy + unit / 2,
          Math.min(11, unit * 0.42),
          C.ink,
          CENTER,
          CENTER,
          BODY,
          255,
          true,
        );
    });
    if (stack.length)
      say(
        String(stack.length),
        cx + bw / 2,
        base - stack.length * unit - 8,
        16,
        C.paper,
        CENTER,
        BASELINE,
        LAB,
      );
    say(
      String(yy),
      cx + bw / 2,
      base + 20,
      14,
      yy === new Date().getFullYear() ? C.paper : C.dim,
      CENTER,
      BASELINE,
      LAB,
    );
    L.cols.push({
      yr: yy,
      x: cx,
      y: topY - tasteScroll,
      w: bw,
      h: base - topY + 26,
    });
  });

  // ↓ 아래에 추천이 있다는 표시 (맨 위에 있을 때만)
  if (recs.length && tasteScroll < 20) {
    const a = 140 + 110 * Math.sin(millis() * HINT_SPEED);
    say(
      "↓  아래로 내리면 내 취향 추천",
      x + w / 2,
      base + 46 + 3 * Math.sin(millis() * HINT_SPEED),
      13,
      C.paper,
      CENTER,
      BASELINE,
      BODY,
      a,
    );
  }

  // 취향 추천 — ♥ 많이 한 결 순서로 한 줄씩, 아직 안 본(내 티켓에 없는) 드라마만
  L.recs = [];
  say("FOR YOU", x, recTop + 20, 20, C.dim, LEFT, BASELINE, LAB);
  say(
    "내 취향과 같은 결, 아직 안 본 드라마 · 포스터 톡 = 발권 · + 예매 = '예매' 칸에 담기",
    x + textWidthOf("FOR YOU", 20, LAB) + 12,
    recTop + 19,
    12,
    C.dim,
    LEFT,
    BASELINE,
    BODY,
  );
  const tw = 150;
  const th = 232;
  const gap = (w - 7 * tw) / 6;
  recs.forEach((R, r) => {
    const ry = recTop + 70 + r * ROW;
    const head = R.head || `${R.kind}파라면`;
    say(head, x, ry, R.head ? 20 : 26, R.col, LEFT, BASELINE, DISP);
    if (R.from.length && !R.head)
      say(
        `♥한 '${R.from.join("', '")}'처럼${R.more ? "  ·  " + R.more : ""}`,
        x + textWidthOf(head, 26, DISP) + 14,
        ry - 2,
        13,
        C.dim,
        LEFT,
        BASELINE,
        BODY,
      );
    R.items.forEach((it, k) => {
      const cx = x + k * (tw + gap);
      const cy = ry + 20;
      drawMini(itemShow(it), cx, cy, tw, th, {
        line2: `${it.year} · ${it.kind}`,
      });
      // + 예매 버튼 (포스터 오른쪽 위)
      const bx = cx + tw - 64;
      const by = cy + 12;
      fill(23, 23, 26, 220);
      rect(bx, by, 54, 24, 12);
      say(
        "+ 예매",
        bx + 27,
        by + 13,
        11,
        C.paper,
        CENTER,
        CENTER,
        BODY,
        255,
        true,
      );
      L.recs.push({
        it,
        x: cx,
        y: cy - tasteScroll,
        w: tw,
        h: th,
        want: { x: bx - 6, y: by - 6 - tasteScroll, w: 66, h: 36 },
      });
    });
    fetchRecPosters(R.items);
  });
  pop();
  ctx.restore();
}

// ▶ itemShow — 추천 칸에 그릴 드라마 (내 티켓이면 그것, 아니면 찾아 둔 포스터로 만든 임시 드라마)
function itemShow(it) {
  if (it.d) return it.d;
  const c = catInfo[it.en] || {};
  return {
    title: it.ko,
    year: it.year,
    poster: c.poster || "",
    posterBig: c.posterBig || "",
    liked: false,
    id: it.key,
  };
}

// ▶ recGroups — 취향 추천 한 줄(7편): 위 "○○파" 결부터, 내 티켓에 없는 것만 (발권하면 빠지고 다음 걸로 채워짐)
//   그 결을 거의 다 봤으면 → 내가 ♥한 다른 결 → 아직 안 본 결 순서로 채움 · 결이 둘이면 번갈아 · 각 결 안에서는 최신순
function recGroups(list, cnt) {
  const kinds = KINDS.filter((k) => cnt[k]).sort((a, b) => cnt[b] - cnt[a]);
  if (!kinds.length) return [];
  const top = kinds.filter((k) => cnt[k] === cnt[kinds[0]]).slice(0, 2); // 위 제목과 같은 결
  const order = [
    ...top,
    ...kinds.filter((k) => !top.includes(k)), // 내가 ♥한 다른 결 (많이 ♥한 순)
    ...KINDS.filter((k) => !cnt[k]), // 아직 ♥한 적 없는 결
  ];
  const poolOf = (k) => {
    const items = [];
    Object.keys(CATALOG)
      .sort((a, b) => b - a)
      .forEach((y) =>
        CATALOG[y].forEach(([ko, en, network, eps, kind]) => {
          if (kind !== k || findMine(ko, en)) return;
          items.push({
            key: en,
            ko,
            en,
            network,
            eps,
            kind,
            year: String(y),
            d: null,
          });
        }),
      );
    return items;
  };
  const pools = order.map(poolOf);
  const items = [];
  // 1) 위 결끼리 번갈아
  const topPools = pools.slice(0, top.length);
  for (let i = 0; items.length < 7 && topPools.some((q) => q.length > i); i++)
    topPools.forEach((q) => q[i] && items.length < 7 && items.push(q[i]));
  const fromTop = items.length;
  // 2) 모자라면 다른 결에서 차례로
  for (const q of pools.slice(top.length)) {
    for (const it of q) {
      if (items.length >= 7) break;
      items.push(it);
    }
    if (items.length >= 7) break;
  }
  if (!items.length) return [];
  const others = [...new Set(items.slice(fromTop).map((it) => it.kind))];
  return [
    {
      kind: top.join(" · "),
      col: KIND_COL[top[0]],
      // 위 결을 다 봤으면 안내를 바꿈
      head: fromTop
        ? null
        : `${top.join(" · ")}는 거의 다 봤어요 · 이런 결은 어때요?`,
      more:
        fromTop && others.length ? `+ ${others.join(" · ")}도 섞었어요` : "",
      from: list
        .filter((d) => top.includes(kindOf(d)))
        .slice(0, 2)
        .map((d) => d.title),
      items: items.map((it) => {
        // 추천 이유: 같은 결로 ♥한 드라마 하나
        const same = list.find((d) => kindOf(d) === it.kind);
        it.reason = same
          ? `♥한 '${same.title}'처럼 ${it.kind}`
          : `새로운 결 · ${it.kind}`;
        return it;
      }),
    },
  ];
}

// ▶ fetchRecPosters — 추천 칸의 포스터를 하나씩 찾아 둠 (연도별 목록과 같은 방식)
function fetchRecPosters(items) {
  if (catBusy) return;
  const it = items.find((q) => !catInfo[q.en] && !catTried.has(q.en));
  if (!it) return;
  catTried.add(it.en);
  catBusy = true;
  tvSearch(it.en)
    .then((res) => {
      const hit = res.find((r) => r.lang === "Korean"); // 한국 드라마만 (엉뚱한 외국 드라마 포스터가 붙지 않게)
      if (hit) {
        catInfo[it.en] = hit;
        saveCat();
      }
    })
    .catch(() => {})
    .finally(() => setTimeout(() => (catBusy = false), 250));
}

// ▶ wantRec — 추천 드라마를 '예매'(볼 것) 티켓으로 담기 → 추천 목록에서는 빠짐
function wantRec(it) {
  const c = catInfo[it.en] || {};
  const d = makeDrama(
    {
      title: it.ko,
      en: it.en,
      year: it.year,
      network: it.network,
      eps: it.eps,
      kind: it.kind,
      tvId: c.tvId,
      poster: c.poster,
      posterBig: c.posterBig,
      info: c.info,
    },
    { status: "want" },
  );
  d.touched = Date.now();
  data.dramas.push(d);
  saveData();
  toast(`'${it.ko}' 예매했어요 · 티켓 탭 '예매' 칸에 있어요`);
  setTimeout(fetchMissingInfo, 50);
}

/* =========================================================
   11. 폴더 — 키워드 폴더(자동) + 직접 만든 폴더(끌어다 놓기)
========================================================= */
// ▶ drawFolders — 폴더 전체 (봉투 모양) 또는 연 폴더 하나
function drawFolders() {
  const I = AREA;
  const f = folderSel ? allFolders().find((q) => q.key === folderSel) : null;
  if (folderSel && !f) folderSel = null;
  if (f) return drawFolderOpen(f, I);
  const x = I.x;
  const w = I.w;
  say("FOLDERS", x, I.y + 30, 20, C.dim, LEFT, BASELINE, LAB);
  say(
    "폴더를 열고 + 칸 = 티켓 넣기",
    x + textWidthOf("FOLDERS", 20, LAB) + 12,
    I.y + 29,
    12,
    C.dim,
    LEFT,
    BASELINE,
    BODY,
  );
  const list = allFolders();
  const tw = 212;
  const th = 230;
  const gap = (w - 5 * tw) / 4;
  const top = I.y + 52;
  const tiles = [...list, { type: "new", key: "+" }];
  const maxS = Math.max(
    0,
    Math.ceil(tiles.length / 5) * (th + 20) - (I.y + I.h - top),
  );
  if (!(g && g.mode === "fscroll"))
    folderScroll += (constrain(folderScroll, 0, maxS) - folderScroll) * 0.3;
  L.tiles = [];
  L.tileDels = [];
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(I.x - 10, top - 8, I.w + 20, I.y + I.h - top + 8);
  drawingContext.clip();
  tiles.forEach((t, k) => {
    const tx = x + (k % 5) * (tw + gap);
    const ty = top + Math.floor(k / 5) * (th + 20) - folderScroll;
    if (ty > I.y + I.h || ty + th < top) return;
    const hot =
      g &&
      g.mode === "carry" &&
      g.target &&
      g.target.f &&
      g.target.f.key === t.key;
    if (t.type === "new") drawNewTile(tx, ty, tw, th, hot);
    else {
      drawEnvelope(t, tx, ty, tw, th, hot);
      // 휴지통: 폴더를 열지 않아도 밖에서 바로 지우기 (알림 톡 = 되돌리기 · 안의 티켓은 그대로)
      if (t.type === "set" && !(g && g.mode === "carry")) {
        const dx = tx + tw - 24; // 봉투 앞판 오른쪽 아래 (꽂힌 티켓과 안 겹치게)
        const dy = ty + th - 24;
        const on = inRect(hoverP, { x: dx - 18, y: dy - 18, w: 36, h: 36 });
        fill(0, 0, 0, on ? 70 : 28);
        circle(dx, dy, 34);
        trashIcon(dx, dy + 1, on ? C.ink : "rgba(23,23,26,0.7)", 0.8);
        if (dy - 18 >= top - 8)
          L.tileDels.push({ st: t.st, x: dx - 18, y: dy - 18, w: 36, h: 36 });
      }
    }
    L.tiles.push({ f: t, x: tx, y: ty, w: tw, h: th });
  });
  drawingContext.restore();
}

// ▶ drawEnvelope — 폴더 한 개: 티켓들이 꽂힌 봉투 (앞에 이름 · 자동/직접 · 장 수)
function drawEnvelope(f, x, y, w, h, hot) {
  const col = f.color;
  const mem = f.members.slice(0, 3);
  const top = y + 92;
  // 뒤판
  fill(
    red(color(col)) * 0.55,
    green(color(col)) * 0.55,
    blue(color(col)) * 0.55,
  );
  rect(x, y + 64, w, h - 64, 10);
  // 꽂힌 티켓들
  mem.forEach((d, k) => {
    const n = mem.length;
    const cx = x + w / 2 + (k - (n - 1) / 2) * 46;
    push();
    translate(cx, top + 20);
    rotate((k - (n - 1) / 2) * 0.12);
    fill(C.paper);
    rect(-34, -96, 68, 104, 5);
    drawPoster(d, -30, -92, 60, 76, 3);
    pop();
  });
  // 앞판
  fill(col);
  rect(x, top, w, h - (top - y), 10);
  fill(0, 0, 0, 30);
  triangle(x, top, x + w, top, x + w / 2, top + 30);
  say(
    fitStr(
      f.name,
      w - 42 - textWidthOf(String(f.members.length), 34, LAB),
      22,
      DISP,
    ), // 장 수와 안 겹치게
    x + 16,
    top + 62,
    22,
    C.ink,
    LEFT,
    BASELINE,
    DISP,
  );
  say(
    String(f.members.length),
    x + w - 16,
    top + 64,
    34,
    C.ink,
    RIGHT,
    BASELINE,
    LAB,
  );
  // 한 줄 요약: 평균 평점 · 연도 범위 (예: 평균 ★ 9.3 · 2015–2025)
  const rs = f.members.filter((d) => d.rating).map((d) => d.rating);
  const ys = f.members.map((d) => parseInt(d.year, 10)).filter((v) => v > 1950);
  const sum = [
    rs.length
      ? `평균 ★ ${(rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1)}`
      : "평점 없음",
    ys.length
      ? Math.min(...ys) === Math.max(...ys)
        ? `${ys[0]}`
        : `${Math.min(...ys)}–${Math.max(...ys)}`
      : "",
  ]
    .filter(Boolean)
    .join("  ·  ");
  say(
    f.members.length ? sum : "비어 있어요 · 열고 + 칸으로 넣기",
    x + 16,
    top + 90,
    13,
    C.ink,
    LEFT,
    BASELINE,
    BODY,
    170,
    true,
  );
  if (hot) {
    drawingContext.setLineDash([6, 5]);
    noFill();
    stroke(C.paper);
    strokeWeight(2.5);
    rect(x - 6, y + 58, w + 12, h - 52, 14);
    drawingContext.setLineDash([]);
    noStroke();
  }
}

// ▶ trashIcon — 휴지통 그림 (cx, cy = 가운데 · k = 크기 배율)
function trashIcon(cx, cy, col, k = 1) {
  stroke(col);
  strokeWeight(1.6);
  noFill();
  line(cx - 9 * k, cy - 7 * k, cx + 9 * k, cy - 7 * k);
  line(cx - 3 * k, cy - 10 * k, cx + 3 * k, cy - 10 * k);
  rect(cx - 6.5 * k, cy - 4 * k, 13 * k, 15 * k, 0, 0, 2, 2);
  line(cx - 2 * k, cy, cx - 2 * k, cy + 7 * k);
  line(cx + 2 * k, cy, cx + 2 * k, cy + 7 * k);
  noStroke();
}

// ▶ drawNewTile — '+ 새 폴더' 칸
function drawNewTile(x, y, w, h, hot) {
  drawingContext.setLineDash([6, 6]);
  noFill();
  stroke(hot ? C.paper : C.faint);
  strokeWeight(hot ? 2.5 : 1.5);
  rect(x, y + 64, w, h - 64, 10);
  drawingContext.setLineDash([]);
  noStroke();
  say("+", x + w / 2, y + 140, 54, C.dim, CENTER, CENTER, LAB);
  say("새 폴더 만들기", x + w / 2, y + 188, 13, C.dim, CENTER, CENTER, BODY);
}

// ▶ drawFolderOpen — 연 폴더: 이름 · 티켓들을 실로 이어서 보여 줌
function drawFolderOpen(f, I) {
  const x = I.x;
  const w = TK.x - 70 - I.x; // 오른쪽은 큰 티켓 자리
  const y0 = I.y;
  say("← 모든 폴더", x, y0 + 30, 14, C.dim, LEFT, BASELINE, BODY, 255, true);
  L.backLink = { x: x - 6, y: y0 + 8, w: 110, h: 32 };
  say(f.name, x, y0 + 92, 46, f.color, LEFT, BASELINE, DISP);
  const sub = `${f.members.length}장 · + 칸 = 티켓 넣기 · 이름 = 고치기 · 끌어 내려 휴지통에 = 빼기`;
  say(sub, x, y0 + 120, 12, C.dim, LEFT, BASELINE, BODY);
  if (f.type === "set")
    L.nameHit = { x, y: y0 + 46, w: textWidthOf(f.name, 46, DISP) + 20, h: 56 };
  L.folderDel = null; // (폴더 지우기는 모든 폴더 화면의 봉투 휴지통으로만)
  const mw = 126;
  const mh = 196;
  const COLF = 6;
  const gap = (w - COLF * mw) / (COLF - 1);
  const top = y0 + 156;
  L.members = [];
  L.folderDrop = { f, x: I.x, y: y0 + 140, w, h: I.h - 140 };
  // 티켓 전부 + 마지막 칸 '+ 티켓 넣기' · 빨랫줄이 화면보다 길면 휠 / 위아래로 밀어서 스크롤
  if (openFor !== f.key) {
    openFor = f.key;
    openScroll = 0;
  }
  const shownN = f.members.length;
  const rowsN = Math.ceil((shownN + 1) / COLF);
  const maxS = Math.max(0, rowsN * (mh + 46) - (H0 - top) + 10);
  if (!(g && g.mode === "oscroll"))
    openScroll += (constrain(openScroll, 0, maxS) - openScroll) * 0.3;
  const slot = (k) => ({
    x: x + (k % COLF) * (mw + gap),
    y: top + Math.floor(k / COLF) * (mh + 46) - openScroll,
  });
  ctx0clip(I.x - 40, top - 14, w + 80, H0 - top + 14);
  const pos = f.members.slice(0, shownN).map((d, k) => ({ d, ...slot(k) }));
  const addPos = slot(shownN); // 빨랫줄 다음 집게 자리에 빈 티켓
  const lineYs = [...new Set([...pos.map((q) => q.y), addPos.y])];
  // 실: 줄마다 빨랫줄처럼 판 끝에서 끝까지, 티켓 집게 사이가 살짝 처짐
  const ctx = drawingContext;
  ctx.strokeStyle = f.color;
  ctx.lineWidth = 2;
  lineYs.forEach((ry) => {
    const xs = [
      I.x - 24,
      ...[...pos, addPos].filter((q) => q.y === ry).map((q) => q.x + mw / 2),
      I.x + w + 24,
    ];
    ctx.beginPath();
    ctx.moveTo(xs[0], ry + 2);
    for (let k = 1; k < xs.length; k++)
      ctx.quadraticCurveTo(
        (xs[k - 1] + xs[k]) / 2,
        ry + 22,
        xs[k],
        ry + (k === xs.length - 1 ? 2 : 8),
      );
    ctx.stroke();
  });
  // 티켓: 집게를 축으로 데롱데롱 (바람에 살짝 흔들리고, 건드리면 크게 흔들림)
  const pulling = g && g.mode === "unpin" ? g.d : null;
  pos.forEach((p, k) => {
    const sw = swingOf(p.d, k);
    if (p.d !== pulling) {
      push();
      translate(p.x + mw / 2, p.y + 8);
      rotate(sw.a);
      drawMini(p.d, -mw / 2, 2, mw, mh, {
        line2: `${p.d.year || "—"} · ${kindOf(p.d)}`,
        right: p.d.rating ? `★ ${p.d.rating}` : "",
      });
      pop();
    }
    L.members.push({ d: p.d, x: p.x, y: p.y + 10, w: mw, h: mh, k });
  });
  // + 티켓 넣기: 다음 집게에 걸린 빈 점선 티켓 (톡 = 포스터로 골라 넣기)
  const ax = addPos.x;
  const ay = addPos.y + 12;
  ctx.setLineDash([6, 5]);
  noFill();
  stroke(f.color);
  strokeWeight(1.8);
  rect(ax, ay, mw, mh - 10, 8);
  ctx.setLineDash([]);
  noStroke();
  say("+", ax + mw / 2, ay + mh / 2 - 26, 46, f.color, CENTER, CENTER, LAB);
  say(
    "티켓 넣기",
    ax + mw / 2,
    ay + mh / 2 + 16,
    13,
    C.paper,
    CENTER,
    CENTER,
    BODY,
    255,
    true,
  );
  say(
    "포스터로 골라요",
    ax + mw / 2,
    ay + mh / 2 + 36,
    11,
    C.dim,
    CENTER,
    CENTER,
    BODY,
  );
  L.addTile = { x: ax, y: ay, w: mw, h: mh - 10 };
  // 집게 (뗀 티켓 자리는 빈 집게만)
  [...pos, addPos].forEach((p) => {
    fill(f.color);
    rect(p.x + mw / 2 - 7, p.y, 14, 22, 3);
    fill(0, 0, 0, 60);
    rect(p.x + mw / 2 - 7, p.y + 10, 14, 2);
  });
  drawingContext.restore(); // (빨랫줄 영역 자르기 끝 · 떼어 낸 티켓은 어디든 따라다님)
  drawTrash(pulling); // 휴지통 먼저, 들고 있는 티켓은 그 위에
  // 떼어 낸 티켓: 손가락을 따라 대롱대롱 (휴지통에 가까워질수록 작아짐)
  if (pulling) {
    const sw = swingOf(pulling, 0);
    const near = constrain(
      Math.hypot(g.cx - TRASH_X, g.cy - (H0 - 70)) / 320,
      0,
      1,
    );
    push();
    translate(g.cx, g.cy);
    rotate(sw.a);
    scale(0.4 + 0.6 * near);
    drawMini(pulling, -mw / 2, -20, mw, mh, {
      line2: `${pulling.year || "—"} · ${kindOf(pulling)}`,
    });
    pop();
  }
  if (!f.members.length)
    say(
      "비어 있어요 · + 칸을 눌러 티켓을 넣어요",
      x,
      top + 40,
      16,
      C.dim,
      LEFT,
      BASELINE,
      BODY,
    );
  if (maxS > 0 && openScroll < maxS - 10)
    say(
      `↓ 아래로 내리면 ${f.members.length}장 전부`,
      x + w,
      y0 + 120,
      12,
      C.dim,
      RIGHT,
      BASELINE,
      BODY,
    );
  if (g && g.mode === "carry" && g.target && g.target.f === f) {
    drawingContext.setLineDash([6, 5]);
    noFill();
    stroke(C.paper);
    strokeWeight(2);
    rect(L.folderDrop.x, L.folderDrop.y, L.folderDrop.w, L.folderDrop.h, 12);
    drawingContext.setLineDash([]);
    noStroke();
  }
}

// ▶ ctx0clip — 이 사각형 밖은 그리지 않음 (drawingContext.restore()로 끝냄)
function ctx0clip(x, y, w, h) {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, y, w, h);
  drawingContext.clip();
}

// ▶ swingOf — 티켓 하나의 흔들림 상태 { a(기울기), v(속도) }: 매 프레임 스프링처럼 제자리로, 바람에 살짝
const swings = {};
let swingFrame = -1;
function swingOf(d, k) {
  let s = swings[d.id];
  if (!s)
    s = swings[d.id] = {
      a: (Math.random() - 0.5) * 0.03,
      v: 0,
      ph: Math.random() * 6,
    }; // 처음엔 아주 살짝 기운 채로
  if (s.f !== frameCount) {
    s.f = frameCount;
    const breeze = Math.sin(millis() / 520 + s.ph) * 0.007; // 아주 자주, 아주 살짝 (0.4도 정도)
    s.v += (breeze - s.a) * 0.05;
    s.v *= 0.86;
    s.a += s.v;
  }
  return s;
}

// ▶ kick — 티켓을 툭 건드림 (흔들림 더하기)
function kick(d, amount) {
  const s = swings[d.id];
  if (s) s.v += amount;
}

const TRASH_X = (48 + 858) / 2; // 휴지통: 폴더 칸 가운데 (오른쪽은 큰 티켓 자리)
// ▶ drawTrash — 아래 가운데 휴지통 (티켓을 떼어 들고 있을 때만 크게, 위에 오면 뚜껑이 열림)
function drawTrash(pulling) {
  const hot =
    pulling &&
    g &&
    inRect(
      { x: g.cx, y: g.cy },
      { x: TRASH_X - 90, y: H0 - 170, w: 180, h: 170 },
    );
  const s = pulling ? (hot ? 1.25 : 1) : 0.7;
  const cx = TRASH_X;
  const by = H0 - 30;
  L.trash = { x: cx - 90, y: H0 - 170, w: 180, h: 170 };
  if (!pulling) return; // 휴지통은 티켓을 떼어 들고 있을 때만 (평소엔 티켓을 가리지 않게)
  // 휴지통 자리: 아래쪽을 어둡게 덮은 띠 위에 (뒤 티켓과 겹쳐 보이지 않게)
  noStroke();
  const ctx = drawingContext;
  const gr = ctx.createLinearGradient(0, H0 - 200, 0, H0);
  gr.addColorStop(0, "rgba(22,22,24,0)");
  gr.addColorStop(0.35, "rgba(22,22,24,0.92)");
  gr.addColorStop(1, "rgba(22,22,24,0.98)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, H0 - 200, TK.x - 40, 200);
  push();
  translate(cx, by);
  scale(s);
  const col = hot ? HEART : pulling ? C.paper : C.faint;
  noFill();
  stroke(col);
  strokeWeight(2.5);
  drawingContext.strokeStyle = col; // 위에서 실을 캔버스로 직접 그려서 p5가 색을 다시 안 넣는 경우가 있음
  drawingContext.lineWidth = 2.5;
  // 통
  quad(-26, -60, 26, -60, 20, 0, -20, 0);
  line(-9, -50, -7, -10);
  line(0, -50, 0, -10);
  line(9, -50, 7, -10);
  // 뚜껑 (위에 오면 열림)
  push();
  translate(-30, -66);
  rotate(hot ? -0.5 : 0);
  line(0, 0, 60, 0);
  rect(22, -7, 16, 7, 2);
  pop();
  noStroke();
  pop();
  if (pulling)
    say(
      hot ? "놓으면 폴더에서 빠져요" : "여기로 끌어다 버리기",
      cx,
      H0 - 4,
      12,
      col,
      CENTER,
      BASELINE,
      BODY,
      255,
      true,
    );
}

// ▶ drawCarry — 꾹 눌러 들고 있는 티켓: 원래 자리에서 실이 따라오고, 놓을 곳 안내
function drawCarry() {
  if (!g || g.mode !== "carry") return;
  const d = g.d;
  const acc = accentOf(d);
  const src = (L.minis || []).find((c) => c.d === d);
  const ctx = drawingContext;
  if (src) {
    const sx = src.x + Math.min(src.w, MW) / 2;
    const sy = src.y + Math.min(src.h, MH / 1.5) / 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = acc;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + g.cx) / 2, Math.max(sy, g.cy) + 70, g.cx, g.cy);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  push();
  translate(g.cx, g.cy);
  rotate(-0.07);
  drawMini(d, -48, -76, 96, 150, {});
  pop();
  const t = g.target;
  const msg = !t
    ? "다른 티켓 위에 놓으면 폴더로 이어져요"
    : t.f
      ? t.f.type === "new"
        ? "새 폴더 만들기"
        : `'${t.f.name}'에 넣기`
      : `'${t.d.title}'와 잇기`;
  const tw = textWidthOf(msg, 13, BODY, true) + 26;
  fill(C.paper);
  rect(g.cx - tw / 2, g.cy + 84, tw, 30, 15);
  say(msg, g.cx, g.cy + 99, 13, C.ink, CENTER, CENTER, BODY, 255, true);
}

/* =========================================================
   12. 알림 · 사용법
========================================================= */
// ▶ gone — 지울 때 알림 글: "나의 아저씨"를 삭제했습니다 (받침 있으면 '을', 없으면 '를')
function gone(name) {
  const c = name.charCodeAt(name.length - 1);
  const batchim =
    c >= 0xac00 && c <= 0xd7a3
      ? (c - 0xac00) % 28 !== 0
      : /[0-9lmnLMN]$/.test(name);
  return `"${name}"${batchim ? "을" : "를"} 삭제했습니다`;
}

// ▶ toast — 아래 알림 (undo를 주면 누를 때 되돌리기)
function toast(msg, undo) {
  toastBox = { msg, until: millis() + (undo ? 4500 : 2200), undo };
}

// ▶ toastRect — 알림 상자 위치
function toastRect() {
  if (!toastBox || millis() > toastBox.until) return null;
  const w = textWidthOf(toastBox.msg, 14, BODY) + (toastBox.undo ? 120 : 40);
  return { x: W0 / 2 - w / 2, y: H0 - 66, w, h: 44 };
}

// ▶ drawToast — 알림 그리기
function drawToast() {
  const r = toastRect();
  if (!r) return;
  noStroke();
  fill(0, 0, 0, 90);
  rect(r.x + 2, r.y + 4, r.w, r.h, 22);
  fill(C.paper);
  rect(r.x, r.y, r.w, r.h, 22);
  say(toastBox.msg, r.x + 20, r.y + r.h / 2, 14, C.ink, LEFT, CENTER, BODY);
  if (toastBox.undo)
    say(
      "되돌리기",
      r.x + r.w - 20,
      r.y + r.h / 2,
      14,
      "#C8352A",
      RIGHT,
      CENTER,
      BODY,
      255,
      true,
    );
}

// ▶ drawHelp — 시작 화면 겸 사용법: 무슨 앱인지 → 3단계로 쓰는 법 → 손동작 → 시작하기 (아무 데나 누르면 닫힘)
// 시작 화면: '쓰는 법'이 아니라 '어떤 앱인지' (쓰는 법은 바로 뒤 손가락 시연이 보여 줌)
const INTRO_STEPS = [
  [
    "티켓으로 모으기",
    "본 드라마가 한 장씩 쌓이는 관람 기록",
    [
      "영화관 티켓처럼 드라마도 한 장씩",
      "연도별 상자에 차곡차곡",
      "보고 싶은 드라마는 '예매'로 미리",
    ],
  ],
  [
    "회차마다 메모",
    "이 앱의 핵심 · 그때의 감정을 바로",
    [
      "몇 화가 제일 재밌었는지",
      "울었던 장면 · 명대사 한 줄",
      "다 보고 나면 한 줄 관람평",
    ],
  ],
  [
    "다시 볼 때 비교",
    "정주행할 때마다 달라지는 나",
    [
      "1회차 · 2회차 감상을 나란히",
      "그때는 몰랐던 장면이 보여요",
      "내 취향을 알고 비슷한 드라마 추천",
    ],
  ],
];
// ▶ 처음 시연 (tour) — 티켓 한 장으로 '찾기 → 발권 → 뒤집기 → 평점 → 관람평 → 회차 재미 → 회차 메모'를
//   손가락이 직접 해 보임. 진짜 티켓이 아니라 시연용 복사본이라 내 기록은 안 바뀜 · 아무 데나 톡 = 건너뛰기
let tour = null;
const TOUR_TITLE = "견우와 선녀";
const TOUR_POSTER = [
  "https://static.tvmaze.com/uploads/images/medium_portrait/591/1478354.jpg",
  "https://static.tvmaze.com/uploads/images/original_untouched/591/1478354.jpg",
]; // 시연용 포스터 (티켓 목록엔 없음 → 사람들이 직접 찾아 발권해 볼 수 있게)
const TOUR_STEPS = [
  // [시작 ms, 끝 ms, 왼쪽 큰 글자, 작은 설명]
  [0, 3600, "찾아서 발권", "위 검색창에 제목 → 톡 하면 티켓 한 장"],
  [3600, 5400, "톡 = 뒤집기", "앞면은 포스터 · 뒷면은 내 기록"],
  [5400, 7200, "별 = 평점", "별을 눌러 10점 만점으로"],
  [7200, 9800, "관람평 쓰기", "줄 노트를 톡 하고 그대로 쓰기"],
  [9800, 12600, "띠를 그어 회차 재미", "한 화 = 막대 하나 · 위아래로 그어요"],
  [12600, 15400, "꾹 = 그 화 메모", "명장면 · 명대사를 그 화에 남겨요"],
  [
    15400,
    99999,
    "이제 직접 해 보세요",
    "오른쪽 위 ? 를 누르면 다시 볼 수 있어요",
  ],
];
function startTour() {
  const real =
    data.dramas.find((q) => normTitle(q.title) === normTitle(TOUR_TITLE)) ||
    data.dramas.find((q) => q.poster);
  const base =
    real && normTitle(real.title) === normTitle(TOUR_TITLE)
      ? real
      : {
          title: TOUR_TITLE,
          en: "Head over Heels",
          year: "2025",
          network: "tvN",
          eps: 12,
          kind: "로맨스",
          poster: TOUR_POSTER[0],
          posterBig: TOUR_POSTER[1],
        };
  const d = makeDrama({
    title: base.title,
    en: base.en,
    year: base.year,
    network: base.network,
    eps: base.eps,
    kind: base.kind || "로맨스",
    poster: base.poster,
    posterBig: base.posterBig,
    tvId: base.tvId,
    info: base.info,
  });
  d.status = "watching";
  tour = { t0: millis(), st0: millis(), step: 0, d }; // step = 지금 단계 · 톡 할 때마다 다음 단계
  opened = false;
}
function endTour() {
  if (!tour) return;
  tour = null;
  seenOnce("tab-ticket"); // 티켓 탭 시연은 방금 본 걸로
}
// ▶ tourTap — 시연 중 톡: 건너뛰기 버튼 = 끝 · 그 밖 = 다음 단계 (마지막 단계면 끝)
function tourTap(e) {
  const p = pt(e);
  if (L.tourSkip && inRect(p, L.tourSkip)) return endTour();
  if (tour.step >= TOUR_STEPS.length - 1) return endTour();
  tour.step++;
  tour.st0 = millis();
}
function drawTour() {
  // 단계마다 그 단계 움직임만 재생하고 끝 장면에서 멈춰 기다림 (톡 = 다음)
  const [s0, s1] = TOUR_STEPS[tour.step];
  const dur = s1 > 90000 ? 1200 : s1 - s0;
  const local = millis() - tour.st0;
  const waiting = local >= dur;
  const e = s0 + Math.min(local, dur - 1);
  const d = tour.d;
  const ctx = drawingContext;
  const T = TK;
  noStroke();
  fill(12, 12, 14, 235 * span(e, 0, 300));
  rect(0, 0, W0, H0);

  // ── 시연용 티켓의 상태를 시간에 맞춰 바꿈 ──
  const typedQ = TOUR_TITLE.slice(
    0,
    Math.floor(constrain((e - 700) / 140, 0, TOUR_TITLE.length)),
  );
  const RATE_T = [5900, 6250, 6600, 6950];
  d.rating = RATE_T.filter((t) => e > t).length * 2 || null;
  const REV = "첫사랑 사수 로맨스. 설렘 그 자체!";
  d.review = REV.slice(
    0,
    Math.floor(constrain((e - 7900) / 85, 0, REV.length)),
  );
  const HS = [
    0.6,
    0.7,
    0.95,
    0.65,
    0.75,
    0.8,
    0.7,
    0.9,
    null,
    null,
    null,
    null,
  ];
  const dragT = constrain((e - 10300) / 1800, 0, 1); // 띠를 1화 → 8화로 긋기
  const reach = dragT * 8;
  d.scores = HS.map((v, i) => (v !== null && i < reach ? v : null));
  d.upTo = Math.ceil(Math.min(reach, 8));
  const MEMO = "옥상 장면 · 심장 터짐";
  const memoT = constrain((e - 13700) / 90, 0, MEMO.length);
  d.notes = memoT > 0 ? { 2: MEMO.slice(0, Math.floor(memoT)) } : {};

  // ── 오른쪽: 큰 티켓 (나타남 → 뒤집힘) ──
  const showT = span(e, 3000, 3600);
  const flip = span(e, 4500, 5100);
  const keep = { flipT, openT, L_eps: L.eps, L_ticket: L.ticket };
  if (showT > 0) {
    flipT = flip;
    openT = showT;
    ctx.save();
    ctx.globalAlpha = showT;
    const hitsBefore = L.hits.length;
    drawBigTicket(d);
    L.hits.length = hitsBefore; // 시연 티켓의 누를 자리는 버림
    ctx.restore();
    if (e > 13700 && e < 15400) drawEpTipFor(d, 2);
  }
  const strip = (L.eps || [])[0];
  flipT = keep.flipT;
  openT = keep.openT;

  // ── 왼쪽: 지금 단계 · 큰 글자 ──
  const si = TOUR_STEPS.findIndex(([a, b]) => e >= a && e < b);
  const [sa, , head, sub] = TOUR_STEPS[si];
  const la = span(e, sa, sa + 400);
  const LX = 120;
  ctx.save();
  ctx.globalAlpha = la;
  if (si < TOUR_STEPS.length - 1)
    say(
      `STEP ${si + 1} / ${TOUR_STEPS.length - 1}`,
      LX,
      300 + 10 * (1 - la),
      16,
      ACCENTS[(si + 6) % ACCENTS.length],
      LEFT,
      BASELINE,
      LAB,
    );
  say(head, LX, 350 + 10 * (1 - la), 44, C.paper, LEFT, BASELINE, DISP);
  say(sub, LX, 384 + 10 * (1 - la), 16, C.dim, LEFT, BASELINE, BODY);
  ctx.restore();
  // 단계 점
  TOUR_STEPS.slice(0, -1).forEach((_, k) => {
    fill(
      k === si
        ? C.paper
        : k < si
          ? "rgba(242,237,227,0.55)"
          : "rgba(242,237,227,0.18)",
    );
    rect(LX + k * 30, 420, 22, 4, 2);
  });

  // ── 1단계: 그려 둔 검색창에 제목이 쳐지고 → 결과 톡 ──
  const SB = { x: 260, y: 22, w: 440, h: 44 };
  if (e < 3600) {
    const a = 1 - span(e, 3200, 3600);
    ctx.save();
    ctx.globalAlpha = a;
    fill(C.paper);
    rect(SB.x, SB.y, SB.w, SB.h, 22);
    say(
      typedQ || "드라마 제목 · 영어 제목",
      SB.x + 20,
      SB.y + 28,
      15,
      C.ink,
      LEFT,
      BASELINE,
      BODY,
      typedQ ? 255 : 90,
    );
    if (Math.floor(e / 350) % 2 === 0 && typedQ.length < TOUR_TITLE.length) {
      fill(C.ink);
      rect(SB.x + 22 + textWidthOf(typedQ, 15, BODY), SB.y + 13, 1.5, 18);
    }
    const da = span(e, 2000, 2300);
    if (da > 0) {
      ctx.globalAlpha = a * da;
      fill("#26262B");
      rect(SB.x, SB.y + 52, SB.w, 76, 12);
      drawPoster(d, SB.x + 12, SB.y + 62, 40, 56, 4);
      say(
        TOUR_TITLE,
        SB.x + 64,
        SB.y + 86,
        16,
        C.paper,
        LEFT,
        BASELINE,
        BODY,
        255,
        true,
      );
      say(
        "2025 · tvN · 12부작 · 로맨스",
        SB.x + 64,
        SB.y + 108,
        12,
        C.dim,
        LEFT,
        BASELINE,
        BODY,
      );
      fill(C.paper);
      rect(SB.x + SB.w - 84, SB.y + 74, 70, 30, 15);
      say(
        "+ 발권",
        SB.x + SB.w - 49,
        SB.y + 94,
        13,
        C.ink,
        CENTER,
        BASELINE,
        BODY,
        255,
        true,
      );
    }
    ctx.restore();
  }

  // ── 손가락 길: [시각, x, y, 누름] 사이를 부드럽게 ──
  const tc = { x: T.x + T.w / 2, y: T.y + T.h * 0.42 };
  const star = (n) => ({
    x: T.x + T.w - 132 + Math.floor((n - 1) / 2) * 23 + 10,
    y: T.y + 160,
  });
  const paper = { x: T.x + 120, y: T.y + 290 };
  const bar = (i) =>
    strip
      ? { x: strip.bx + (i + 0.5) * strip.bw, y: strip.y + strip.barH * 0.55 }
      : tc;
  const KEYS = [
    [0, SB.x + 300, SB.y + 200, 0],
    [600, SB.x + 120, SB.y + 30, 0],
    [700, SB.x + 120, SB.y + 30, 1],
    [900, SB.x + 120, SB.y + 30, 0],
    [2300, SB.x + SB.w - 49, SB.y + 89, 0],
    [2600, SB.x + SB.w - 49, SB.y + 89, 1],
    [2800, SB.x + SB.w - 49, SB.y + 89, 0],
    [3900, tc.x, tc.y, 0],
    [4300, tc.x, tc.y, 1],
    [4500, tc.x, tc.y, 0],
    [5600, star(2).x, star(2).y, 0],
    ...RATE_T.flatMap((t, k) => [
      [t - 120, star(k * 2 + 2).x, star(k * 2 + 2).y, 0],
      [t, star(k * 2 + 2).x, star(k * 2 + 2).y, 1],
      [t + 120, star(k * 2 + 2).x, star(k * 2 + 2).y, 0],
    ]),
    [7500, paper.x, paper.y, 0],
    [7700, paper.x, paper.y, 1],
    [7850, paper.x, paper.y, 0],
    [9700, bar(0).x, bar(0).y + 20, 0],
    [10200, bar(0).x, bar(0).y, 1],
    [12100, bar(7).x, bar(7).y - 10, 1],
    [12300, bar(7).x, bar(7).y - 10, 0],
    [13000, bar(2).x, bar(2).y, 0],
    [13100, bar(2).x, bar(2).y, 2], // 2 = 꾹 (누른 채로)
    [13700, bar(2).x, bar(2).y, 2],
    [13800, bar(2).x, bar(2).y, 0],
    [15000, bar(2).x + 60, bar(2).y + 80, 0],
  ];
  if (e < 15400) {
    let k = KEYS.findIndex((q) => q[0] > e);
    if (k < 0) k = KEYS.length - 1;
    const A = KEYS[Math.max(0, k - 1)];
    const B = KEYS[k];
    const f = B[0] === A[0] ? 1 : ease((e - A[0]) / (B[0] - A[0]));
    const fx = lerp(A[1], B[1], f);
    const fy = lerp(A[2], B[2], f);
    const press = A[3] || (B[3] && f > 0.6) ? Math.max(A[3], B[3]) : 0;
    if (press === 2) {
      // 꾹: 누르는 동안 둥글게 차오르는 고리
      const hold = constrain((e - 13100) / 600, 0, 1);
      noFill();
      stroke(C.paper);
      strokeWeight(3);
      arc(fx, fy, 50, 50, -HALF_PI, -HALF_PI + TWO_PI * hold);
      noStroke();
    }
    const ap = span(e, 300, 600) * (1 - span(e, 15000, 15400));
    ctx.save();
    ctx.globalAlpha = ap;
    const fs = press ? 0.8 : 1;
    fill(0, 0, 0, 80);
    circle(fx + 3, fy + 6, 36 * fs);
    fill(255, 255, 255, 240);
    circle(fx, fy, 36 * fs);
    fill(ACCENTS[6]);
    circle(fx, fy, 12 * fs);
    ctx.restore();
  }

  // ── 끝: 시작하기 ──
  const ea = span(e, 15400, 15900);
  if (ea > 0) {
    ctx.save();
    ctx.globalAlpha = ea;
    fill(C.paper);
    rect(LX, 460, 200, 50, 25);
    say(
      "시작하기",
      LX + 100,
      491,
      17,
      C.ink,
      CENTER,
      BASELINE,
      BODY,
      255,
      true,
    );
    ctx.restore();
  } else if (waiting) {
    // 이 단계 움직임이 끝나면: 다음으로 넘기라는 안내 (천천히 깜빡)
    const blink = 150 + 105 * Math.sin(millis() * HINT_SPEED * 1.5);
    say(
      "톡 하면 다음  ›",
      LX,
      470 + 2 * Math.sin(millis() * HINT_SPEED * 1.5),
      15,
      C.paper,
      LEFT,
      BASELINE,
      BODY,
      blink,
      true,
    );
  }
  // 건너뛰기 (오른쪽 위)
  const sk = "건너뛰기  ›";
  const skw = textWidthOf(sk, 13, BODY, true) + 28;
  fill(255, 255, 255, 22);
  rect(W0 - 40 - skw, 26, skw, 32, 16);
  say(sk, W0 - 40 - skw / 2, 47, 13, C.dim, CENTER, BASELINE, BODY, 255, true);
  L.tourSkip = { x: W0 - 40 - skw, y: 20, w: skw, h: 44 };
}

// ▶ drawEpTipFor — 시연용: 회차 띠 위 메모 말풍선 (drawEpTip과 같은 모양)
function drawEpTipFor(d, i) {
  drawEpTip(d, i);
}

// ▶ drawHelpMenu — ? 아래 작은 메뉴: 무엇을 다시 볼지 (처음 화면 · 티켓 쓰는 법 · 감상 · 취향 · 폴더)
const HELP_ITEMS = [
  [
    "처음 화면",
    "무슨 앱인지",
    () => {
      helpOpen = true;
      helpOnly = true; // 처음 화면만 (닫으면 시연 없이 바로)
    },
  ],
  [
    "티켓 쓰는 법",
    "찾기 → 평점 → 관람평 → 회차 메모",
    () => {
      setView("ticket");
      startTour();
    },
  ],
  ["감상", "관람평 모아 보기", () => showTabDemo("reviews")],
  ["취향", "내 취향 · 추천", () => showTabDemo("taste")],
  ["폴더", "나만의 묶음", () => showTabDemo("folders")],
  [
    "내 일지 공유하기",
    "내 티켓 · 관람평 · 메모가 담긴 파일 하나로 보내기",
    () => exportForShare(),
  ],
];
// ▶ exportSeed — 지금 일지를 seed.js 파일로 내려받기 (시연용 폴더에 index.html · sketch.js와 같이 넣어 보내면
//   다른 컴퓨터에서도 처음 열 때 이 티켓들로 시작함 · 그 사람이 쓴 건 그 컴퓨터에 따로 저장)
function exportSeed() {
  const copy = JSON.parse(JSON.stringify(data));
  copy.sample = false;
  const txt =
    "// 정주행 일지 · 내 일지 내보내기 (" +
    new Date().toLocaleString("ko-KR") +
    ")\nwindow.SEED = " +
    JSON.stringify(copy) +
    ";\n";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([txt], { type: "text/javascript" }));
  a.download = "seed.js";
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast(
    `티켓 ${copy.dramas.length}장을 seed.js로 저장했어요 · 시연용 폴더에 넣어 보내세요`,
  );
}
// ▶ exportForShare — 다른 사람에게 보낼 파일 하나 만들기: 지금 화면(index.html) + 코드(sketch.js) + 내 티켓 전부를
//   html 한 파일에 담아 내려받음. 받은 사람은 그 파일만 열면 내 티켓으로 시작 (그 사람이 쓴 건 그 컴퓨터에 따로 저장)
async function exportForShare() {
  // 예전엔 'index.html' · 'sketch.js'를 주소로 다시 받아 와서, 링크 끝에 / 가 없거나(…/Drama_Diary)
  // 공유받은 파일 · 더블클릭한 파일에서 열면 엉뚱한 파일을 받거나 실패했음 → 지금 열린 페이지에서 직접 꺼냄
  let code = null;
  // 1) 코드: 이 페이지에 코드가 통째로 들어 있으면(공유받은 파일) 그걸 그대로
  const inl = [...document.scripts].find(
    (sc) => !sc.src && sc.textContent.includes("const STARTER_ID"),
  );
  if (inl) code = inl.textContent;
  else {
    // 2) sketch.js로 불러온 경우: 그 파일의 정확한 주소로 다시 읽기 (링크 끝 / 상관없음)
    const ext = [...document.scripts].find((sc) =>
      /sketch\.js(\?|$)/.test(sc.src),
    );
    try {
      if (ext)
        code = await fetch(ext.src).then((r) => (r.ok ? r.text() : null));
    } catch (e) {
      code = null;
    }
  }
  if (!code || !code.includes("function exportForShare")) {
    return toast(
      location.protocol === "file:"
        ? "더블클릭으로 연 파일에선 못 만들어요 · 127.0.0.1이나 링크(GitHub)로 열어서 눌러 주세요"
        : "파일을 못 만들었어요 · 새로고침한 뒤 다시 눌러 주세요",
    );
  }
  // 화면 모양(CSS): 지금 페이지의 index.html 스타일을 그대로
  const css = [...document.querySelectorAll("style")]
    .filter((st) => !st.id) // (앱이 나중에 붙인 스타일은 빼고 index.html 것만)
    .map((st) => st.textContent)
    .join("\n");
  const seed = JSON.parse(JSON.stringify(data));
  seed.sample = false;
  const safe = (t) => t.replace(/<\/script/gi, "<\\/script");
  const shareSlot = "s" + Date.now().toString(36); // 받을 때마다 새 칸 → 예전에 받은 것과 안 섞임
  const code2 = code.replace(
    /^const SLOT = "[^"]*";.*$/m,
    `const SLOT = "${shareSlot}"; // 공유받은 파일 (보낸 사람 티켓으로 시작)`,
  );
  const out =
    '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8" />\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "<title>정주행 일지</title>\n" +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Bebas+Neue&family=Noto+Sans+KR:wght@400;500;700&display=swap" />\n' +
    "<style>\n" +
    css +
    "\n</style>\n" +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>\n' +
    "<script>window.SEED = " +
    safe(JSON.stringify(seed)) +
    ";</script>\n" +
    "<script>\n" +
    safe(code2) +
    "\n</script>\n" +
    "</head>\n<body><main></main></body>\n</html>\n";
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([out], { type: "text/html" }));
    a.download = "정주행일지.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast(
      `티켓 ${seed.dramas.length}장이 담긴 공유 파일 '정주행일지.html'을 저장했어요`,
    );
  } catch (e) {
    toast("파일을 못 만들었어요 · 다른 브라우저(크롬)에서 다시 눌러 주세요");
  }
}
function showTabDemo(key) {
  closePanel();
  setView(key);
  tabTip = { key, t0: millis() };
}
function drawHelpMenu() {
  // 메뉴 폭 = 가장 긴 글에 맞춤 (설명이 오른쪽에서 잘리지 않게)
  const w = Math.max(
    260,
    ...HELP_ITEMS.map(
      ([t, sub]) =>
        Math.max(textWidthOf(t, 15, BODY, true), textWidthOf(sub, 11, BODY)) +
        62,
    ),
  );
  const rh = 54;
  const x = 1242 - w;
  const y = 70;
  const h = HELP_ITEMS.length * rh + 44;
  noStroke();
  fill(0, 0, 0, 120);
  rect(x + 4, y + 8, w, h, 14);
  fill(C.paper);
  rect(x, y, w, h, 14);
  triangle(1224 - 8, y + 1, 1224 + 8, y + 1, 1224, y - 9);
  say(
    "무엇을 다시 볼까요?",
    x + 18,
    y + 28,
    13,
    C.ink,
    LEFT,
    BASELINE,
    BODY,
    150,
    true,
  );
  L.helpItems = [];
  HELP_ITEMS.forEach(([t, sub, run], k) => {
    const ry = y + 40 + k * rh;
    const r = { x: x + 8, y: ry, w: w - 16, h: rh - 6 };
    if (inRect(hoverP, r)) {
      fill(23, 23, 26, 16);
      rect(r.x, r.y, r.w, r.h, 10);
    }
    fill(ACCENTS[[1, 6, 6, 2, 3, 0][k] || 0]);
    circle(x + 26, ry + 24, 10);
    say(t, x + 42, ry + 22, 15, C.ink, LEFT, BASELINE, BODY, 255, true);
    say(sub, x + 42, ry + 40, 11, C.ink, LEFT, BASELINE, BODY, 130);
    L.helpItems.push({ ...r, run });
  });
}

let helpT0 = 0; // 시작 화면이 열린 시각 (모션 기준)
const ease = (v) => 1 - Math.pow(1 - constrain(v, 0, 1), 3); // 빠르게 시작해서 부드럽게 멈춤
const span = (t, a, b) => ease((t - a) / (b - a)); // t가 a→b 사이에서 0→1
// 시작 화면: 무슨 앱인지 딱 세 줄
const INTRO_LINES = [
  "드라마 한 편 = 티켓",
  "보면서 회차마다 메모하고",
  "다시 볼 때를 위해 지금의 감정을 입력해요",
];
function drawHelp() {
  if (!helpT0) helpT0 = millis();
  const e = millis() - helpT0;
  const ctx = drawingContext;
  noStroke();
  fill(14, 14, 16, 246 * span(e, 0, 300));
  rect(0, 0, W0, H0);
  const cx = W0 / 2;

  // 제목
  const a0 = span(e, 100, 700);
  ctx.save();
  ctx.globalAlpha = a0;
  ctx.translate(0, 18 * (1 - a0));
  say(
    "드라마 감상 메모장",
    cx,
    196,
    15,
    ACCENTS[1],
    CENTER,
    BASELINE,
    BODY,
    255,
    true,
  );
  say("정주행 일지", cx, 266, 68, C.paper, CENTER, BASELINE, DISP);
  ctx.restore();

  // 세 줄: 하나씩 떠오름 (가운데 줄 = 이 앱의 핵심이라 색)
  INTRO_LINES.forEach((ln, k) => {
    const a = span(e, 600 + k * 350, 1100 + k * 350);
    ctx.save();
    ctx.globalAlpha = a;
    say(
      ln,
      cx,
      360 + k * 46 + 12 * (1 - a),
      24,
      k === 1 ? ACCENTS[1] : C.paper,
      CENTER,
      BASELINE,
      BODY,
      255,
      true,
    );
    ctx.restore();
  });

  // 시작하기
  const ab = span(e, 1800, 2300);
  const breathe =
    1 + 0.025 * Math.sin((e - 2300) * HINT_SPEED) * (e > 2300 ? 1 : 0);
  const bw = 220;
  const by = 510;
  ctx.save();
  ctx.globalAlpha = ab;
  ctx.translate(cx, by + 25);
  ctx.scale(breathe * (0.9 + 0.1 * ab), breathe * (0.9 + 0.1 * ab));
  ctx.translate(-cx, -(by + 25));
  fill(C.paper);
  rect(cx - bw / 2, by, bw, 50, 25);
  say("시작하기", cx, by + 31, 17, C.ink, CENTER, BASELINE, BODY, 255, true);
  ctx.restore();
}

// ▶ introPic — 시작 화면 단계별 작은 그림 · t = 반복 안에서 지난 시간(0~4200ms)
//   0 발권: 제목이 타자로 쳐지고 → 발권 버튼 눌림 → 티켓이 튀어나옴
//   1 뒷면 메모: 별이 하나씩 → 관람평이 써지고 → 회차 막대가 차례로 자람
//   2 회차 비교: 1회차 막대 위로 2회차 막대가 자라고 → 평점 변화가 뜸
function introPic(k, x, y, w, h, acc, t) {
  const ink = C.ink;
  const ctx = drawingContext;
  const out = 1 - span(t, 3800, 4150); // 반복 끝에서 살짝 사라졌다가 다시
  noStroke();
  if (k === 0) {
    // 티켓이 한 장씩 툭툭 쌓임 (연도 상자 위로)
    const tw = 62;
    const th = 82;
    const cols = [ACCENTS[6], ACCENTS[1], ACCENTS[5], ACCENTS[2]];
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 10, y - 4, w + 20, h + 8);
    ctx.clip();
    for (let i = 0; i < 4; i++) {
      const pop = span(t, 200 + i * 450, 650 + i * 450) * out;
      if (pop <= 0) continue;
      const tx = x + 18 + i * (tw - 4);
      const ty = y + 14 + (i % 2) * 6 + 70 * (1 - pop);
      ctx.save();
      ctx.globalAlpha = pop;
      ctx.translate(tx + tw / 2, ty + th / 2);
      ctx.rotate((i - 1.5) * 0.07);
      ctx.translate(-tw / 2, -th / 2);
      fill(0, 0, 0, 40);
      rect(3, 4, tw, th, 6);
      ticketPath(0, 0, tw, th, th - 22, 6, 4);
      ctx.fillStyle = "#FBF8F1";
      ctx.fill();
      fill(cols[i]);
      rect(5, 5, tw - 10, th - 32, 3);
      fill(23, 23, 26, 60);
      rect(8, th - 15, tw * 0.5, 3, 1.5);
      ctx.restore();
    }
    // 아래: 연도 상자
    fill("#9A968F");
    rect(x + 8, y + h - 26, w - 16, 30, 4);
    fill(C.paper);
    rect(x + w / 2 - 30, y + h - 20, 60, 18, 3);
    say("2025", x + w / 2, y + h - 7, 12, C.ink, CENTER, BASELINE, LAB);
    ctx.restore();
  } else if (k === 1) {
    const stars = Math.floor(constrain(t / 180, 0, 8)); // 반 칸씩 8까지
    ctx.save();
    ctx.globalAlpha = out;
    drawStars(x, y + 10, 16, stars, acc);
    say(`${stars || "?"}/10`, x + w, y + 16, 16, ink, RIGHT, BASELINE, LAB);
    ctx.restore();
    fill("#FBF8F1");
    rect(x, y + 28, w, 50, 6);
    stroke("#DCD3C2");
    strokeWeight(1);
    line(x + 8, y + 52, x + w - 8, y + 52);
    line(x + 8, y + 74, x + w - 8, y + 74);
    noStroke();
    const memo = "우산 장면 = 레전드";
    const typed = memo.slice(
      0,
      Math.floor(constrain((t - 1500) / 90, 0, memo.length)),
    );
    ctx.save();
    ctx.globalAlpha = out;
    say(typed, x + 10, y + 48, 13, ink, LEFT, BASELINE, BODY);
    ctx.restore();
    const n = 16;
    const bw = w / n;
    const hs = [
      0.5, 0.6, 0.45, 0.55, 0.5, 0.7, 0.65, 0.95, 0.6, 0.55, 0.7, 0.8, 0, 0, 0,
      0,
    ];
    const by = y + h;
    hs.forEach((v, i) => {
      const grow = v ? span(t, 2200 + i * 80, 2550 + i * 80) * out : 0;
      const hh = v && grow > 0 ? v * 36 * grow : 3;
      fill(v && grow > 0 ? (i === 7 ? acc : ink) : "rgba(23,23,26,0.18)");
      rect(x + i * bw + bw * 0.22, by - hh, bw * 0.56, hh, 1.5);
    });
    const dot = span(t, 3200, 3400) * out; // 8화 메모 점이 톡
    if (dot > 0) {
      fill(acc);
      circle(
        x + 7.5 * bw,
        by - 36 - 8,
        6 * dot + 3 * Math.sin(Math.min(1, (t - 3200) / 200) * PI),
      );
    }
  } else {
    const rows = [
      [
        "1회차",
        [
          0.5, 0.6, 0.4, 0.55, 0.5, 0.6, 0.7, 0.8, 0.6, 0.5, 0.6, 0.7, 0.75,
          0.6, 0.8, 0.9,
        ],
      ],
      [
        "2회차",
        [0.6, 0.7, 0.5, 0.7, 0.6, 0.8, 0.9, 0.95, 0.7, 0, 0, 0, 0, 0, 0, 0],
      ],
    ];
    rows.forEach(([lab, hs], r) => {
      const ry = y + 6 + r * 58;
      say(lab, x, ry + 30, 13, ink, LEFT, BASELINE, BODY, r ? 255 : 140, true);
      const bx = x + 52;
      const bw = (w - 52) / hs.length;
      hs.forEach((v, i) => {
        // 1회차는 그대로 · 2회차는 왼쪽부터 차례로 자라남
        const grow = r ? span(t, 300 + i * 150, 650 + i * 150) * out : 1;
        const hh = v && grow > 0 ? v * 38 * grow : 3;
        const c = color(
          v && grow > 0 ? (r ? acc : ink) : "rgba(23,23,26,0.18)",
        );
        if (v && grow > 0 && !r) c.setAlpha(0.35 * 255);
        fill(c);
        rect(bx + i * bw + bw * 0.2, ry + 40 - hh, bw * 0.6, hh, 1.5);
      });
    });
    const sh = span(t, 1900, 2300) * out; // 평점 변화가 마지막에
    ctx.save();
    ctx.globalAlpha = sh;
    ctx.translate(0, 6 * (1 - sh));
    say(
      "★7 → ★10  +3",
      x + w,
      y + h,
      13,
      acc,
      RIGHT,
      BASELINE,
      BODY,
      255,
      true,
    );
    ctx.restore();
  }
}

/* =========================================================
   13. 그리기 도우미 — 글자 · 별 · 하트 · 티켓 모양 · 절취선 · 바코드
========================================================= */
// ▶ say — 글자 한 줄: say(글자, x, y, 크기, 색, 가로정렬, 세로정렬, 글꼴, 투명도, 굵게)
function say(
  str,
  x,
  y,
  size,
  col,
  align = LEFT,
  vAlign = BASELINE,
  font = BODY,
  alpha = 255,
  bold = false,
) {
  [font, size, bold] = fixHangul(str, font, size, bold);
  noStroke();
  const c = color(col);
  c.setAlpha(alpha);
  fill(c);
  drawingContext.fillStyle = c.toString(); // 캔버스로 직접 칠한 뒤에도 글자 색이 확실히 들어가게
  textFont(font);
  textSize(size);
  textAlign(align, vAlign);
  textStyle(bold ? BOLD : NORMAL);
  text(str, x, y);
  textStyle(NORMAL);
}

// ▶ textWidthOf — 그 글꼴·크기로 쓴 글자의 너비
// ▶ fixHangul — Bebas Neue(라벨 글꼴)에는 한글이 없어서 "1회차"처럼 섞이면 숫자만 Bebas · 한글은 다른 글꼴로 따로 놀아 어색함
//   → 한글이 들어간 라벨은 본문 글꼴 굵게, 크기는 살짝 줄여서 (Bebas가 키가 커서)
function fixHangul(str, font, size, bold) {
  if (font === LAB && /[가-힣]/.test(String(str)))
    return [BODY, size * 0.8, true];
  return [font, size, bold];
}
function textWidthOf(s, size, font = BODY, bold = false) {
  [font, size, bold] = fixHangul(s, font, size, bold);
  textFont(font);
  textSize(size);
  textStyle(bold ? BOLD : NORMAL);
  const w = textWidth(s);
  textStyle(NORMAL);
  return w;
}

// ▶ fitStr — 너비 maxW를 넘으면 뒤를 잘라 … 붙이기
function fitStr(s, maxW, size, font = BODY, bold = false) {
  if (textWidthOf(s, size, font, bold) <= maxW) return s;
  let t = s;
  while (t.length > 1 && textWidthOf(t + "…", size, font, bold) > maxW)
    t = t.slice(0, -1);
  return t + "…";
}

// ▶ wrapStr — 너비 maxW에 맞춰 여러 줄로 나누기 (띄어쓰기 기준, 너무 길면 글자 기준)
function wrapStr(s, maxW, size, font) {
  const lines = [];
  let cur = "";
  for (const wd of s.split(" ")) {
    const t = cur ? cur + " " + wd : wd;
    if (textWidthOf(t, size, font) <= maxW) cur = t;
    else {
      if (cur) lines.push(cur);
      cur = wd;
      while (textWidthOf(cur, size, font) > maxW && cur.length > 1) {
        let k = cur.length - 1;
        while (k > 1 && textWidthOf(cur.slice(0, k), size, font) > maxW) k--;
        lines.push(cur.slice(0, k));
        cur = cur.slice(k);
      }
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ▶ drawStars — 별 다섯 개로 10점 만점 보여 주기 (홀수 점수는 반 별)
function drawStars(x, y, size, rating, col) {
  for (let k = 0; k < 5; k++) {
    const cx = x + k * (size + 3) + size / 2;
    const v = rating - k * 2; // 이 별이 채워질 양 (2 = 꽉, 1 = 반)
    star(cx, y, size / 2, false, col);
    if (v >= 2) star(cx, y, size / 2, true, col);
    else if (v === 1) {
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.rect(cx - size / 2, y - size / 2, size / 2, size);
      drawingContext.clip();
      star(cx, y, size / 2, true, col);
      drawingContext.restore();
    }
  }
}

// ▶ star — 별 하나 (filled = 채움 / 테두리만)
function star(cx, cy, r, filled, col) {
  if (filled) {
    noStroke();
    fill(col);
  } else {
    noFill();
    stroke(col);
    strokeWeight(1.2);
  }
  beginShape();
  for (let k = 0; k < 10; k++) {
    const a = -HALF_PI + (k * PI) / 5;
    const rr = k % 2 ? r * 0.45 : r;
    vertex(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  endShape(CLOSE);
  noStroke();
}

// ▶ heart — 하트 하나 (캔버스 곡선으로 직접 그림 — p5 1.x · 2.x 둘 다 같은 모양)
function heart(x, y, s, filled, col) {
  const ctx = drawingContext;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.42);
  ctx.bezierCurveTo(
    x - s * 0.95,
    y - s * 0.12,
    x - s * 0.42,
    y - s * 0.8,
    x,
    y - s * 0.3,
  );
  ctx.bezierCurveTo(
    x + s * 0.42,
    y - s * 0.8,
    x + s * 0.95,
    y - s * 0.12,
    x,
    y + s * 0.42,
  );
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = col;
    ctx.fill();
  } else {
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1.5, s * 0.12);
    ctx.stroke();
  }
}

// ▶ ticketPath — 티켓 모양 길: 둥근 모서리 + 절취선(cy) 양쪽에 반원 홈 (채우기·테두리는 부른 쪽에서)
function ticketPath(x, y, w, h, cy, r, nr) {
  const ctx = drawingContext;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  if (nr) {
    ctx.lineTo(x + w, y + cy - nr);
    ctx.arc(x + w, y + cy, nr, -Math.PI / 2, Math.PI / 2, true);
  }
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  if (nr) {
    ctx.lineTo(x, y + cy + nr);
    ctx.arc(x, y + cy, nr, Math.PI / 2, -Math.PI / 2, true);
  }
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ▶ ticketPathSide — 가로로 누운 작은 티켓(취향 그래프 한 칸): 왼쪽 · 오른쪽 끝에 홈
function ticketPathSide(x, y, w, h) {
  const ctx = drawingContext;
  const nr = Math.min(4, h / 3);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h / 2 - nr);
  ctx.arc(x + w, y + h / 2, nr, -Math.PI / 2, Math.PI / 2, true);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + h / 2 + nr);
  ctx.arc(x, y + h / 2, nr, Math.PI / 2, -Math.PI / 2, true);
  ctx.closePath();
}

// ▶ perforation — 절취선 (점선)
function perforation(x, y, w) {
  const ctx = drawingContext;
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(23,23,26,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ▶ scoreBarcode — 회차별 재미 막대: 한 화 = 막대 하나, 높이 = 그 화 재미
//   아직 안 본 화는 짧은 회색 · 가장 재밌던 화는 대표색
//   o = { holding(꾹 누르고 있는 화), prev(지난 감상들 회차별 평균 → 점선) }
function scoreBarcode(d, x, y, w, h, acc, o = {}) {
  const ctx = drawingContext;
  const bw = w / d.eps;
  const pk = peaks(d);
  noStroke();
  for (let i = 0; i < d.eps; i++) {
    const v = d.scores[i];
    const seen = i < d.upTo;
    const hh = seen ? (v === null ? h * 0.12 : h * v) : h * 0.08;
    if (i === o.holding) {
      fill(23, 23, 26, 30);
      rect(x + i * bw, y - 2, bw, h + 4);
    }
    const bwid = Math.max(2, bw * 0.55);
    // 지금 회차에 아직 평이 없으면: 지난 회차 막대를 흐리게 (재시청 중에도 그래프가 비지 않게)
    const gv =
      o.ghost && (v === null || v === undefined) ? o.ghost.scores[i] : null;
    if (gv !== null && gv !== undefined) {
      fill(23, 23, 26, 70);
      rect(x + i * bw + (bw - bwid) / 2, y + h - h * gv, bwid, h * gv, 1.5);
      if (d.notes[i] && !o.noDots) {
        fill(acc);
        circle(x + i * bw + bw / 2, y - 6, 4);
      }
      continue;
    }
    fill(
      !seen || v === null
        ? "rgba(23,23,26,0.18)"
        : pk.includes(i)
          ? acc
          : C.ink,
    );
    if (hh > 0) rect(x + i * bw + (bw - bwid) / 2, y + h - hh, bwid, hh, 1.5);
    if (d.notes[i] && !o.noDots) {
      fill(acc);
      circle(x + i * bw + bw / 2, y - 6, 4);
    }
  }
  if (o.prev) {
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = acc;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < d.eps; i++) {
      const v = o.prev.scores[i];
      if (v === null || v === undefined) continue;
      const px = x + i * bw + bw / 2;
      const py = y + h * (1 - v);
      if (started) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
      started = true;
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/* =========================================================
   14. 터치 제스처 — onDown(누름) → onMove(움직임) → onUp(뗌, 여기서 판단)
========================================================= */
// ▶ pt — 화면 좌표 → 1280×800 그림 좌표
function pt(e) {
  const r = cnv.elt.getBoundingClientRect();
  return { x: (e.clientX - r.left - OX) / K, y: (e.clientY - r.top - OY) / K };
}

// ▶ inRect — 점이 사각형 안에 있는지
function inRect(p, r) {
  return r && p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
}

// ▶ barAt — 회차 막대에서 누른 자리 → { R(줄), i(회차, 0부터), label(번호 줄을 눌렀는지) } (막대 밖이면 null)
function barAt(p) {
  for (const R of L.eps || []) {
    if (
      p.y < R.y - 4 ||
      p.y > R.y + R.h ||
      p.x < R.bx ||
      p.x > R.bx + R.n * R.bw
    )
      continue;
    const k = constrain(Math.floor((p.x - R.bx) / R.bw), 0, R.n - 1);
    return { R, i: R.first + k, label: p.y > R.y + R.barH + 6 };
  }
  return null;
}

// ▶ onWheel — 휠: 티켓 벽 스크롤 · 연도별에서는 다른 해 · 폴더 스크롤
function onWheel(e) {
  const p = pt(e);
  // 큰 티켓이 열려 있어도, 커서가 티켓 바깥(왼쪽 상자 · 폴더 쪽)에 있으면 그쪽이 스크롤됨
  const offTicket = !opened || !L.ticket || p.x < L.ticket.x - 60;
  if (panel) return; // (가운데 창이 떠 있을 땐 그 창이 스크롤)
  if (view === "ticket" && offTicket) rackScroll += e.deltaY / K;
  else if (view === "folders" && !folderSel && offTicket)
    folderScroll += e.deltaY / K;
  else if (view === "folders" && folderSel && offTicket)
    openScroll += e.deltaY / K;
  else if (view === "taste") tasteScroll += e.deltaY / K;
  else if (view === "reviews") reviewScroll += e.deltaY / K;
  e.preventDefault();
}

// ▶ onDown — 누른 순간: 어디(꽂이 · 큰 티켓 · 자세히 · 연도별 · 취향 · 폴더)를 눌렀는지 기록
function onDown(e) {
  if (panel) return;
  if (tour) return tourTap(e); // 시연 중 톡 = 다음 단계 · 건너뛰기 버튼 = 끝 (아래 화면은 안 눌림)
  if (inline) return closeInline(true); // 바로 고치던 칸이 있으면 그 톡은 '저장'으로만 씀
  hideDrop();
  if (document.activeElement === ui.input) ui.input.blur();
  const p = pt(e);
  cnv.elt.setPointerCapture(e.pointerId);
  g = {
    sx: p.x,
    sy: p.y,
    lx: p.x,
    ly: p.y,
    cx: p.x,
    cy: p.y,
    t: millis(),
    path: 0,
    maxDist: 0,
    turns: 0,
    dirX: 0,
    swingStart: p.x,
    mode: null, // null | paint(막대 긋기) | scroll(꽂이) | fscroll(폴더) | carry(티켓 들기)
    where: null,
    d: null,
    chart: false,
    idx: -1,
    lastIdx: -1,
    startScroll: rackScroll,
    startF: folderScroll,
    startT: tasteScroll,
    startO: openScroll,
    startR: reviewScroll,
    target: null,
  };
  if ((view === "ticket" || view === "folders") && opened) {
    if (!inRect(p, L.ticket)) {
      const onBtn =
        inRect(p, L.closeBtn) ||
        L.hits.some(
          (q) =>
            (q.act === "link" || q.act === "del" || q.act === "reset") &&
            inRect(p, q),
        );
      if (onBtn) {
        g.d = selected();
        return (g.where = "overlay");
      }
      opened = false; // 티켓 밖을 누르면 닫히고, 누른 곳(상자 · 폴더)은 원래대로 동작
      flipT = flipTo = 0;
    }
  }
  if ((view === "ticket" || view === "folders") && opened) {
    g.d = selected();
    g.where = "ticket";
    const b = barAt(p);
    if (b) {
      g.chart = true;
      g.row = b.R;
      g.idx = b.i;
    }
    return;
  }
  if (view === "ticket") {
    if (!inRect(p, WALL)) return;
    g.where = "rack";
    if (drawerYr) return; // 서랍이 열려 있으면 뒤의 티켓은 안 잡음
    const c = (L.minis || []).find((q) => inRect(p, q));
    if (c) {
      g.d = c.d;
      peekId = c.d.id;
    }
    return;
  }
  if (inRect(p, AREA)) {
    g.where = view;
    if (view === "folders") {
      const m = (L.members || []).find((q) => inRect(p, q));
      if (m) g.d = m.d;
    }
  }
}

// ▶ checkHold — 매 프레임: 꾹 누르고 있는지 (회차 막대 = 그 화 메모 / 꽂이 티켓 = 들기)
function checkHold() {
  if (!g || g.mode || g.path > 6 || millis() - g.t < HOLD_MS) return;
  if (g.chart) {
    const d = g.d;
    const i = g.idx;
    g = null;
    if (navigator.vibrate) navigator.vibrate(12);
    openNote(d, i);
  }
  // (티켓 벽에서 꾹 → 끌어다 다른 티켓에 놓아 잇는 기능은 뺌 · 폴더 넣기는 폴더의 + 칸으로)
}

// ▶ dropTarget — 들고 있는 티켓을 놓을 곳: 꽂이의 다른 티켓 / 폴더 칸 / 연 폴더
function dropTarget(p, d) {
  const m = (L.minis || []).find((q) => q.d !== d && inRect(p, q));
  if (m) return { d: m.d };
  if (view === "folders") {
    const t = (L.tiles || []).find((q) => inRect(p, q));
    if (t) return { f: t.f };
    if (L.folderDrop && inRect(p, L.folderDrop)) return { f: L.folderDrop.f };
  }
  return null;
}

// ▶ onMove — 움직이는 동안: 들기 / 막대 긋기 / 스크롤 / 지그재그 세기
let hoverX = null;
let hoverEp = null; // 큰 티켓 뒷면 회차 띠 위에 커서가 있는 화 { id, i }
let hoverP = { x: -1, y: -1 }; // 커서 위치 (그림 좌표)
function onMove(e) {
  hoverP = pt(e);
  if (!g) {
    // 큰 티켓 뒷면 회차 띠에 커서를 대면 그 화 메모 미리보기
    hoverEp = null;
    if (opened && flipT > 0.9 && (view === "ticket" || view === "folders")) {
      const b = barAt(pt(e));
      if (b && selected()) hoverEp = { id: selected().id, i: b.i };
    }
    // 그냥 지나가기만 해도 폴더 속 티켓이 툭툭 흔들림
    const p = pt(e);
    if (view === "folders" && folderSel && hoverX !== null) {
      const m = (L.members || []).find((q) => inRect(p, q));
      if (m) kick(m.d, constrain((p.x - hoverX) * 0.0004, -0.004, 0.004));
    }
    hoverX = p.x;
    if (view === "ticket" && !opened && !drawerYr) {
      const m = (L.minis || []).find((q) => inRect(p, q));
      if (m) peekId = m.d.id;
    }
    return;
  }
  const p = pt(e);
  const dx = p.x - g.lx;
  g.path += Math.hypot(dx, p.y - g.ly);
  g.maxDist = Math.max(g.maxDist, Math.hypot(p.x - g.sx, p.y - g.sy));
  if (Math.abs(dx) > 2) {
    const dir = Math.sign(dx);
    if (g.dirX && dir !== g.dirX && Math.abs(p.x - g.swingStart) > 14) {
      g.turns++;
      g.swingStart = p.x;
    }
    g.dirX = dir;
  }
  g.lx = p.x;
  g.ly = p.y;
  g.cx = p.x;
  g.cy = p.y;
  if (g.mode === "carry") {
    g.target = dropTarget(p, g.d);
    return;
  }
  if (g.chart && !g.mode && g.path > 6) {
    g.mode = "paint";
    paintAt(g.d, g.row, g.sx, g.sy);
  }
  if (g.mode === "paint") return paintAt(g.d, g.row, p.x, p.y);
  const vert =
    Math.abs(p.y - g.sy) > 10 &&
    Math.abs(p.y - g.sy) > Math.abs(p.x - g.sx) * 1.2;
  if (g.where === "rack" && !g.mode && vert) g.mode = "scroll";
  if (g.where === "folders" && !folderSel && !g.mode && vert)
    g.mode = "fscroll";
  if (g.mode === "scroll") rackScroll = g.startScroll - (p.y - g.sy);
  if (g.mode === "fscroll") folderScroll = g.startF - (p.y - g.sy);
  if (g.where === "taste" && !g.mode && vert) g.mode = "tscroll";
  if (g.where === "folders" && folderSel && !g.d && !g.mode && vert)
    g.mode = "oscroll";
  if (g.mode === "oscroll") openScroll = g.startO - (p.y - g.sy);
  if (g.where === "reviews" && !g.mode && vert) g.mode = "rscroll";
  if (g.mode === "tscroll") tasteScroll = g.startT - (p.y - g.sy);
  if (g.mode === "rscroll") reviewScroll = g.startR - (p.y - g.sy);
  // 폴더 속 티켓을 끌면 집게에서 떼어 냄 (손가락 움직임 따라 흔들림)
  if (g.where === "folders" && folderSel && g.d && !g.mode && g.path > 10)
    g.mode = "unpin";
  if (g.mode === "unpin") kick(g.d, constrain(-dx * 0.0015, -0.02, 0.02));
}

// ▶ onUp — 뗀 순간: 무슨 동작이었는지 결정
function onUp(e) {
  if (!g) return;
  const p = pt(e);
  const G = g;
  g = null;
  const isTap = G.path < 8 && millis() - G.t < HOLD_MS;
  const zigzag = G.turns >= ZIGZAG_TURNS && G.maxDist >= ZIGZAG_MIN;
  const dx = p.x - G.sx;
  const swipe =
    !isTap &&
    !zigzag &&
    Math.abs(dx) > SWIPE_MIN &&
    Math.abs(dx) > Math.abs(p.y - G.sy) * 1.5;

  if (helpOpen) {
    helpOpen = false;
    if (helpOnly) return (helpOnly = false);
    if (!seenOnce("tour") || helpManual || INTRO_EVERY)
      startTour(); // 시작하면 티켓 한 장으로 찾기 → 평 남기기 시연 (처음 한 번 · ?로 연 때는 다시)
    else if (!seenOnce("tab-" + view)) tabTip = { key: view, t0: millis() };
    helpManual = false;
    return;
  }
  if (G.mode === "carry") return dropCarry(G.d, G.target);
  if (G.mode === "paint") {
    G.d.touched = Date.now();
    saveData();
    return;
  }
  if (["scroll", "fscroll", "tscroll", "rscroll", "oscroll"].includes(G.mode))
    return;
  const tr = toastRect();
  if (isTap && tr && inRect(p, tr) && toastBox.undo) {
    toastBox.undo();
    toastBox = null;
    return;
  }
  if (helpMenu) {
    // ? 메뉴: 고른 것만 다시 보기 · 바깥 톡 = 닫기
    helpMenu = false;
    const it = isTap && (L.helpItems || []).find((q) => inRect(p, q));
    if (it) it.run();
    return;
  }
  if (isTap && inRect(p, L.help)) return (helpMenu = true); // ? = 무엇을 다시 볼지 고르기
  if (isTap && tabTip) {
    // 탭 시연: 톡 = 다음 단계 (마지막이면 끝) · 건너뛰기 = 바로 끝
    if (L.tabSkip && inRect(p, L.tabSkip)) return (tabTip = null);
    if ((tabTip.step || 0) < (tabTip.n || 1) - 1) {
      tabTip.step = (tabTip.step || 0) + 1;
      tabTip.st0 = millis();
    } else tabTip = null;
    return;
  }
  const tb = (L.tabs || []).find((q) => inRect(p, q));
  if (isTap && tb) {
    setView(tb.key);
    if (!seenOnce("tab-" + tb.key)) tabTip = { key: tb.key, t0: millis() }; // 그 탭 시연은 처음 한 번만
    return;
  }

  // 서랍이 열려 있을 때: 서랍 안 동작만 (벽 바깥 톡 = 닫기)
  if (drawerYr && view === "ticket") {
    if (!isTap || drawerClosing) return;
    if (G.where === "rack") return drawerTap(p);
    return closeDrawer();
  }

  // 티켓 벽
  if (G.where === "rack") {
    // (지그재그로 지우기는 뺌 · 지우기는 크게 연 티켓 옆 '삭제'로)
    if (!isTap) return;
    if (inRect(p, L.newBtn)) return newTicket();
    if (inRect(p, L.clearBtn)) return clearSamples();
    const c = (L.chips || []).find((q) => inRect(p, q));
    if (c) {
      filter = c.key;
      rackScroll = 0;
      return;
    }
    if (L.peek && inRect(p, L.peek)) {
      if (L.peek.heart && inRect(p, L.peek.heart))
        return toggleLikeDrama(L.peek.d);
      openTicket(L.peek.d);
      openT = 1;
      flipTo = 1; // 그 자리에서 바로 뒤집혀 뒷면
      return;
    }
    if (inRect(p, L.sortBtn)) {
      newestFirst = !newestFirst;
      rackScroll = 0;
      return;
    }
    const bxh = (L.boxes || []).find((q) => inRect(p, q));
    if (bxh) return openDrawer(bxh.gp.yr); // 상자 앞판 톡 = 그 자리에서 서랍 열기
    const mh = (L.minis || []).find((q) => q.d === G.d);
    if (G.d && mh && mh.heart && inRect(p, mh.heart))
      return toggleLikeDrama(G.d); // ♥만 톡 = 바로 켜고 끄기
    if (G.d) return openTicket(G.d);
    return;
  }

  // 큰 티켓 바깥: ‹ › = 옆 티켓, 나머지 = 닫기
  if (G.where === "overlay") {
    if (!isTap) return;
    const h = L.hits.find(
      (q) =>
        (q.act === "link" || q.act === "del" || q.act === "reset") &&
        inRect(p, q),
    );
    if (h) return ticketAct(G.d, h);
    return (opened = false);
  }

  // 큰 티켓: 회차 띠 톡 = 그 높이로 한 칸 · 옆으로 밀기 = 뒤집기 · 톡 = 뒤집기 (안쪽 버튼이면 그 기능)
  if (G.where === "ticket") {
    if (G.chart && isTap) {
      paintAt(G.d, G.row, p.x, p.y);
      G.d.touched = Date.now();
      saveData();
      return;
    }
    if (swipe) return flipTicket();
    if (!isTap) return;
    const h = L.hits.find(
      (q) => q.act !== "link" && q.act !== "del" && inRect(p, q),
    );
    if (h) return ticketAct(G.d, h);
    return flipTicket();
  }

  // 감상: 한 줄 톡 = 그 티켓 크게 보기
  if (G.where === "reviews") {
    if (!isTap) return;
    const sc = (L.sortChips || []).find((q) => inRect(p, q));
    if (sc) {
      const i = REVIEW_SORTS.findIndex(([k]) => k === reviewSort);
      reviewSort = REVIEW_SORTS[(i + 1) % REVIEW_SORTS.length][0]; // 톡 할 때마다 다음 정렬
      reviewScroll = 0;
      return;
    }
    const r = (L.reviewRows || []).find((q) => inRect(p, q));
    if (r) openReviewCard(r.d); // 톡 = 큰 화면에서 관람평 · 회차 메모 전부
    return;
  }

  // 취향: 추천 포스터 톡 = 발권 창 (내가 본 비슷한 드라마 · 예매 / 발권) · + 예매 = '예매' 칸에 담기
  if (G.where === "taste") {
    if (!isTap) return;
    const r = (L.recs || []).find((q) => inRect(p, q));
    if (r) {
      if (inRect(p, r.want)) return wantRec(r.it);
      return openItem(r.it);
    }
    return;
  }

  // 폴더
  if (G.where === "folders") {
    const f = folderSel ? allFolders().find((q) => q.key === folderSel) : null;
    if (f) {
      if (G.mode === "unpin") {
        if (inRect(p, L.trash)) return removeFromFolder(f, G.d); // 휴지통에 버림 = 폴더에서 빠짐
        return kick(G.d, 0.02); // 아무 데나 놓으면 다시 집게에 걸리며 살짝 흔들림
      }
      if (!isTap) return;
      if (inRect(p, L.backLink)) return (folderSel = null);
      if (L.addTile && inRect(p, L.addTile)) return openAddToFolder(f); // + 티켓 넣기
      if (L.folderDel && inRect(p, L.folderDel)) return deleteFolder(f.st); // 폴더 삭제
      if (f.type === "set" && inRect(p, L.nameHit))
        return openFolderCard(f.st, []);
      const m = (L.members || []).find((q) => inRect(p, q));
      if (m) return openTicket(m.d);
      return;
    }
    if (!isTap) return;
    const del = (L.tileDels || []).find((q) => inRect(p, q)); // 폴더 칸 오른쪽 위 휴지통 = 바로 지우기
    if (del) return deleteFolder(del.st);
    const t = (L.tiles || []).find((q) => inRect(p, q));
    if (!t) return;
    if (t.f.type === "new") return openFolderCard(null, []);
    folderSel = t.f.key;
  }
}

/* =========================================================
   15. 기능
========================================================= */
// ▶ setView — 오른쪽 화면 바꾸기
function setView(key) {
  if (key !== view && ui.input && ui.input.value) {
    ui.input.value = ""; // 다른 탭으로 가면 검색어는 비움 (탭마다 찾는 대상이 달라서)
    hideDrop();
  }
  view = key;
  drawerYr = null; // 다른 화면으로 가면 서랍은 닫힘
  drawerClosing = 0;
  tasteScroll = 0;
  reviewScroll = 0;
  if (key === "folders") {
    folderSel = null;
    folderScroll = 0;
  }
}

// ▶ inlineEdit — 티켓 위에서 바로 고치기: 그 자리에 글자 칸을 띄움 (Enter · 바깥 톡 = 저장, Esc = 취소)
//   r = 화면(1280×800) 위치, o = { save(값), multi(여러 줄), numeric, max, size(글자 크기), font, ph, button{ label, run(값, 버튼) } }
let inline = null;
function inlineEdit(r, value, o) {
  closeInline(true);
  const box = document.createElement("div");
  const el = document.createElement(o.multi ? "textarea" : "input");
  Object.assign(box.style, {
    position: "fixed",
    zIndex: 8,
    display: "flex",
    gap: `${6 * K}px`,
    left: `${OX + r.x * K}px`,
    top: `${OY + r.y * K}px`,
    width: `${r.w * K}px`,
    alignItems: "flex-start",
  });
  Object.assign(el.style, {
    flex: "1",
    minWidth: "0",
    boxSizing: "border-box",
    height: `${r.h * K}px`,
    padding: `0 ${8 * K}px`,
    border: `${2 * K}px solid ${C.ink}`,
    borderRadius: `${6 * K}px`,
    background: "#FFFDF7",
    color: C.ink,
    fontFamily: o.font || "Noto Sans KR, sans-serif",
    fontSize: `${(o.size || 14) * K}px`,
    outline: "none",
    resize: "none",
  });
  if (o.multi) el.style.padding = `${4 * K}px ${8 * K}px`;
  if (o.bare) {
    // 네모 없이: 그려진 글자 그 자리 · 같은 글꼴 · 같은 크기로 바로 타자 (커서만 보임)
    Object.assign(el.style, {
      border: "none",
      borderRadius: "0",
      padding: "0",
      background: "transparent",
      caretColor: C.ink,
      lineHeight: `${r.h * K}px`,
    });
  }
  if (o.paper) {
    // 관람평 종이와 똑같이: 같은 크림 바탕 · 같은 줄 간격과 밑줄 · 테두리 없이 (쓰는 동안에도 모양이 안 바뀌게)
    const lh = o.paper.lh * K;
    Object.assign(el.style, {
      border: "none",
      borderRadius: `${10 * K}px`,
      padding: `${o.paper.top * K}px ${12 * K}px 0`,
      lineHeight: `${lh}px`,
      backgroundColor: "#FBF8F1",
      // 맨 위 여백은 종이색으로 덮고(위로 반복되는 줄 숨김) · 그 아래로 밑줄 반복 (양옆 10씩 들여서, 그림과 같게)
      backgroundImage: `linear-gradient(#FBF8F1, #FBF8F1), linear-gradient(to bottom, transparent ${lh - K}px, #DCD3C2 ${lh - K}px)`,
      backgroundSize: `100% ${o.paper.top * K + 1}px, calc(100% - ${20 * K}px) ${lh}px`,
      backgroundRepeat: "no-repeat, repeat-y",
      backgroundPosition: `0 0, ${10 * K}px ${o.paper.top * K}px`,
      backgroundAttachment: "local",
      backgroundClip: "padding-box",
      overflowY: "auto",
    });
  }
  el.value = value == null ? "" : String(value);
  el.placeholder = o.ph || "";
  if (o.numeric) el.inputMode = "numeric";
  if (o.max) el.maxLength = o.max;
  box.appendChild(el);
  for (const bt of o.buttons || (o.button ? [o.button] : [])) {
    const b = document.createElement("button");
    b.textContent = bt.label;
    Object.assign(b.style, {
      flexShrink: "0",
      height: `${r.h * K}px`, // 글자 칸과 같은 높이 (더 크면 아래 줄을 덮음)
      minHeight: "0",
      boxSizing: "border-box",
      margin: "0",
      border: "none",
      borderRadius: `${r.h * K}px`,
      padding: `0 ${12 * K}px`,
      background: C.ink,
      color: C.paper,
      fontFamily: "Noto Sans KR, sans-serif",
      fontWeight: "700",
      fontSize: `${12 * K}px`,
      cursor: "pointer",
    });
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault(); // 글자 칸이 닫히지 않게
      bt.run(el.value.trim(), b);
    });
    box.appendChild(b);
  }
  document.body.appendChild(box);
  inline = { box, el, o };
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !(o.multi && e.shiftKey)) {
      e.preventDefault();
      closeInline(true);
    }
    if (e.key === "Escape") closeInline(false);
  });
  el.addEventListener("blur", () => closeInline(true));
  setTimeout(() => {
    el.focus();
    if (o.paper || o.bare)
      el.setSelectionRange(el.value.length, el.value.length); // 쓰던 글 끝에 커서 (전체 선택 안 함)
    else if (el.select) el.select();
  }, 20);
}

// ▶ closeInline — 바로 고치던 칸 닫기 (save = 저장할지)
function closeInline(save) {
  if (!inline) return;
  const it = inline;
  inline = null;
  it.box.remove();
  if (save) it.o.save(it.el.value.trim());
  else if (it.o.cancel) it.o.cancel();
}

// ▶ setAndSave — 티켓 값을 바꾸고 저장
function setAndSave(d, patch) {
  Object.assign(d, patch);
  d.touched = Date.now();
  saveData();
}

// ▶ fitEps — 총 회차가 바뀌면 회차 기록 길이도 맞춤
function fitEps(d, n) {
  n = constrain(n || 16, 1, 60);
  const fit = (a) =>
    a.slice(0, n).concat(new Array(Math.max(0, n - a.length)).fill(null));
  d.scores = fit(d.scores);
  d.history.forEach((h) => (h.scores = fit(h.scores)));
  d.eps = n;
  syncStatus(d);
}

// ▶ editField — 뒷면 연도 · 방송사 · 회차 바로 고치기
function editField(d, h) {
  const num = h.key !== "network";
  inlineEdit(h.box, d[h.key], {
    numeric: num,
    size: 14,
    font: num ? "Bebas Neue, sans-serif" : undefined,
    save: (v) => {
      if (h.key === "eps") fitEps(d, parseInt(v, 10));
      else d[h.key] = h.key === "year" ? v.replace(/\D/g, "").slice(0, 4) : v;
      setAndSave(d, {});
    },
  });
}

// ▶ autoFind — 제목으로 정보 찾기: 연도별 목록에 있으면 거기서 먼저, 그다음 TVmaze (영어 제목 · 연도 · 방송사 · 회차 · 포스터)
function autoFind(d, q, done) {
  const ps = parseSeason(q); // "슬기로운 의사생활 2" → 시즌 2
  if (ps.season > 1) {
    d.season = ps.season;
    q = ps.base;
  }
  let en = q;
  const n = (t) => t.replace(/\s+/g, "");
  for (const y in CATALOG)
    for (const [ko, e, net, eps, kind] of CATALOG[y])
      if (ko === q || (n(q).length >= 2 && n(ko).startsWith(n(q)))) {
        // 연도별 목록에 있으면 앞부분만 쳐도 전체 제목으로
        Object.assign(d, { title: ko, en: e, year: y, network: net, kind });
        fitEps(d, eps);
        en = e;
      }
  tvSearch(en)
    .then((res) => {
      const hit = res.find((r) => r.lang === "Korean"); // 한국 드라마만 (엉뚱한 외국 드라마 포스터가 붙지 않게)
      if (!hit) return done(false);
      linkInfo(d, hit);
      if (!d.kind) d.kind = kindOf({ info: hit.info });
      // TVmaze의 한국어 제목으로 덜 쓴 제목 채우기
      return tvKoreanName(hit.tvId).then((kr) => {
        d.title = seasonTitle(fullTitle(ps.base, kr), d.season || 1);
        saveData();
        done(true);
        return hit;
      });
    })
    .then((hit) => {
      if (!hit) return;
      if (d.season > 1)
        tvSeasons(hit.tvId).then((ss) => {
          const q = ss.find((x) => x.n === d.season);
          if (q && q.year) d.year = q.year;
          saveData();
        });
      tvEpisodes(hit.tvId, d.season || 1)
        .then((k) => {
          if (k && !CATALOG[d.year]?.some((r) => r[0] === d.title)) {
            fitEps(d, k);
            saveData();
          }
        })
        .catch(() => {});
    })
    .catch(() => done(false));
}

// ▶ editTitle — 뒷면 제목 바로 고치기 (옆 '자동 찾기' = 연도 · 방송사 · 회차 · 포스터 채우기)
function editTitle(d) {
  // 그려진 제목과 같은 자리 · 같은 크기 (제목 글자 기준선 = 티켓 위에서 82)
  const ts = d.title && textWidthOf(d.title, 28, DISP) > TK.w - 40 ? 22 : 28;
  const bh = 40;
  const btnW = d.tvId ? 0 : 92; // 이미 정보가 붙은 티켓은 '자동 찾기' 없이 제목만
  const r = {
    x: TK.x + 20,
    y: TK.y + 82 - (bh - ts) / 2 - ts * 0.86,
    w: TK.w - 40,
    h: bh,
  };
  const find = (v, b) => {
    if (!v) return;
    d.title = v;
    if (b) b.textContent = "찾는 중…";
    autoFind(d, v, (ok) => {
      const dup = d.fresh && findDup(d, d);
      delete d.fresh;
      if (dup) {
        if (inline && inline.o === opts) closeInline(false);
        data.dramas = data.dramas.filter((q) => q !== d); // 방금 만든 새 티켓은 버림
        return alreadyHave(dup);
      }
      toast(
        ok
          ? `${d.year} · ${d.network} · ${d.eps}부작 · 포스터를 찾았어요`
          : "못 찾았어요 · 그래도 발권은 돼요",
      );
      // 그 제목 칸이 아직 열려 있으면 저장 없이 닫기 (덜 쓴 제목으로 다시 덮어쓰지 않게)
      if (inline && inline.o === opts) closeInline(false);
      d.draft = false;
      data.sample = false;
      saveData();
    });
  };
  const opts = {
    size: ts,
    bare: true, // 네모 없이 그 자리에서 바로
    titleOf: d, // 쓰는 동안 그림 제목은 숨김 (글자가 두 겹으로 안 보이게)
    font: "Black Han Sans, Noto Sans KR, sans-serif",
    ph: "드라마 제목",
    button: btnW ? { label: "자동 찾기", run: find } : null,
    save: (v) => {
      const wasDraft = d.draft;
      if (!v) return;
      const dup = d.fresh && findDup({ title: v }, d);
      if (dup) {
        data.dramas = data.dramas.filter((q) => q !== d); // 방금 만든 새 티켓은 버림
        return alreadyHave(dup);
      }
      d.title = v;
      d.draft = false;
      data.sample = false;
      setAndSave(d, {});
      if (wasDraft && !d.tvId && !d.en)
        find(v); // Enter만 눌러도 처음 한 번은 알아서 찾음
      else delete d.fresh;
    },
  };
  inlineEdit(r, d.title, opts);
}

// ▶ newTicket — '+ 새 티켓': 빈 티켓 뒷면이 바로 열리고 제목 칸에 커서 (자동 찾기 버튼 옆에)
function newTicket() {
  const d = makeDrama({ title: "", eps: 16 }, { status: "watching", upTo: 0 });
  d.draft = true;
  d.fresh = true; // 방금 만든 새 티켓 (이미 있는 드라마면 이 티켓은 버림)
  d.infoTried = true;
  data.dramas.push(d);
  openTicket(d);
  flipT = flipTo = 1;
  openT = 1;
  setTimeout(() => editTitle(d), 80);
}

// ▶ openTicket — 티켓 한 장을 가운데 크게 (앞면부터, 살짝 커지며 나옴)
function openTicket(d) {
  if (view !== "folders") view = "ticket"; // 폴더 안에서 열면 폴더 옆에 뜸
  peekId = d.id;
  opened = true;
  selId = d.id;
  openT = 0;
  flipT = 0;
  flipTo = 0.16; // 열릴 때 살짝 들썩 — 뒤집을 수 있다는 힌트 (바로 뒷면으로 열 때는 아래에서 덮어씀)
  setTimeout(() => {
    if (flipTo === 0.16) flipTo = 0;
  }, 280);
}

// ▶ stepTicket — 크게 연 채로 옆 티켓으로 (벽에 보이는 순서대로)
function stepTicket(step) {
  const list = rackDramas();
  if (!list.length) return;
  const i = list.findIndex((d) => d.id === selId);
  const d = list[(i + step + list.length) % list.length];
  selId = d.id;
  flipT = flipTo = 0;
  openT = 0.6;
}

// ▶ keyPressed — 방향키 = 옆 티켓 · 스페이스 = 뒤집기 · Esc = 닫기 (글자를 쓰는 중이면 무시)
function keyPressed() {
  if (drawerYr && keyCode === ESCAPE && !panel && !inline) return closeDrawer(); // Esc = 서랍 닫기
  if (
    panel ||
    inline ||
    document.activeElement === ui.input ||
    !opened ||
    view !== "ticket"
  )
    return;
  if (keyCode === LEFT_ARROW) stepTicket(-1);
  else if (keyCode === RIGHT_ARROW) stepTicket(1);
  else if (keyCode === ESCAPE) opened = false;
  else if (key === " ") flipTicket();
}

// ▶ flipTicket — 큰 티켓 뒤집기
function flipTicket() {
  flipTo = flipTo ? 0 : 1;
}

// ▶ ticketAct — 크게 연 티켓의 버튼들
function ticketAct(d, h) {
  if (h.act === "del") return removeDrama(d);
  if (h.act === "reset") return resetTicket(d);
  if (h.act === "like") return toggleLikeDrama(d);
  if (h.act === "title") return editTitle(d);
  if (h.act === "field") return editField(d, h);
  if (h.act === "line")
    return inlineEdit(h.box, d.review, {
      multi: true,
      max: REVIEW_MAX,
      size: 15,
      paper: { lh: 24, top: 6 }, // 종이 줄 간격 · 첫 줄 위치 (drawTicketBack의 관람평과 같게)
      ph: "이 드라마, 지금 느낌 그대로 (Shift+Enter = 줄바꿈)",
      save: (v) => {
        const t = v.trim();
        if (t === (d.review || "")) return; // 안 바뀌었으면 그냥 닫기
        setAndSave(d, { review: t });
        toast(t ? "관람평을 저장했어요" : "관람평을 지웠어요");
      },
    });
  if (h.act === "rate") {
    d.rating = d.rating === h.n ? null : h.n; // 같은 별을 다시 누르면 지움
    const was = d.status;
    syncStatus(d); // 전체 평점을 매기면 완주 · 지우면 다시 회차 평 기준
    if (was !== "done" && d.status === "done")
      toast("완주! 전체 평점을 남겼어요");
    return setAndSave(d, {});
  }
  if (h.act === "note") return openNote(d, h.i); // 회차 메모 열기
  if (h.act === "rewatch") return startRewatch(d);
  if (h.act === "delrev")
    return deleteReview(d, { now: true, label: d.watchLabel }, false); // 뒷면 관람평 지우기
  if (h.act === "all") return openReviewCard(d); // 모든 회차 감상 = 감상 탭과 같은 리뷰 창
  if (h.act === "status") {
    // 상태는 회차 평으로 정해짐 · 평이 하나도 없을 때만 예매 ↔ 보는 중을 바꿀 수 있음
    if (ratedEps(d))
      return toast("모든 화에 평을 남기거나 전체 평점을 매기면 완주가 돼요");
    setAndSave(d, {
      status: d.status === "want" ? "watching" : "want",
      upTo: 0,
    });
    return toast(
      d.status === "want" ? "예매 티켓으로 바꿨어요" : "보는 중으로 바꿨어요",
    );
  }
  if (h.act === "link") return openSearchFor(d);
  if (h.act === "kind") {
    d.kind = KINDS[(KINDS.indexOf(kindOf(d)) + 1) % KINDS.length];
    saveData();
    return toast(`장르: ${d.kind}`);
  }
}

// ▶ resetTicket — 티켓 초기화: 이 드라마의 감상 기록을 전부 지우고 처음 발권한 상태(1회차)로
//   지우는 것: 모든 회차의 관람평 · 평점 · 회차 평 · 회차 메모 · 명장면 시간 · 지난 회차 기록
//   남는 것: 제목 · 포스터 · 정보 · 장르 · ♥ · 폴더 · 알림을 누르면 전부 되돌리기
function resetTicket(d) {
  const before = JSON.parse(
    JSON.stringify({
      rating: d.rating,
      review: d.review,
      scores: d.scores,
      notes: d.notes,
      times: d.times,
      status: d.status,
      upTo: d.upTo,
      history: d.history,
      watchLabel: d.watchLabel,
      watchStart: d.watchStart,
    }),
  );
  d.rating = null;
  d.review = "";
  d.scores = new Array(d.eps).fill(null);
  d.notes = {};
  d.times = {};
  d.history = [];
  d.watchLabel = "1회차";
  d.watchStart = Date.now();
  if (d.status !== "want") d.status = "watching";
  syncStatus(d);
  d.touched = Date.now();
  saveData();
  toast(`'${d.title}' 감상 기록을 모두 초기화했어요 · 눌러서 되돌리기`, () => {
    Object.assign(d, before);
    saveData();
  });
}

// ▶ toggleLikeDrama — 내 티켓의 ♥ 켜고 끄기
function toggleLikeDrama(d) {
  d.liked = !d.liked; // 순서가 바뀌지 않게 touched는 그대로
  saveData();
  toast(d.liked ? `♥ '${d.title}' 좋아요` : "♥ 취소");
}

// ▶ openItem — 연도별 목록에서 한 번 톡: 내 티켓이면 크게 보기, 아니면 발권 미리보기
function openItem(it) {
  if (it.d) return openTicket(it.d);
  const c = catInfo[it.en];
  openPreview({
    ...(c || { title: it.en, year: it.year, network: it.network, info: null }),
    title: it.en,
    ko: it.ko,
    eps: it.eps,
    kind: it.kind,
    year: it.year,
    reason: it.reason, // 추천 이유 (취향 추천에서 열었을 때)
  });
}

// ▶ paintAt — 막대 긋기: 손가락이 지나간 회차들의 재미를 그 높이로 (같은 줄 안에서, 건너뛴 칸도 이어서)
function paintAt(d, R, x, y) {
  const k = constrain(Math.floor((x - R.bx) / R.bw), 0, R.n - 1);
  const i = R.first + k;
  const v = constrain(
    Math.round((1 - (y - R.y - 6) / R.barH) * 10) / 10,
    0, // 맨 아래까지 내리면 0 = 그 화 기록 지우기 (안 본 화로 원상복귀)
    1,
  );
  const from = g && g.lastIdx >= 0 ? g.lastIdx : i;
  const fromV = g && g.lastV !== undefined ? g.lastV : v;
  const a = Math.min(from, i);
  const b = Math.max(from, i);
  for (let j = a; j <= b; j++) {
    const t = b === a ? 1 : (j - from) / (i - from);
    const val = Math.round(lerp(fromV, v, constrain(t, 0, 1)) * 10) / 10;
    d.scores[j] = val <= 0 ? null : val; // 맨 아래 = 기록 없음
  }
  syncStatus(d); // 평을 남기면 보는 중 → 모든 화에 남기면 완주
  if (g) {
    g.lastIdx = i;
    g.lastV = v;
    g.idx = i;
  }
}

// ▶ syncStatus — 상태는 회차 띠의 평으로 정해짐
//   모든 화에 평 = 완주 · 하나라도 비어 있으면 보는 중 (평한 화 수 = EP n/16) · 평이 하나도 없고 예매로 뽑은 티켓 = 예매
function syncStatus(d) {
  let last = 0;
  for (let i = 0; i < d.eps; i++)
    if (d.scores[i] !== null && d.scores[i] !== undefined) last = i + 1;
  const was = d.status;
  if (fullyRated(d) || d.rating) {
    // 완주 = 모든 화에 평을 남겼거나, 전체 평점을 매겼을 때
    d.status = "done";
    d.upTo = d.eps;
  } else if (!last && d.status === "want") d.upTo = 0;
  else {
    d.status = "watching";
    d.upTo = last;
  }
  if (was !== "done" && d.status === "done" && g)
    toast(
      d.rating && !fullyRated(d)
        ? "완주! 전체 평점을 남겼어요"
        : "완주! 모든 화에 평을 남겼어요",
    );
}

// ▶ ratedEps / fullyRated — 회차 띠에 평을 남긴 화 수 · 모든 화(16부작이면 16화 전부)에 평을 남겼는지 = '완주'
function ratedEps(d) {
  let n = 0;
  for (let i = 0; i < d.eps; i++)
    if (d.scores[i] !== null && d.scores[i] !== undefined) n++;
  return n;
}
function fullyRated(d) {
  return d.eps > 0 && ratedEps(d) >= d.eps;
}

// ▶ cycleStatus — 평이 없을 때만 예매 ↔ 보는 중 (완주는 회차 평으로만)
function cycleStatus(d) {
  if (ratedEps(d)) return;
  d.status = d.status === "want" ? "watching" : "want";
  d.upTo = 0;
  d.touched = Date.now();
  saveData();
}

// ▶ startRewatch — 다시 보기 시작: 지금 감상(평점 · 한줄평 · 회차 재미)을 보관하고 새 회차로 비움
function startRewatch(d) {
  const before = {
    scores: d.scores,
    review: d.review,
    rating: d.rating,
    upTo: d.upTo,
    watchLabel: d.watchLabel,
    watchStart: d.watchStart,
    status: d.status,
  };
  d.history.push({
    label: d.watchLabel,
    start: d.watchStart,
    end: Date.now(),
    scores: d.scores.slice(),
    review: d.review,
    rating: d.rating,
    upTo: d.upTo,
  });
  d.watchLabel = `${d.history.length + 1}회차`;
  d.watchStart = Date.now();
  d.scores = new Array(d.eps).fill(null);
  d.review = "";
  d.rating = null;
  d.upTo = 0;
  d.status = "watching";
  d.touched = Date.now();
  saveData();
  toast(
    `${d.watchLabel} 시작 · ${d.history[d.history.length - 1].label} 감상은 점선으로 남아요`,
    () => {
      d.history.pop();
      Object.assign(d, before);
      saveData();
      toast("되돌렸어요");
    },
  );
}

// ▶ removeDrama — 티켓 지우기 (잠깐 동안 알림을 누르면 되돌림)
function removeDrama(d) {
  const i = data.dramas.indexOf(d);
  if (i < 0) return;
  data.dramas.splice(i, 1);
  if (selId === d.id) opened = false;
  saveData();
  if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
  toast(
    gone(d.title.length > 10 ? d.title.slice(0, 10) + "…" : d.title),
    () => {
      data.dramas.splice(i, 0, d);
      saveData();
      toast("되돌렸어요");
    },
  );
}

// ▶ clearSamples — 예시 티켓 · 예시 폴더를 다 비우고 내 티켓만 쓰기 (잠깐 되돌리기 가능)
function clearSamples() {
  const before = { dramas: data.dramas, sets: data.sets };
  data.dramas = [];
  data.sets = [];
  data.sample = false;
  opened = false;
  saveData();
  toast("예시를 비웠어요 · '+ 새 티켓'으로 시작해요", () => {
    Object.assign(data, before, { sample: true });
    saveData();
  });
}

// ▶ dropCarry — 들고 있던 티켓을 놓았을 때: 폴더에 넣기 / 둘을 이어 폴더 만들기
function dropCarry(d, t) {
  if (!t) return;
  if (t.f) {
    if (t.f.type === "new") return openFolderCard(null, [d]);
    return addToFolder(t.f, d);
  }
  const o = t.d;
  const fo = foldersOf(o)[0];
  const fd = foldersOf(d)[0];
  if (fo) return addToFolder({ type: "set", st: fo, name: fo.name }, d);
  if (fd) return addToFolder({ type: "set", st: fd, name: fd.name }, o);
  openFolderCard(null, [d, o]);
}

// ▶ addToFolder — 폴더에 넣기 (키워드 폴더면 그 키워드를 붙임)
function addToFolder(f, d) {
  if (f.type === "kw") {
    if (d.keys.includes(f.kw)) return toast("이미 이 키워드가 있어요");
    d.keys.push(f.kw);
  } else {
    if (f.st.ids.includes(d.id)) return toast("이미 이 폴더에 있어요");
    f.st.ids.push(d.id);
  }
  saveData();
  toast(`'${d.title}' → '${f.name}'`);
}

// ▶ removeFromFolder — 폴더에서 빼기 (키워드 폴더면 키워드를 뗌) · 되돌리기 가능
function removeFromFolder(f, d) {
  if (f.type === "kw") {
    const i = d.keys.indexOf(f.kw);
    d.keys.splice(i, 1);
    saveData();
    toast(`'${d.title}'을(를) '${f.name}'에서 뺐어요 · 눌러서 되돌리기`, () => {
      d.keys.splice(i, 0, f.kw);
      saveData();
    });
  } else {
    const i = f.st.ids.indexOf(d.id);
    f.st.ids.splice(i, 1);
    saveData();
    toast(
      `'${d.title}' 폴더에서 뺐어요 (티켓은 그대로) · 눌러서 되돌리기`,
      () => {
        f.st.ids.splice(i, 0, d.id);
        saveData();
      },
    );
  }
}

/* =========================================================
   16. HTML — 검색창 · 발권 미리보기 · 평점·키워드 · 회차 메모 · 모든 감상 · 폴더 (모양은 index.html)
========================================================= */
// ▶ mk — HTML 요소 만들기: mk(태그, 부모, 글자, class 이름)
function mk(tag, parent, txt, cls) {
  const e = createElement(tag);
  if (parent) e.parent(parent); // 부모가 없으면 body에 그대로 붙음
  if (txt != null) e.elt.textContent = txt;
  if (cls) e.elt.className = cls;
  return e;
}

// ▶ makeSearch — 위쪽 검색창: 글자 칸 하나 (제목 · 방송사 · 연도 · #키워드) + 아래로 펼쳐지는 결과
function makeSearch() {
  const wrap = mk("div", null, null, "search-wrap");
  const bar = mk("div", wrap, null, "search");
  mk("span", bar, "⌕", "search-icon");
  const input = mk("input", bar, null, "search-input");
  input.elt.placeholder = "제목 · 방송사 · 연도로 찾기";
  const drop = mk("div", wrap, null, "drop");
  drop.elt.hidden = true;
  ui = {
    wrap: wrap.elt,
    input: input.elt,
    drop: drop.elt,
    linkTo: null,
  };

  let timer = null;
  const run = () => {
    clearTimeout(timer);
    timer = setTimeout(renderDrop, 300);
  };
  input.elt.addEventListener("input", () => {
    rackScroll = 0;
    reviewScroll = 0;
    run();
  });
  input.elt.addEventListener("focus", run);
  input.elt.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideDrop();
      input.elt.blur();
    }
  });
}

// ▶ hideDrop — 검색 결과 닫기
function hideDrop() {
  if (ui.drop) ui.drop.hidden = true;
}

let searchAsk = 0;
// ▶ renderDrop — 검색 결과: '내 티켓에서' + '새 드라마 발권 (TVmaze)'
function renderDrop() {
  if (view === "reviews") return hideDrop(); // 감상 탭: 검색창 = 감상 카드 거르기 (발권 목록은 안 띄움)
  const q = ui.input.value.trim();
  const drop = ui.drop;
  if (!q) return hideDrop();
  drop.textContent = "";
  drop.hidden = false;

  const mine = rackDramas().slice(0, 4);
  if (mine.length && !ui.linkTo) {
    mk("p", drop, "MY TICKETS", "drop-head");
    mine.forEach((d) => {
      const b = mk("button", drop, null, "drop-item");
      thumb(b, d.poster);
      const t = mk("div", b);
      mk("b", t, d.title);
      mk(
        "span",
        t,
        [d.year, d.network, STATUS[d.status].ko].filter(Boolean).join(" · "),
      );
      b.elt.addEventListener("click", () => {
        openTicket(d);
        hideDrop();
      });
    });
  }

  mk(
    "p",
    drop,
    ui.linkTo
      ? `'${ui.linkTo.title}'에 연결할 정보 고르기`
      : "NEW TICKET · TVmaze",
    "drop-head",
  );
  if (!q || q.startsWith("#")) {
    mk(
      "p",
      drop,
      "제목을 적으면 처음 보는 드라마도 찾아 줘요 (영어 제목이 잘 찾아져요)",
      "drop-empty",
    );
    return;
  }
  const wait = mk("p", drop, "찾는 중…", "drop-empty");
  const my = ++searchAsk;
  const ps = parseSeason(q); // "슬기로운 의사생활 2" → "슬기로운 의사생활" 로 찾고 시즌 2를 골라 둠
  tvSearch(ps.base)
    .then((list) => {
      if (my !== searchAsk) return; // 더 새로운 검색이 있으면 무시
      wait.remove();
      const res = list.slice(0, 8); // 이미 있는 드라마도 보여줌 (다른 시즌을 발권할 수 있게 · 같은 시즌이면 발권할 때 알려 줌)
      if (!res.length)
        mk("p", drop, "못 찾았어요 · 영어 제목으로 찾아보세요", "drop-empty");
      res.forEach((r) => {
        const b = mk("button", drop, null, "drop-item");
        thumb(b, r.poster);
        const t = mk("div", b);
        mk("b", t, r.title);
        mk(
          "span",
          t,
          [r.year, r.network, (r.info.genres || []).join(", ")]
            .filter(Boolean)
            .join(" · "),
        );
        mk("span", b, ui.linkTo ? "LINK" : "+ 발권", "add");
        b.elt.addEventListener("click", () => {
          hideDrop();
          openPreview({ ...r, wantSeason: ps.season });
        });
      });
      const m = mk("button", drop, null, "drop-item");
      const t = mk("div", m);
      mk("b", t, "찾는 드라마가 없어요");
      mk("span", t, `'${q}' 직접 적어서 발권하기`);
      m.elt.addEventListener("click", () => {
        hideDrop();
        openPreview({ title: q, manual: true, info: null });
      });
    })
    .catch(() => {
      if (my !== searchAsk) return;
      wait.elt.textContent = "인터넷 연결을 확인해 주세요";
    });
}

// ▶ thumb — 검색 결과 줄의 작은 포스터
function thumb(parent, url) {
  if (url) {
    const im = mk("img", parent);
    im.elt.src = url;
    im.elt.alt = "";
  } else mk("div", parent, null, "ph");
}

// ▶ openSearchFor — 포스터 · 정보가 없는 티켓에 연결하기 (검색창에 제목을 넣고 결과를 펼침)
function openSearchFor(d) {
  ui.linkTo = d;
  ui.input.value = d.en || d.title;
  ui.input.focus();
  renderDrop();
}

// ▶ openCard — 가운데 뜨는 카드 틀 (바깥을 누르면 닫힘)
// ▶ watchBebas / fixBebas — HTML 창에서도 Bebas Neue(라벨 글꼴)에 한글이 섞이면 어색하게 보여서
//   한글 부분만 본문 글꼴 굵게 · 살짝 작게 감쌈 (캔버스의 fixHangul과 같은 규칙) · 글자가 바뀌면 다시
function fixBebas(root) {
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const todo = [];
  while (tw.nextNode()) {
    const n = tw.currentNode;
    const el = n.parentElement;
    if (!el || el.dataset.k || !/[가-힣]/.test(n.nodeValue)) continue;
    if (/Bebas/i.test(getComputedStyle(el).fontFamily.split(",")[0]))
      todo.push(n);
  }
  todo.forEach((n) => {
    const frag = document.createDocumentFragment();
    n.nodeValue
      .split(/([가-힣][가-힣\s]*[가-힣]|[가-힣])/)
      .forEach((part, i) => {
        if (!part) return;
        if (i % 2) {
          const sp = document.createElement("span");
          sp.dataset.k = "1";
          sp.textContent = part;
          Object.assign(sp.style, {
            fontFamily: "Noto Sans KR, sans-serif",
            fontWeight: "700",
            fontSize: "0.8em",
            letterSpacing: "0",
          });
          frag.append(sp);
        } else frag.append(part);
      });
    n.replaceWith(frag);
  });
}
function watchBebas() {
  let queued = false;
  const run = () => {
    queued = false;
    fixBebas(document.body);
  };
  new MutationObserver(() => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(run);
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  run();
}

// ▶ pickGrid / pickBtn — 포스터로 고르는 칸: 칸 크기를 모두 똑같이 (포스터 2:3 · 제목 한 줄)
function pickGrid(parent, min = 104) {
  const grid = mk("div", parent, null, "pick-grid");
  Object.assign(grid.elt.style, {
    gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
    alignItems: "start",
  });
  return grid;
}
function pickBtn(grid, d) {
  const b = mk("button", grid, null, "pick");
  Object.assign(b.elt.style, { minWidth: "0", width: "100%" });
  thumbOf(b, d);
  const im = b.elt.firstChild;
  Object.assign(im.style, {
    display: "block",
    width: "100%",
    height: "auto",
    aspectRatio: "2 / 3",
    objectFit: "cover",
  });
  mk("span", b, d.title);
  return b;
}

// ▶ ticketSkin — HTML 창을 크림색 티켓처럼: 위 색 띠(card-top) · 종이 바탕 · 진한 글씨 · 작은 버튼 · 절취선(.tperf)
function ticketSkin(card, acc) {
  if (!document.getElementById("tcard-css")) {
    const st = document.createElement("style");
    st.id = "tcard-css";
    st.textContent = `
.card.tcard{background:#F2EDE3;color:#17171A;max-width:440px;padding:0 0 18px;gap:12px;border-radius:16px;overflow-x:hidden}
.tcard>*{margin-left:18px;margin-right:18px;box-sizing:border-box;max-width:calc(100% - 36px)}
.tcard>.field,.tcard>.num,.tcard>div>.field{width:auto}
.tcard>.card-top{max-width:none}
.tcard>.card-top{margin:0;background:var(--acc);color:#17171A;padding:5px 8px 5px 18px;font-size:16px;align-items:center}
.tcard .x{color:#17171A;font-size:16px!important;min-height:28px!important;min-width:28px!important}
.tcard .prev{gap:14px;align-items:flex-start;margin-top:4px}
.tcard .prev img,.tcard .prev .ph{width:84px;height:122px;border-radius:6px;flex-shrink:0}
.tcard .chips button{border-color:#CFC7B8;color:#17171A;padding:5px 11px;font-size:12px}
.tcard .chips button.on{background:#17171A;border-color:#17171A;color:#F2EDE3}
.tcard .swatches{gap:8px}.tcard .swatches button{width:28px;height:28px}
.tcard .swatches button.on{border-color:#17171A}
.tcard .pick{background:#FBF8F1;color:#17171A;border-color:transparent;padding:4px;font-size:11px}
.tcard .pick.on{border-color:#17171A;background:#E2DBCD}
.tcard .prev-text{gap:6px;padding-top:2px}
.tcard .big{font-size:24px;color:#17171A}
.tcard .meta{color:#6B665E;font-size:12px}
.tcard .label{color:#8C877E;font-size:13px;margin-top:2px;margin-bottom:-6px}
.tcard .seg{gap:6px}
.tcard .seg button{min-height:38px;border:1.5px solid #CFC7B8;border-radius:19px;background:transparent;color:#17171A;font-size:13px}
.tcard .seg button.on{background:#17171A;border-color:#17171A;color:#F2EDE3}
.tcard .field,.tcard .num{background:#FBF8F1;border-color:#CFC7B8;color:#17171A;font-size:15px}
.tcard .field:focus,.tcard .num:focus{border-color:#17171A}
.tcard .field::placeholder,.tcard .num::placeholder{color:#A39D92}
.tcard .row{gap:8px;margin-top:2px}
.tcard .btn{min-height:40px;border:1.5px solid #17171A;color:#17171A;font-size:15px;border-radius:20px}
.tcard .btn-main{min-height:40px;background:#17171A;color:#F2EDE3;font-size:15px;border-radius:20px}
.tcard .tperf{position:relative;height:20px;margin:2px 0;max-width:none;width:auto}
.tcard .tperf::before{content:"";position:absolute;left:14px;right:14px;top:9px;border-top:1.5px dashed #C8C1B3}
.tcard .tperf::after{content:"";position:absolute;left:0;right:0;top:0;height:20px;background:radial-gradient(circle at 0 50%,#2a2a2d 10px,transparent 10.5px),radial-gradient(circle at 100% 50%,#2a2a2d 10px,transparent 10.5px)}
`;
    document.head.append(st);
  }
  card.elt.classList.add("tcard");
  card.elt.style.setProperty("--acc", acc);
}

// ▶ thumbOf — 티켓 포스터 작게 (포스터가 없으면 티켓 색 칸에 제목)
function thumbOf(parent, d) {
  if (d.poster) return thumb(parent, d.poster);
  const ph = mk("div", parent, d.title, "ph");
  Object.assign(ph.elt.style, {
    background: accentOf(d),
    color: "#17171A",
    fontWeight: "700",
    fontSize: "12px",
    padding: "8px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "flex-end",
    lineHeight: "1.3",
  });
}
function openCard(build) {
  closePanel();
  panel = createDiv();
  panel.elt.className = "dim";
  const dim = panel.elt;
  dim.addEventListener("pointerdown", (e) => {
    if (e.target === dim && panel && panel.elt === dim) closePanel(); // 바깥(어두운 곳) 톡 = 닫기
  });
  build(mk("div", panel, null, "card"));
}

// ▶ closePanel — 카드 닫기
let panelBeforeClose = null; // 창을 닫기 직전에 할 일 (감상 창: 고친 관람평 저장)
function closePanel() {
  if (panelBeforeClose) {
    const f = panelBeforeClose;
    panelBeforeClose = null;
    f();
  }
  if (panel) {
    panel.remove();
    panel = null;
  }
  ui.linkTo = null;
}

// ▶ cardTop — 카드 맨 위 줄 (왼쪽 글자 + 오른쪽 CLOSE)
function cardTop(card, label) {
  const top = mk("div", card, null, "card-top");
  mk("span", top, label);
  const xb = mk("button", top, "✕", "x"); // 닫기 = ✕ 하나만
  xb.elt.setAttribute("aria-label", "닫기");
  Object.assign(xb.elt.style, {
    fontSize: "20px",
    fontFamily: "Noto Sans KR, sans-serif",
    minWidth: "36px",
    minHeight: "36px",
    padding: "0",
  });
  xb.elt.addEventListener("click", closePanel);
}

// ▶ openPreview — 발권 미리보기: 포스터 · 연도 · 방송사 · 장르 · 비슷한 내 드라마 → 예매 / 발권 (또는 정보 연결)
function openPreview(r) {
  const linkTo = ui.linkTo;
  openCard((card) => {
    ui.linkTo = linkTo; // openCard가 지운 연결 대상을 다시 기억
    ticketSkin(card, KIND_COL[r.kind] || hashColor(r.ko || r.title || "")); // 크림색 티켓 모양 (리뷰 창과 같은 결)
    cardTop(
      card,
      linkTo ? "LINK INFO" : r.manual ? "NEW TICKET · 직접 적기" : "NEW TICKET",
    );
    const prev = mk("div", card, null, "prev");
    thumb(prev, r.posterBig || r.poster);
    const pt_ = mk("div", prev, null, "prev-text");
    const big = mk("p", pt_, r.ko || r.title, "big");
    const metaP = r.manual
      ? null
      : mk(
          "p",
          pt_,
          [r.year, r.network, r.eps ? `${r.eps}부작` : "", r.kind]
            .filter(Boolean)
            .join(" · "),
          "meta",
        );
    // 줄거리 대신: 내가 본 것 중 비슷한 느낌(같은 결)의 드라마 — ♥ · 평점 높은 순으로 3개
    const me = {
      title: r.ko || r.title,
      en: r.title,
      tvId: r.tvId || r.id,
      season: r.season,
    };
    // 같은 '느낌 꼬리표'(첫사랑 · 직장 · 타임슬립 …)가 많이 겹치는 순 → 그다음 같은 장르 · ♥ · 평점
    const myMood = moodOf(r.ko || r.title);
    const seedN = [...(r.ko || r.title || "")].reduce(
      (a, c) => a + c.charCodeAt(0),
      0,
    ); // 동점일 때 드라마마다 다르게
    const scored = data.dramas
      .filter((d) => !d.draft && !sameDrama(me, d))
      .map((d, k) => {
        const mm = moodOf(d.title);
        const share = myMood.filter((t) => mm.includes(t));
        const s =
          share.length * 3 +
          (r.kind && kindOf(d) === r.kind ? 1 : 0) +
          (d.liked ? 0.4 : 0) +
          (lastRating(d).r || 0) / 25 +
          ((seedN * 7 + k * 13) % 10) / 100;
        return { d, s, share };
      })
      .filter(
        (q) =>
          q.share.length ||
          (!myMood.length && r.kind && kindOf(q.d) === r.kind),
      )
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);
    const sims = scored.map((q) => q.d);
    const shareTags = [...new Set(scored.flatMap((q) => q.share))].slice(0, 3);
    if (sims.length) {
      const lab = mk(
        "p",
        pt_,
        shareTags.length
          ? `비슷한 느낌 · ${shareTags.map((t) => "#" + t).join(" ")}`
          : "비슷한 느낌 · 내가 본 드라마",
        "meta",
      );
      Object.assign(lab.elt.style, { marginTop: "10px", fontSize: "12px" });
      const simRow = mk("div", pt_);
      Object.assign(simRow.elt.style, {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginTop: "4px",
      });
      for (const d of sims) {
        const chip = mk("div", simRow);
        Object.assign(chip.elt.style, {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 12px 4px 4px",
          background: "#FBF8F1",
          border: "1.5px solid #D8D0C1",
          borderRadius: "10px",
          maxWidth: "200px",
        });
        const ph = mk("div", chip);
        Object.assign(ph.elt.style, {
          width: "28px",
          height: "40px",
          borderRadius: "4px",
          overflow: "hidden",
          flex: "none",
        });
        thumbOf(ph, d);
        for (const el of ph.elt.querySelectorAll("img,.ph"))
          Object.assign(el.style, {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            fontSize: "0",
            padding: "0",
          });
        const t = mk("span", chip, (d.liked ? "♥ " : "") + d.title);
        Object.assign(t.elt.style, {
          fontSize: "14px",
          fontWeight: "700",
          color: "#17171A",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        });
      }
    } else if (r.kind && !r.manual) {
      const rs = mk("p", pt_, `처음 보는 결 · ${r.kind}`, "meta");
      Object.assign(rs.elt.style, { marginTop: "6px" });
    }

    mk("div", card, null, "tperf"); // 절취선

    if (linkTo) {
      mk(
        "p",
        card,
        `'${linkTo.title}' 티켓에 이 포스터와 정보를 붙여요`,
        "meta",
      );
      const row = mk("div", card, null, "row");
      mk("button", row, "정보 연결", "btn-main grow").elt.addEventListener(
        "click",
        () => {
          linkInfo(linkTo, r);
          saveData();
          closePanel();
          toast("정보를 연결했어요");
        },
      );
      return;
    }

    // 한글 제목: 자동으로 찾아서 위 큰 제목에 바로 반영 (직접 적기일 때만 입력칸)
    let koName = r.manual ? r.title : r.ko || "";
    let ko = null;
    let yearIn = null;
    if (r.manual) {
      mk("p", card, "드라마 제목 · 연도", "label");
      const two = mk("div", card, null, "nums");
      ko = mk("input", two, null, "field");
      ko.elt.placeholder = "예: 눈물의 여왕";
      ko.elt.value = r.title || "";
      yearIn = mk("input", two, null, "num");
      yearIn.elt.inputMode = "numeric";
      yearIn.elt.placeholder = "2024";
    } else if (!r.ko && r.tvId)
      tvKoreanName(r.tvId).then((kr) => {
        if (kr) {
          koName = kr;
          big.elt.textContent = seasonTitle(kr, season);
        }
      });
    // 총 회차는 자동 (모르면 16) — 화면엔 '/16'으로만 보임
    let total = r.eps || 16;
    // 예매(아직 안 봄) · 보는 중 — 완주는 발권한 뒤 회차 띠에 모든 화 평을 남기면 자동으로
    const seasonBox = mk("div", card); // 시즌 고르기 (시즌이 여러 개일 때만 채워짐)
    let status = "watching"; // 아래 두 발권 버튼 중 무엇을 눌렀는지로 정해짐
    const totSpan = {}; // 회차 수를 찾으면 여기 적던 자리 (지금은 화면에 안 보임)
    // 시즌: 시즌이 여러 개면 고르는 줄이 생김 (검색어에 '2' · '시즌2'가 있으면 그 시즌으로)
    let season = 0;
    let seasonYear = "";
    if (r.tvId && !r.eps)
      tvSeasons(r.tvId).then((ss) => {
        if (ss.length > 1) {
          Object.assign(seasonBox.elt.style, {
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          });
          mk("p", seasonBox, "시즌", "label");
          const sg = mk("div", seasonBox, null, "seg");
          const btns = ss.map((q) => {
            const b = mk("button", sg, `시즌 ${q.n}`);
            b.elt.addEventListener("click", () => pickSeason(q));
            return b;
          });
          const pickSeason = (q) => {
            season = q.n;
            seasonYear = q.year;
            btns.forEach((b, i) => b.elt.classList.toggle("on", ss[i] === q));
            big.elt.textContent = seasonTitle(koName || r.title, q.n);
            if (metaP)
              metaP.elt.textContent = [
                q.year || r.year,
                r.network,
                q.eps ? `${q.eps}부작` : "",
              ]
                .filter(Boolean)
                .join("  ·  ");
            if (q.eps) total = q.eps;
            else
              tvEpisodes(r.tvId, q.n)
                .then((k) => k && season === q.n && (total = k))
                .catch(() => {});
          };
          pickSeason(ss.find((q) => q.n === r.wantSeason) || ss[0]);
        } else
          tvEpisodes(r.tvId)
            .then((k) => {
              if (k) total = k;
            })
            .catch(() => {});
      });
    // 발권 버튼 둘: 예매(나중에 볼 것) · 지금 보는 중 — 고르는 단계 없이 바로
    const row = mk("div", card, null, "row");
    const issue = (st) => {
      {
        status = st;
        let title = ko ? ko.elt.value.trim() : koName || r.title;
        if (!title) return ko && ko.elt.focus();
        if (r.manual)
          season = parseSeason(title).season; // 직접 적기: 제목 끝 숫자 = 시즌
        else if (season) title = seasonTitle(title, season);
        total = constrain(total, 1, 60);
        const dup = findDup({
          title,
          en: r.manual ? "" : r.title,
          tvId: r.tvId,
          season,
        });
        if (dup) {
          closePanel();
          ui.input.value = "";
          return alreadyHave(dup);
        }
        const d = makeDrama(
          {
            title,
            en: r.manual ? "" : r.title,
            tvId: r.tvId,
            poster: r.poster,
            posterBig: r.posterBig,
            year: r.manual
              ? (yearIn.elt.value || "").trim()
              : seasonYear || r.year, // 시즌 2면 시즌 2가 나온 해
            network: r.network,
            eps: total,
            info: r.info,
            kind: r.kind,
          },
          { status, upTo: 0 },
        );
        d.infoTried = !!d.poster || !!r.tvId;
        if (season > 1) d.season = season;
        data.dramas.push(d);
        data.sample = false;
        saveData();
        closePanel();
        ui.input.value = "";
        filter = "all";
        openTicket(d);
        toast(
          st === "want"
            ? "예매했어요 · 티켓 탭 '예매' 칸에 있어요"
            : "티켓을 발권했어요 · 탭을 눌러 뒷면에 관람평을 남겨요",
        );
        if (!d.infoTried) setTimeout(fetchMissingInfo, 50);
      }
    };
    mk("button", row, "예매 · 나중에 볼래요", "btn").elt.addEventListener(
      "click",
      () => issue("want"),
    );
    mk("button", row, "보는 중 · 발권", "btn-main grow").elt.addEventListener(
      "click",
      () => issue("watching"),
    );
    if (ko) setTimeout(() => ko.elt.focus(), 50);
  });
}

// ▶ openNote — 회차 메모: EP 번호 · 메모 · 명장면 시간
function openNote(d, i) {
  openCard((card) => {
    const v = d.scores[i];
    const acc = accentOf(d);
    Object.assign(card.elt.style, {
      maxWidth: "400px",
      padding: "20px 22px 22px",
      gap: "12px",
      borderTop: `6px solid ${acc}`, // 티켓 색 띠
    });
    // 위: EP 번호(크게) · 닫기
    const top = mk("div", card, null, "card-top");
    top.elt.style.alignItems = "center";
    const ep = mk("span", top, `EP ${String(i + 1).padStart(2, "0")}`);
    Object.assign(ep.elt.style, {
      fontSize: "34px",
      lineHeight: "1",
      color: "#f3f1ec",
    });
    const xb = mk("button", top, "✕", "x"); // 닫기 = ✕ 하나만
    xb.elt.setAttribute("aria-label", "닫기");
    Object.assign(xb.elt.style, {
      fontSize: "20px",
      fontFamily: "Noto Sans KR, sans-serif",
      minWidth: "36px",
      minHeight: "36px",
      padding: "0",
    });
    xb.elt.addEventListener("click", closePanel);
    // 드라마 제목 · 그 화 재미 (본문 글꼴 한 줄)
    const sub = mk("p", card, null, "meta");
    sub.elt.style.margin = "-4px 0 2px";
    sub.elt.append(d.title);
    if (v !== null && v !== undefined) {
      const sc = document.createElement("span");
      sc.textContent = `  ·  재미 ${Math.round(v * 10)}/10`;
      sc.style.color = acc;
      sc.style.fontWeight = "700";
      sub.elt.append(sc);
    }
    // 메모 칸: 네모 박스 없이 줄만 (감상 창처럼 바로 쓰는 느낌)
    const area = mk("textarea", card, null, "area");
    Object.assign(area.elt.style, {
      minHeight: "112px",
      fontSize: "15px",
      lineHeight: "28px",
      border: "none",
      borderRadius: "0",
      padding: "0 2px",
      background: "transparent",
      backgroundImage:
        "linear-gradient(to bottom, transparent 27px, rgba(243,241,236,0.16) 27px)",
      backgroundSize: "100% 28px",
      backgroundAttachment: "local",
      caretColor: acc,
      outline: "none",
    });
    area.elt.placeholder = "이 화에서 기억할 장면, 명대사";
    area.elt.value = d.notes[i] || "";
    const row = mk("div", card, null, "row");
    const small = { minHeight: "40px", fontSize: "16px", padding: "0 16px" };
    const sb = mk("button", row, "저장", "btn-main grow");
    Object.assign(sb.elt.style, small);
    sb.elt.addEventListener("pointerdown", (e) => {
      e.preventDefault(); // 누르는 순간 저장 (한글 조합 중이어도 한 번에)
      e.stopPropagation();
      const t = area.elt.value.trim();
      if (t) d.notes[i] = t;
      else delete d.notes[i];
      d.touched = Date.now();
      saveData();
      closePanel();
      toast(
        t
          ? `EP ${String(i + 1).padStart(2, "0")} 메모를 저장했어요`
          : `EP ${String(i + 1).padStart(2, "0")} 메모를 지웠어요`,
      );
    });
    setTimeout(() => area.elt.focus(), 50);
  });
}

// ▶ deleteReview — 관람평 글 지우기 (q = watches(d) 중 하나 · 지금 회차면 d.review) · 알림 톡 = 되돌리기
function deleteReview(d, q, reopen = true) {
  const target = q.now ? d : q; // 지난 회차는 history 안 그 기록 자체
  const old = target.review;
  target.review = "";
  setAndSave(d, {});
  if (reopen && panel) openReviewCard(d);
  toast(`${q.label || "1회차"} 관람평을 지웠어요 · 눌러서 되돌리기`, () => {
    target.review = old;
    setAndSave(d, {});
    if (reopen && panel) openReviewCard(d);
  });
}

// ▶ openReviewCard — 감상 탭에서 톡: 작은 티켓 한 장처럼 (크림색 종이 · 위 색 띠에 제목 · 절취선)
//   위 = 제목 · 정보 · 평점 (다시 본 드라마는 회차별 평점 변화) / 절취선 / 아래 = 회차마다 관람평 · 회차 메모
function openReviewCard(d) {
  const acc = accentOf(d);
  const INK = "#17171A";
  const PAPER = "#F2EDE3";
  const SUB = "#6B665E";
  const css = (e, o) => (Object.assign((e.elt || e).style, o), e);
  const LABF = "Bebas Neue, Noto Sans KR, sans-serif";
  const ws = watches(d);
  openCard((card) => {
    css(card, {
      maxWidth: "460px",
      background: PAPER,
      color: INK,
      padding: "0",
      gap: "0",
      borderRadius: "16px",
      overflowX: "hidden",
    });
    // 색 띠: 제목 · 닫기
    const band = css(mk("div", card), {
      background: acc,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 10px 10px 18px",
    });
    css(mk("p", band, d.title), {
      margin: "0",
      flex: "1",
      minWidth: "0",
      fontFamily: "Black Han Sans, Noto Sans KR, sans-serif",
      fontSize: "21px",
      lineHeight: "1.2",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    });
    // 휴지통 = 이 드라마 감상 지우기 (관람평 · 평점 · 회차 메모 · 회차 기록 · 티켓은 그대로) · 알림 톡 = 되돌리기
    const tr = css(mk("button", band), {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      minWidth: "36px",
      minHeight: "36px",
      padding: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
    tr.elt.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17171A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 4h4M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
    tr.elt.setAttribute("aria-label", "감상 지우기");
    tr.elt.title = "감상 지우기";
    tr.elt.addEventListener("click", () => {
      closePanel();
      resetTicket(d);
    });
    const x = css(mk("button", band, "✕"), {
      border: "none",
      background: "transparent",
      color: INK,
      fontSize: "16px",
      cursor: "pointer",
      minWidth: "36px",
      minHeight: "36px",
    });
    x.elt.setAttribute("aria-label", "닫기");
    x.elt.addEventListener("click", closePanel);

    // 정보 줄 | 평점
    const head = css(mk("div", card), {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 18px 10px",
    });
    const ht = css(mk("div", head), {
      flex: "1",
      minWidth: "0",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    });
    css(
      mk(
        "p",
        ht,
        [d.year, d.network, `${d.eps}부작`, kindOf(d), STATUS[d.status].ko]
          .filter(Boolean)
          .join(" · "),
      ),
      {
        margin: "0",
        fontSize: "12px",
        color: SUB,
      },
    );
    // 다시 본 드라마: 회차마다 평점이 어떻게 바뀌었는지 (1회차 ★7 → 2회차 ★9)
    const rated = ws.filter((q) => q.rating);
    if (ws.length > 1 && rated.length > 1) {
      const ch = css(mk("p", ht), {
        margin: "0",
        fontSize: "12px",
        color: SUB,
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
        alignItems: "center",
      });
      rated.forEach((q, k) => {
        if (k) mk("span", ch, "→");
        css(mk("span", ch, `${q.label} ★${q.rating}`), {
          fontWeight: q.now ? "700" : "400",
          color: q.now ? INK : SUB,
        });
      });
      const diff = rated[rated.length - 1].rating - rated[0].rating;
      if (diff)
        css(mk("span", ch, diff > 0 ? `+${diff}` : `${diff}`), {
          marginLeft: "4px",
          padding: "0 6px",
          borderRadius: "8px",
          fontWeight: "700",
          background: diff > 0 ? acc : "#E2DBCD",
          color: INK,
        });
    }
    const rr = css(mk("div", head), {
      display: "flex",
      alignItems: "baseline",
      gap: "3px",
      flexShrink: "0",
    });
    if (d.liked)
      css(mk("span", rr, "♥"), {
        color: HEART,
        fontSize: "14px",
        marginRight: "6px",
      });
    const LR = lastRating(d); // 지금 회차 평점이 없으면 지난 회차 평점 (흐리게 + 몇 회차인지)
    css(mk("span", rr, LR.r ? `${LR.r}` : "–"), {
      fontFamily: LABF,
      fontSize: "34px",
      lineHeight: "0.9",
      color: LR.r ? (LR.label ? "#6B665E" : INK) : "#B9B1A2",
    });
    css(mk("span", rr, LR.label ? `/10 · ${LR.label}` : "/10"), {
      fontFamily: LABF,
      fontSize: "14px",
      color: "#8C877E",
    });

    // 절취선 (양옆 반달 홈)
    const perf = css(mk("div", card), { position: "relative", height: "16px" });
    css(mk("div", perf), {
      position: "absolute",
      left: "14px",
      right: "14px",
      top: "7px",
      borderTop: "1.5px dashed #C8C1B3",
    });
    ["left", "right"].forEach((side) =>
      css(mk("div", perf), {
        position: "absolute",
        [side]: "-8px",
        top: "0",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        background: "rgba(17,17,19,0.85)",
      }),
    );

    const edits = []; // 고칠 수 있는 관람평들 { q, el }
    const memoEdits = []; // 고칠 수 있는 회차 메모들 { i, el }
    let dirty = false;
    if (!document.getElementById("rv-edit-css")) {
      const st = document.createElement("style");
      st.id = "rv-edit-css";
      st.textContent =
        ".rv-edit:empty::before{content:attr(data-ph);color:#B9B1A2}" +
        ".rv-edit:hover{background:rgba(23,23,26,.05)}" +
        ".rv-edit:focus{background:rgba(23,23,26,.06)}";
      document.head.appendChild(st);
    }
    // 저장: 글자가 바뀐 회차만 (한글 입력 중인 마지막 글자까지 그대로 읽음)
    const saveAll = (quiet) => {
      let changed = false;
      edits.forEach(({ q, el }) => {
        const t = q.now ? d : q;
        const v = el.innerText.replace(/\n+$/, "").trim();
        if (v !== (t.review || "")) {
          t.review = v;
          changed = true;
        }
      });
      memoEdits.forEach(({ i, el }) => {
        const v = el.innerText.replace(/\n+$/, "").trim();
        if (v !== (d.notes[i] || "")) {
          if (v) d.notes[i] = v;
          else delete d.notes[i]; // 비우면 그 화 메모 지움
          changed = true;
        }
      });
      dirty = false;
      if (!changed) return false;
      setAndSave(d, {});
      if (!quiet) toast("저장했어요");
      return true;
    };
    panelBeforeClose = () => saveAll(false); // ✕ · 바깥 톡으로 닫아도 고친 건 저장
    // 관람평: 1회차부터 차례로 (감상 카드와 같은 순서) · 왼쪽 회차 꼬리표 | 오른쪽 쓴 그대로 + 그때 평점
    const body = css(mk("div", card), {
      padding: "4px 18px 0",
      display: "flex",
      flexDirection: "column",
    });
    ws.slice().forEach((q, k) => {
      const item = css(mk("div", body), {
        display: "flex",
        gap: "12px",
        padding: "12px 0",
        borderTop: k ? "1px dotted #CFC7B8" : "none",
      });
      css(mk("span", item, q.label || "1회차"), {
        flexShrink: "0",
        alignSelf: "flex-start",
        padding: "2px 8px",
        borderRadius: "9px",
        fontSize: "11px",
        fontWeight: "700",
        background: q.now ? acc : "#E2DBCD",
        color: INK,
      });
      const col = css(mk("div", item), {
        flex: "1",
        minWidth: "0",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      });
      // 관람평: 보이는 그대로 바로 눌러서 고침 (글 칸이 따로 안 생김 · 아래 '저장' = 다 저장)
      const txt = css(mk("p", col), {
        margin: "0",
        whiteSpace: "pre-wrap",
        fontSize: "14px",
        lineHeight: "1.6",
        color: q.now ? INK : "#4A4640",
        cursor: "text",
      });
      mk("span", txt, "“");
      const ed = mk("span", txt, q.review || "", "rv-edit");
      ed.elt.contentEditable = "true";
      ed.elt.spellcheck = false;
      ed.elt.dataset.ph = "관람평 없음 · 눌러서 쓰기";
      css(ed, { outline: "none", borderRadius: "3px" });
      mk("span", txt, "”");
      txt.elt.addEventListener("click", (e) => {
        if (e.target !== ed.elt) {
          ed.elt.focus();
          const r = document.createRange();
          r.selectNodeContents(ed.elt);
          r.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
        }
      });
      ed.elt.addEventListener("input", () => {
        if (ed.elt.textContent.length > REVIEW_MAX)
          ed.elt.textContent = ed.elt.textContent.slice(0, REVIEW_MAX);
        dirty = true;
      });
      edits.push({ q, el: ed.elt });
      const sc = (q.scores || []).filter((v) => v !== null && v !== undefined);
      const avg = sc.length
        ? Math.round((sc.reduce((a, b) => a + b, 0) / sc.length) * 10)
        : null;
      const meta = [
        q.rating ? `★ ${q.rating}` : "",
        avg !== null ? `회차 평균 ${avg}/10` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      const mrow = css(mk("div", col), {
        display: "flex",
        alignItems: "center",
        gap: "10px",
      });
      if (meta)
        css(mk("p", mrow, meta), {
          margin: "0",
          fontSize: "11px",
          color: "#8C877E",
        });
      // 고치기: 누르면 위 관람평 끝에 커서 (글자를 바로 눌러도 됨)
      const eb = css(mk("button", mrow, q.review ? "고치기" : "쓰기"), {
        border: "none",
        background: "transparent",
        color: "#8C877E",
        fontSize: "11px",
        textDecoration: "underline",
        cursor: "pointer",
        padding: "0",
        minHeight: "0",
      });
      eb.elt.addEventListener("click", () => {
        ed.elt.focus();
        const r = document.createRange();
        r.selectNodeContents(ed.elt);
        r.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      });
    });

    // 회차 메모: 티켓 색으로 눈에 띄게 (EP 번호 = 티켓 색 꼬리표 · 메모 = 진한 글씨)
    const notes = Object.keys(d.notes)
      .map(Number)
      .filter((i) => i < d.eps)
      .sort((a, b) => a - b);
    if (notes.length) {
      const tint = lerpColor(color(acc), color(PAPER), 0.78).toString(
        "#rrggbb",
      );
      const mb = css(mk("div", card), {
        margin: "4px 18px 0",
        padding: "12px 14px",
        borderRadius: "10px",
        background: tint,
        borderLeft: `4px solid ${acc}`,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      });
      // 머리줄: EP MEMO · 개수 | 오른쪽 '고치기' 하나 (누르면 첫 메모 끝에 커서 · 메모 글자를 바로 눌러도 됨)
      const mh = css(mk("div", mb), {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
      });
      css(mk("p", mh, `EP MEMO · ${notes.length}`), {
        margin: "0",
        fontFamily: LABF,
        fontSize: "15px",
        letterSpacing: "0.06em",
        color: INK,
      });
      const mfix = css(mk("button", mh, "고치기"), {
        border: "none",
        background: "transparent",
        color: "#6B665E",
        fontSize: "11px",
        textDecoration: "underline",
        cursor: "pointer",
        padding: "0",
        minHeight: "0",
      });
      const memoEls = [];
      mfix.elt.addEventListener("click", () => {
        const el = memoEls[0];
        if (!el) return;
        el.focus();
        const r = document.createRange();
        r.selectNodeContents(el);
        r.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      });
      notes.forEach((i) => {
        const row = css(mk("div", mb), {
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        });
        css(mk("span", row, `EP ${String(i + 1).padStart(2, "0")}`), {
          flexShrink: "0",
          padding: "1px 8px",
          borderRadius: "6px",
          background: acc,
          fontFamily: LABF,
          fontSize: "15px",
          lineHeight: "1.4",
          color: INK,
        });
        const me = css(mk("span", row, d.notes[i], "rv-edit"), {
          fontSize: "14px",
          lineHeight: "1.5",
          fontWeight: "500",
          color: INK,
          whiteSpace: "pre-wrap",
          outline: "none",
          borderRadius: "3px",
          flex: "1",
          minWidth: "0",
          cursor: "text",
        });
        me.elt.contentEditable = "true";
        me.elt.spellcheck = false;
        me.elt.dataset.ph = "(비우면 이 메모는 지워져요)";
        memoEls.push(me.elt);
        memoEdits.push({ i, el: me.elt });
      });
    }

    // 버튼
    const row = css(mk("div", card), {
      display: "flex",
      gap: "8px",
      padding: "14px 18px 16px",
    });
    const b1 = css(mk("button", row, "티켓 열기"), {
      minHeight: "40px",
      padding: "0 16px",
      borderRadius: "20px",
      border: `1.5px solid ${INK}`,
      background: "transparent",
      color: INK,
      fontSize: "13px",
      fontWeight: "700",
      cursor: "pointer",
    });
    b1.elt.addEventListener("click", () => {
      closePanel(); // (닫으면서 고친 관람평 저장)
      openTicket(d);
    });
    const b2 = css(mk("button", row, "저장"), {
      flex: "1",
      minHeight: "40px",
      borderRadius: "20px",
      border: "none",
      background: INK,
      color: PAPER,
      fontSize: "13px",
      fontWeight: "700",
      cursor: "pointer",
    });
    // 누르는 순간 바로 (한글 입력 중이면 첫 클릭이 '글자 확정'에 먹혀서 두 번 눌러야 했음)
    b2.elt.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // 위에서 고친 관람평을 저장하고 창 닫기 (티켓으로는 안 넘어감)
      saveAll(false);
      closePanel();
    });
  });
}

// ▶ openAll — 모든 감상: 볼 때마다 남긴 감상을 최근 순서로
function openAll(d) {
  openCard((card) => {
    cardTop(
      card,
      `ALL REVIEWS · ${d.watchLabel || watches(d).length + "회차"}까지`,
    );
    mk("p", card, d.title, "big");
    watches(d)
      .slice()
      .reverse()
      .forEach((q) => {
        const box = mk("div", card, null, "quote");
        box.elt.style.borderColor = q.now ? accentOf(d) : "#3a3a3f";
        const t = mk("p", box, q.review ? `“${q.review}”` : "(관람평 없음)");
        t.elt.style.whiteSpace = "pre-wrap";
        if (!q.review) t.elt.style.opacity = 0.5;
        const sc = q.scores.filter((v) => v !== null && v !== undefined);
        const avg = sc.length
          ? Math.round((sc.reduce((a, b) => a + b, 0) / sc.length) * 10)
          : null;
        mk(
          "span",
          box,
          [
            `${q.label}${q.now ? " (지금)" : ""}`,
            q.rating ? `★${q.rating}` : "",
            avg !== null ? `회차 평균 ${avg}/10` : "",
            q.upTo ? `${q.upTo}화까지` : "",
          ]
            .filter(Boolean)
            .join(" · "),
        );
      });
  });
}

// ▶ openFolderCard — 폴더 만들기 / 고치기: 이름 · 색 (seed = 처음 넣을 티켓들)
// ▶ deleteFolder — 폴더 지우기 (안의 티켓은 그대로) · 알림을 누르면 되돌리기
function deleteFolder(st) {
  const i = data.sets.indexOf(st);
  if (i < 0) return;
  data.sets.splice(i, 1);
  saveData();
  folderSel = null;
  toast(
    `'${st.name}' 폴더를 지웠어요 (티켓은 그대로) · 눌러서 되돌리기`,
    () => {
      data.sets.splice(i, 0, st);
      saveData();
    },
  );
}

// ▶ openAddToFolder — 연 폴더에 바로 티켓 넣기: 아직 안 든 티켓을 포스터로 골라서 (여러 장 한 번에)
function openAddToFolder(f) {
  openCard((card) => {
    // 폴더 만들기 창과 같은 모양: 크림색 티켓 · 위 띠 = 폴더 색 · 작은 포스터 칸
    ticketSkin(card, f.color);
    card.elt.style.maxWidth = "520px";
    cardTop(card, "ADD TICKETS");
    mk("p", card, f.name, "big");
    mk(
      "p",
      card,
      "고른 티켓이 이 폴더에 들어가요 (다른 폴더에도 그대로 있어요)",
      "meta",
    );
    const q = mk("input", card, null, "field");
    q.elt.placeholder = "제목 · 연도 · 방송사로 찾기";
    const inIt = new Set(f.members.map((d) => d.id));
    const cand = data.dramas
      .filter((d) => d.title && !inIt.has(d.id))
      .sort((a, b) => (b.touched || 0) - (a.touched || 0));
    const picked = new Set();
    const lab = mk("p", card, "", "label");
    const gbox = mk("div", card);
    Object.assign(gbox.elt.style, {
      maxHeight: "38vh",
      overflowY: "auto",
      padding: "2px",
      borderRadius: "10px",
    });
    const grid = pickGrid(gbox, 76); // 작게 (한눈에 많이)
    const row = mk("div", card, null, "row");
    const ok = mk("button", row, "", "btn-main grow");
    const refresh = () => {
      lab.elt.textContent = `넣을 티켓 · ${picked.size}장 골랐어요`;
      ok.elt.textContent = picked.size
        ? `${picked.size}장 넣기`
        : "티켓을 골라요";
      ok.elt.disabled = !picked.size;
      ok.elt.style.opacity = picked.size ? 1 : 0.5;
    };
    const draw = () => {
      const t = q.elt.value.trim().toLowerCase().replace(/^#/, "");
      grid.elt.textContent = "";
      const list = cand.filter(
        (d) =>
          !t ||
          [d.title, d.en, d.year, d.network, kindOf(d)]
            .join(" ")
            .toLowerCase()
            .includes(t),
      );
      if (!list.length)
        mk(
          "p",
          grid,
          cand.length ? "찾는 티켓이 없어요" : "모든 티켓이 이미 들어 있어요",
          "meta",
        );
      list.forEach((d) => {
        const b = pickBtn(grid, d);
        if (picked.has(d.id)) b.elt.classList.add("on");
        b.elt.addEventListener("click", () => {
          if (picked.has(d.id)) picked.delete(d.id);
          else picked.add(d.id);
          b.elt.classList.toggle("on", picked.has(d.id));
          refresh();
        });
      });
    };
    q.elt.addEventListener("input", draw);
    ok.elt.addEventListener("click", () => {
      if (!picked.size) return;
      const ds = data.dramas.filter((d) => picked.has(d.id));
      f.st.ids.push(...ds.map((d) => d.id));
      saveData();
      closePanel();
      ds.forEach((d, k) => kick(d, (k % 2 ? -1 : 1) * 0.03)); // 새로 걸린 티켓이 살짝 흔들림
      toast(`'${f.name}'에 ${ds.length}장을 넣었어요`, () => {
        f.st.ids = f.st.ids.filter((id) => !picked.has(id));
        saveData();
      });
    });
    draw();
    refresh();
    setTimeout(() => q.elt.focus(), 50);
  });
}

function openFolderCard(st, seed) {
  openCard((card) => {
    ticketSkin(
      card,
      st ? st.color : ACCENTS[data.sets.length % ACCENTS.length],
    );
    card.elt.style.maxWidth = "520px";
    cardTop(card, st ? "MY FOLDER" : "NEW FOLDER");
    if (seed.length)
      mk(
        "p",
        card,
        seed.map((d) => `'${d.title}'`).join(" + ") +
          (seed.length > 1 ? " 을(를) 이어서 폴더로" : " 을(를) 새 폴더에"),
        "meta",
      );
    mk("p", card, "폴더 이름", "label");
    const name = mk("input", card, null, "field");
    name.elt.placeholder = "예: 비 오는 날 보는 드라마";
    name.elt.value = st ? st.name : "";
    // 추천 이름: 자주 쓰는 이름
    const chips = mk("div", card, null, "chips");
    FOLDER_NAMES.slice(0, 6).forEach((t) => {
      mk("button", chips, t).elt.addEventListener(
        "click",
        () => (name.elt.value = t),
      );
    });
    mk("p", card, "색", "label");
    const sw = mk("div", card, null, "swatches");
    let col = st ? st.color : ACCENTS[data.sets.length % ACCENTS.length];
    const sbs = ACCENTS.map((c) => {
      const b = mk("button", sw);
      b.elt.style.background = c;
      b.elt.setAttribute("aria-label", c);
      if (c === col) b.elt.classList.add("on");
      b.elt.addEventListener("click", () => {
        col = c;
        sbs.forEach((q) => q.elt.classList.toggle("on", q === b));
      });
      return b;
    });
    // 넣을 티켓 고르기: 포스터로 (찾기 칸 + 고른 것 먼저 · 목록은 상자 안에서만 스크롤)
    const picked = new Set(st ? st.ids : seed.map((d) => d.id));
    const lab = mk("p", card, "", "label");
    const q = mk("input", card, null, "field");
    q.elt.placeholder = "제목 · 연도 · 방송사로 찾기";
    const scroll = mk("div", card);
    Object.assign(scroll.elt.style, {
      maxHeight: "38vh",
      overflowY: "auto",
      padding: "2px",
      borderRadius: "10px",
    });
    const grid = pickGrid(scroll, 76); // 작게 (한눈에 많이)
    const order = data.dramas
      .filter((d) => d.title)
      .sort(
        (a, b) =>
          picked.has(b.id) - picked.has(a.id) ||
          (b.touched || 0) - (a.touched || 0),
      ); // 처음 열 때 이미 든 티켓이 앞에
    const drawPick = () => {
      lab.elt.textContent = `넣을 티켓 · ${picked.size}장 골랐어요`;
      const t = q.elt.value.trim().toLowerCase();
      grid.elt.textContent = "";
      const list = order.filter(
        (d) =>
          !t ||
          [d.title, d.en, d.year, d.network, kindOf(d)]
            .join(" ")
            .toLowerCase()
            .includes(t),
      );
      if (!list.length) mk("p", grid, "찾는 티켓이 없어요", "meta");
      list.forEach((d) => {
        const b = pickBtn(grid, d);
        if (picked.has(d.id)) b.elt.classList.add("on");
        b.elt.addEventListener("click", () => {
          if (picked.has(d.id)) picked.delete(d.id);
          else picked.add(d.id);
          b.elt.classList.toggle("on", picked.has(d.id));
          lab.elt.textContent = `넣을 티켓 · ${picked.size}장 골랐어요`;
        });
      });
    };
    q.elt.addEventListener("input", drawPick);
    drawPick();
    const row = mk("div", card, null, "row");
    mk("button", row, "저장", "btn-main grow").elt.addEventListener(
      "click",
      () => {
        const nm = name.elt.value.trim();
        if (!nm) return name.elt.focus();
        const ids = data.dramas
          .filter((d) => picked.has(d.id))
          .map((d) => d.id);
        if (st) {
          st.name = nm;
          st.color = col;
          st.ids = ids;
        } else {
          st = { id: "s" + Date.now(), name: nm, color: col, ids };
          data.sets.push(st);
          setView("folders");
          folderSel = st.id;
        }
        saveData();
        closePanel();
        toast(`'${nm}' 폴더`);
      },
    );
    setTimeout(() => name.elt.focus(), 50);
  });
}

/* =========================================================
   STARTER — 처음 여는 컴퓨터에서 보일 티켓 (내 일지에서 고른 76장 · 폴더 5개)
   저장된 게 없을 때만 쓰고, 그다음부터 고친 건 그 컴퓨터 브라우저에 따로 저장돼요
========================================================= */
const STARTER_ID = "75-1025b"; // STARTER를 새로 담으면 이 이름도 바꿈 → 모든 컴퓨터가 새 STARTER로 다시 시작
const STARTER = {
  dramas: [
    {
      id: "1792139551781c936",
      title: "나의 아저씨",
      en: "My Mister",
      tvId: 33840,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/150/375701.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/150/375701.jpg",
      year: "2018",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Family"],
        summary:
          "A man in his 40's withstands the weight of life. A woman in her 20's goes through different experiences, but also withstands the weight of her life. The man and woman get together to help each other.",
        premiered: "2018-03-21",
        ended: "2018-05-17",
      },
      kind: "휴먼",
      status: "done",
      upTo: 16,
      scores: [
        0.3,
        0.4,
        0.5,
        0.5,
        0.9,
        0.7,
        0.3,
        0.1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review:
        "깊이 있는 드라마고 연기력도 좋지만 드라마 자체가 너무 우울함 (이런 류의 드라마를 좋아한다면 추천)",
      rating: 5,
      keys: ["인생작", "눈물버튼", "여운"],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792673980814,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1792681207847,
      infoTried: true,
    },
    {
      id: "1792139551781956f",
      title: "눈물의 여왕",
      en: "Queen of Tears",
      tvId: 67633,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/507/1269260.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/507/1269260.jpg",
      year: "2024",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Romance"],
        summary:
          'Baek Hyun Woo, who is the pride of the village of Yongduri, is the legal director of the conglomerate Queens Group, while chaebol heiress Hong Hae In is the "queen" of Queens Group\'s department stores. Queen of Tears will tell the miraculous, thrilling, and humorous love story of this married couple, who manage to survive a crisis and stay together against all odds.',
        premiered: "2024-03-09",
        ended: "2024-04-28",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "김지원도 존예",
      rating: null,
      keys: ["설렘", "OST맛집"],
      liked: true,
      watchLabel: "4회차",
      watchStart: 1792167817257,
      history: [
        {
          label: "1회차",
          start: 1709996400000,
          end: 1712674800000,
          rating: 8,
          upTo: 16,
          scores: [
            0.7, 0.8, 0.7, 0.7, 0.8, 0.7, 0.9, 1, 0.8, 0.7, 0.7, 0.8, 0.7, 0.9,
            0.8, 0.9,
          ],
          review: "8화 엔딩 미쳤다. 중반은 좀 늘어짐",
        },
        {
          label: "2회차",
          start: 1791558000000,
          end: 1792167489619,
          scores: [
            0.8,
            0.8,
            0.7,
            0.8,
            0.9,
            0.8,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
          ],
          review: "",
          rating: 9,
          upTo: 16,
        },
        {
          label: "3회차",
          start: 1792167489619,
          end: 1792167817257,
          scores: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5],
          review: "김수현 존잘",
          rating: 9,
          upTo: 16,
        },
      ],
      notes: { 7: "엔딩 직전 대사" },
      times: { 7: "1:08:30" },
      savedAt: 1792139551781,
      touched: 1792682027676,
      infoTried: true,
    },
    {
      id: "17921395517819aee",
      title: "정년이",
      en: "Jeongnyeon: The Star Is Born",
      tvId: 79498,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/535/1337651.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/535/1337651.jpg",
      year: "2024",
      network: "tvN",
      eps: 12,
      info: {
        genres: ["Drama", "Music"],
        summary:
          "Jeong Nyeon has no money or education, but she is a Mokpo girl with a talent for singing! Her dream is to join a women's traditional theater company, and make it big. But she has a lot to learn and a long way to go before becoming a lead actor. Will Jeong Nyeon achieve her dream of becoming a big star and getting rich?",
        premiered: "2024-10-12",
        ended: "2024-11-17",
      },
      kind: "휴먼",
      status: "watching",
      upTo: 8,
      scores: [0.6, 0.7, 0.6, 0.8, 0.9, 0.7, 0.8, 0.6, null, null, null, null],
      review: "",
      rating: null,
      keys: ["성장"],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: { 3: "첫 무대, 소름" },
      times: { 3: "52:10" },
      savedAt: 1792139551781,
      touched: 1792926997908,
      infoTried: true,
    },
    {
      id: "179213955178193ea",
      title: "선재 업고 튀어",
      en: "Lovely Runner",
      tvId: 75084,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/510/1276542.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/510/1276542.jpg",
      year: "2024",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Comedy", "Fantasy", "Romance"],
        summary:
          "Im Sol is devastated by the sudden and tragic death of her idol Ryu Sun-Jae, a former swimmer turned K-pop star. But in the midst of her grief, she magically travels back to 2008 - when Sun-Jae was only 19 years old! Sol is delighted that she can help him escape his sad future fate, and makes it her mission to change the future ... and maybe even find true love in the process. Will her attempts to change the course of the past succeed - or could they have unexpected consequences?",
        premiered: "2024-04-08",
        ended: "2024-05-28",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        0.8, 0.9, 0.7, 0.8, 0.7, 0.8, 0.9, 1, 0.8, 0.7, 0.8, 0.9, 0.7, 0.8, 0.9,
        1,
      ],
      review: "비 오는 날 우산 장면 = 레전드",
      rating: 9,
      keys: ["설렘", "OST맛집"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: { 7: "타임슬립 반전" },
      times: {},
      savedAt: 1792139551781,
      touched: 1792211243698,
      infoTried: true,
    },
    {
      id: "1792139551781a01d",
      title: "폭싹 속았수다",
      en: "When Life Gives You Tangerines",
      tvId: 74399,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/553/1383936.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/553/1383936.jpg",
      year: "2025",
      network: "Netflix",
      eps: 16,
      info: {
        genres: ["Drama", "Romance"],
        summary:
          "In Jeju, a spirited girl and a steadfast boy's island story blossoms into a lifelong tale of setbacks and triumphs --- proving love endures across time.",
        premiered: "2025-03-07",
        ended: "2025-03-28",
      },
      kind: "가족",
      status: "done",
      upTo: 16,
      scores: [
        0.8, 0.8, 0.9, 1, 0.8, 0.8, 0.7, 0.9, 0.8, 0.8, 0.9, 1, 0.8, 0.8, 0.9,
        0.9,
      ],
      review: "휴지 필수. 엄마한테 전화하게 되는 드라마",
      rating: 10,
      keys: ["인생작", "눈물버튼"],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1792139551781,
      infoTried: true,
    },
    {
      id: "1792139551781d3bd",
      title: "무빙",
      en: "Moving",
      tvId: 64111,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/472/1181779.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/472/1181779.jpg",
      year: "2023",
      network: "Disney+",
      eps: 20,
      info: {
        genres: ["Drama", "Action", "Fantasy"],
        summary:
          "Set in modern-day Korea, Moving tells the story of a group of superpowered individuals who hide their true abilities from the world in order to protect their families from harm and exploitation.",
        premiered: "2023-08-09",
        ended: "",
      },
      kind: "판타지",
      status: "watching",
      upTo: 12,
      scores: [
        0.7,
        0.7,
        0.6,
        0.6,
        0.7,
        0.8,
        0.9,
        0.7,
        0.9,
        1,
        0.8,
        0.7,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: ["도파민", "밤샘정주행"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1792139551781,
      infoTried: true,
    },
    {
      id: "17921395517812c42",
      title: "비밀의 숲",
      en: "Stranger",
      tvId: 28517,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/265/662957.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/265/662957.jpg",
      year: "2017",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Crime", "Mystery", "Legal"],
        summary:
          "Though he is rational, a childhood brain surgery leaves prosecutor Hwang Shi Mok to lack emotion. Cold and lonely, he's one of the only prosecutors not involved in corruption. When he meets Police Lieutenant Han Yeo Jin at a murder crime scene, they join forces to eradicate corruption at the prosecutor's office and solve a serial murder case.",
        premiered: "2017-06-10",
        ended: "2020-10-04",
      },
      kind: "스릴러",
      status: "watching",
      upTo: 1,
      scores: [
        1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1792673386635,
      infoTried: true,
    },
    {
      id: "1792139551781f9d4",
      title: "미스터 션샤인",
      en: "Mr. Sunshine",
      tvId: 33837,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/159/399228.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/159/399228.jpg",
      year: "2018",
      network: "tvN",
      eps: 24,
      info: {
        genres: ["Drama", "Romance", "History"],
        summary:
          "During the United States expedition to Joseon in 1871, a boy from Joseon boards an American warship and goes to America. As an adult, he returns to his home country as an American soldier stationed in the country",
        premiered: "2018-07-07",
        ended: "2018-09-30",
      },
      kind: "사극",
      status: "done",
      upTo: 24,
      scores: [
        0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.6, 0.8, 0.7,
        0.6, 0.6, 0.4, 0.4, 0.4, 0.2, 0.8, 0.8, 0.6, 0.3,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1792670596456,
      infoTried: true,
    },
    {
      id: "1792139551781c144",
      title: "응답하라 1988",
      en: "Reply 1988",
      tvId: 7269,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/27/67574.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/27/67574.jpg",
      year: "2015",
      network: "tvN",
      eps: 20,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "A drama about a small cluster of neighboring families set in 1988.",
        premiered: "2015-11-06",
        ended: "2016-01-16",
      },
      kind: "코미디",
      status: "done",
      upTo: 20,
      scores: [
        0.2,
        0.2,
        0.1,
        0.1,
        0.1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 10,
      keys: ["인생작", "가족", "힐링"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1792671916163,
      infoTried: true,
    },
    {
      id: "1792139551781d3cd",
      title: "도깨비",
      en: "Guardian: The Lonely and Great God",
      tvId: 16150,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/532/1330901.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/532/1330901.jpg",
      year: "2016",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Fantasy", "Romance"],
        summary:
          "Guardians are always whom we fear. Surely not this time. A guardian living in Seoul in 2016 is the sexiest chick magnet. More than a hundred years old in reality, he hangs out with the young. But not many people know that he is hollow inside. He has been searching for the ‘goblin bride' for decades, but she is no where to be found. Then one day, he keeps getting summoned by Eun-tak. There, he sees the Reaper, not knowing that they are to become roommates. That's where the story begins. A Goblin, trying to protect a girl who should have been dead a long time ago. A Reaper, desperately wanting to take the girl to complete his task.",
        premiered: "2016-12-02",
        ended: "2017-01-21",
      },
      kind: "판타지",
      status: "done",
      upTo: 16,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 9,
      keys: ["설렘", "OST맛집"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1789461151781,
      infoTried: true,
    },
    {
      id: "179213955178157b3",
      title: "슬기로운 감빵생활",
      en: "Prison Playbook",
      tvId: 33280,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/134/336265.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/134/336265.jpg",
      year: "2017",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Comedy"],
        summary:
          "Prison Playbook is a black comedy in which we follow a baseball player and a variety of people experience prison life. The drama will share the lives and stories behind these prisoners as well as events that take place there.",
        premiered: "2017-11-22",
        ended: "2018-01-18",
      },
      kind: "휴먼",
      status: "done",
      upTo: 16,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 9,
      keys: ["힐링", "밤샘정주행"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1789374751781,
      infoTried: true,
    },
    {
      id: "179213955178142c3",
      title: "사랑의 불시착",
      en: "Crash Landing on You",
      tvId: 42756,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/235/588087.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/235/588087.jpg",
      year: "2019",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "Crash Landing on You follows a wealthy heiress named Yoon Se Ri, who, while paragliding, is forced to land in North Korea due to high winds. A North Korean officer named Ri Jung Hyuk hides and protects her, and in doing so, comes to love her",
        premiered: "2019-12-14",
        ended: "2020-02-16",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 9,
      keys: ["설렘"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1789288351781,
      infoTried: true,
    },
    {
      id: "179213955178166e2",
      title: "동백꽃 필 무렵",
      en: "When the Camellia Blooms",
      tvId: 41817,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/210/526021.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/210/526021.jpg",
      year: "2019",
      network: "KBS2",
      eps: 20,
      info: {
        genres: ["Comedy", "Romance", "Thriller"],
        summary:
          "When the Camellia Blooms tells the story of Dong Baek, owner of a bar named Camellia, whose life changes after she encounters three men including a good man, a bad man and a cheap man.",
        premiered: "2019-09-18",
        ended: "2019-11-21",
      },
      kind: "휴먼",
      status: "done",
      upTo: 20,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 10,
      keys: ["눈물버튼", "힐링"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1792587988193,
      infoTried: true,
    },
    {
      id: "17921395517817345",
      title: "슬기로운 의사생활",
      en: "Hospital Playlist",
      tvId: 46260,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/323/807792.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/323/807792.jpg",
      year: "2020",
      network: "tvN",
      eps: 12,
      info: {
        genres: ["Drama", "Medical"],
        summary:
          "In Hospital Playlist we follow the lives of five ordinary doctors who all attended the same medical school in 1999 are now friends and work together at the same hospital.",
        premiered: "2020-03-12",
        ended: "2021-09-16",
      },
      kind: "메디컬",
      status: "done",
      upTo: 12,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 9,
      keys: ["힐링", "OST맛집"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1789115551781,
      infoTried: true,
    },
    {
      id: "17921395517813fdf",
      title: "그 해 우리는",
      en: "Our Beloved Summer",
      tvId: 58766,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/376/941045.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/376/941045.jpg",
      year: "2021",
      network: "SBS",
      eps: 16,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "A romance comedy that portrays the complicated feelings of a couple that breaks up saying, \"It was an awful time with you, and let's never meet again!\" However, the documentary they filmed 10 years ago in high school suddenly gains popularity, and they're forcibly brought together in front of the camera once more.",
        premiered: "2021-12-06",
        ended: "2022-01-25",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 8,
      keys: ["설렘", "여운"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1789029151781,
      infoTried: true,
    },
    {
      id: "1792139551781b879",
      title: "스물다섯 스물하나",
      en: "Twenty-Five Twenty-One",
      tvId: 59683,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/390/977086.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/390/977086.jpg",
      year: "2022",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Fantasy", "Romance"],
        summary:
          "Twenty-Five Twenty-One depicts a story from 1998 to 2021. In 1998, twenty-two and eighteen meet for the first time in an uneasy year as the whole world shook and called each others' name and when they became twenty-three and nineteen, they hurt each other. In the year of twenty-four and twenty, they relied on each other, and they loved only when they were twenty-five and twenty-one.",
        premiered: "2022-02-12",
        ended: "2022-04-03",
      },
      kind: "사극",
      status: "done",
      upTo: 16,
      scores: [
        1,
        0.9,
        0.9,
        0.9,
        0.9,
        0.9,
        0.8,
        0.8,
        0.6,
        0.6,
        0.4,
        0.1,
        0.1,
        0.1,
        null,
        null,
      ],
      review:
        "보면 볼수록 왜 저렇게 전개 했는지 이해가 안되는 작품 엄마 첫사랑 이야기를 읽는 딸..? 근데 그 첫사랑이 아빠는 아님",
      rating: 5,
      keys: ["설렘", "성장", "여운"],
      liked: true,
      watchLabel: "2회차",
      watchStart: 1792682109717,
      history: [
        {
          label: "1회차",
          start: 1792139551781,
          end: 1792682109717,
          scores: [
            0.9, 0.9, 0.9, 0.8, 0.8, 0.9, 0.9, 0.8, 0.9, 0.5, 0.5, 0.5, 0.3,
            0.1, 0.2, 0.1,
          ],
          review:
            "엔딩이 다 망치지 않았나 싶음 앞에 너무 청량하게 담겨서 엔딩이 2배 더 아쉬움",
          rating: 7,
          upTo: 16,
        },
      ],
      notes: { 15: "진짜 엔딩 뭐야?" },
      times: {},
      savedAt: 1792139551781,
      touched: 1792927412469,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792139551781f199",
      title: "나의 해방일지",
      en: "My Liberation Notes",
      tvId: 60691,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/397/993422.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/397/993422.jpg",
      year: "2022",
      network: "JTBC",
      eps: 16,
      info: {
        genres: ["Drama", "Family", "Romance"],
        summary:
          "It tells the story of three siblings who want to escape their stifling lives and a mysterious outsider who comes to their town.",
        premiered: "2022-04-09",
        ended: "2022-05-29",
      },
      kind: "휴먼",
      status: "done",
      upTo: 16,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 10,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792139551781,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792139551781,
      touched: 1788856351781,
      infoTried: true,
    },
    {
      id: "1792163557557d56b",
      title: "달의 연인",
      en: "",
      tvId: 18630,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/71/179341.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/71/179341.jpg",
      year: "2016",
      network: "SBS",
      eps: 16,
      info: {
        genres: ["Fantasy", "Romance", "History"],
        summary:
          "When a total eclipse of the sun takes place, a 21st century woman, Go Ha Jin, is transported back in time to the Goryeo Dynasty of Korea. She wakes up in the body of 16-year-old Hae Soo, an aristocrat living with Lady Hae, her cousin who happens to be married to one of the sons of King Taejo. She soon befriends several of the princes, who find her carefree and exuberant attitude refreshing. Although she knows she should not get involved in palace intrigues over the succession to the throne, she inadvertently becomes a pawn in the struggle, as several of the Princes fall in love with her.",
        premiered: "2016-08-29",
        ended: "2016-11-01",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        1, 1, 1, 1, 1, 1, 1, 0.9, 0.8, 0.8, 0.7, 0.7, 0.7, 0.7, 0.6, 0.4,
      ],
      review:
        "전반적으로 배우 라인업도 좋고 재미있으나 뒤로 갈수록 당황스럽게 어두워짐",
      rating: 10,
      keys: ["설렘", "여운"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792163557557,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792163557557,
      touched: 1792674343280,
      infoTried: true,
    },
    {
      id: "17921679891800c51",
      title: "악의 마음을 읽는 자들",
      en: "Through the Darkness",
      tvId: 59400,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/389/972574.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/389/972574.jpg",
      year: "2022",
      network: "SBS",
      eps: 12,
      info: {
        genres: ["Drama", "Thriller", "Mystery"],
        summary:
          "Through the Darkness is about a criminal profiler who struggles to read the minds of serial killers. Song Ha Young is a criminal profiler. He is calm and has charisma. He digs up cases and looks deeply into the human mind.",
        premiered: "2022-01-14",
        ended: "2022-03-12",
      },
      kind: "스릴러",
      status: "done",
      upTo: 12,
      scores: [0.3, 0.9, 1, 0.8, 0.6, 0.6, 0.9, 0.1, 0.1, 0.5, null, null],
      review: "",
      rating: 8,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792167989180,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792167989180,
      touched: 1792926864251,
      infoTried: true,
      draft: false,
    },
    {
      id: "17924576006707436",
      title: "100일의 거짓말",
      en: "100 Days of Deception",
      tvId: 90249,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/645/1613484.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/645/1613484.jpg",
      year: "2026",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Action", "Romance", "Thriller"],
        summary:
          'Set in Gyeongseong during the Japanese colonial period, the drama follows Ga Gyeong, the city\'s most talented pickpocket, who strikes a dangerous deal with the independence army and goes undercover at the Japanese Government-General of Joseon. Disguised as an employee, she is tasked with acting as a "fake spy" for just 100 days, but her mission slowly turns her into a real informant caught between survival, loyalty, and conviction.',
        premiered: "2026-10-10",
        ended: "",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        1,
        0.8,
        0.9,
        0.8,
        0,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "미스터 선샤인이랑 비교해서 보면 재미있을 거같음",
      rating: 8,
      keys: ["재밋음"],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792457600670,
      history: [],
      notes: { 0: "아직까진 재미있음" },
      times: {},
      savedAt: 1792457600670,
      touched: 1792674203080,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792588910246db41",
      title: "엄마친구아들",
      en: "Love Next Door",
      tvId: 74044,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/529/1324853.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/529/1324853.jpg",
      year: "2024",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Comedy", "Romance"],
        summary:
          "A romantic comedy that tells the story of a woman trying to reboot her life after making mistakes, and her mother's friend's son, who is her living dark side.",
        premiered: "2024-08-17",
        ended: "2024-10-06",
      },
      kind: "로맨스",
      status: "want",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792588910246,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792588910246,
      touched: 1792911102859,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792589033348db7a",
      title: "우리들의 블루스",
      en: "Our Blues",
      tvId: 60704,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/399/998175.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/399/998175.jpg",
      year: "2022",
      network: "tvN",
      eps: 20,
      info: {
        genres: ["Drama", "Family", "Romance"],
        summary:
          "An omnibus-style drama that tells the sweet, sour, and bitter life stories of diverse characters in the setting of Jeju Island.",
        premiered: "2022-04-09",
        ended: "2022-06-12",
      },
      kind: "휴먼",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792589033348,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792589033348,
      touched: 1792589044148,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926704749126ca1",
      title: "프로듀사",
      en: "The Producers",
      tvId: 10308,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/464/1162337.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/464/1162337.jpg",
      year: "2015",
      network: "KBS2",
      eps: 12,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "All-night meetings, nonstop stress and action. That's the life of a television variety show producer trying to put together a hit show and gain ratings while handling pressures from difficult stars and corporate executives who breathe down their necks. Baek Seung Chan is a fresh new producer-director (PD) who gave up law school to work in the exciting variety show division of a major television network. He works alongside the more seasoned veteran PDs Tak Ye Jin, a no-nonsense hot-shot who gets things done her way, and Ra Joon Mo, who is still waiting for his breakout hit series. As they work with temperamental stars like Cindy, a famous singer, can the PDs please everybody and get their jobs done?",
        premiered: "2015-05-15",
        ended: "2015-06-20",
      },
      kind: "코미디",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670474912,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670474912,
      touched: 1792670474912,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670489186222e",
      title: "오 나의 귀신님",
      en: "Oh My Ghost",
      tvId: 7139,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/460/1150603.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/460/1150603.jpg",
      year: "2015",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "Na Bong-sun has an extremely timid personality and low self-esteem, doesn't have any close friends, and is constantly getting reprimanded at her job as an assistant chef at Sun Restaurant. She also occasionally sees ghosts, thanks to a shaman grandmother. One day, Bong-sun gets possessed by a lustful virgin ghost named Shin Soon-ae. To make up for the lack of romance in her short life and believing that only by losing her virginity will she be able to \"resolve her grudge\" and move on to the afterlife, Soon-ae is determined to seduce as many men as she can by possessing various women, and she finds the perfect vessel in Bong-sun.Bong-sun's boss is arrogant star chef Kang Sun-woo, whom she secretly has a crush on. Sun-woo hasn't dated anyone since getting his heart broken by his college friend Lee So-hyung, who's now a TV producer. But when Bong-sun seemingly gets rid of her shyness and suddenly changes into a confident, dynamic woman, she finally catches his eye. Meanwhile, the mystery surrounding Soon-ae's death involves Sun-woo's brother-in-law, kindly police officer Choi Sung-jae who may not be what he seems.",
        premiered: "2015-07-03",
        ended: "2015-08-22",
      },
      kind: "판타지",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670489186,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670489186,
      touched: 1792670493451,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670496721d5c9",
      title: "육룡이 나르샤",
      en: "Six Flying Dragons",
      tvId: 6201,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/23/59874.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/23/59874.jpg",
      year: "2015",
      network: "SBS",
      eps: 50,
      info: {
        genres: ["Drama", "Action", "History"],
        summary:
          "A period drama that depicts the ambitions and success stories of six people with Lee Bang Won as the central figure. Lee Bang Won was the third king in the Joseon Dynasty. He helped his father King Taejo establish the Joseon Dynasty.",
        premiered: "2015-10-05",
        ended: "2016-03-22",
      },
      kind: "사극",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792670496721,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670496721,
      touched: 1792670509304,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926705595275a26",
      title: "시크릿 가든",
      en: "Secret Garden",
      tvId: 3733,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/19/47635.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/19/47635.jpg",
      year: "2010",
      network: "SBS",
      eps: 20,
      info: {
        genres: ["Drama", "Comedy", "Fantasy"],
        summary:
          "Kim Joo-won is the arrogant, eccentric heir to a large company who is poised to inherit a large department store. He constantly rejects the girls his matchmaking mother sends his way. When he meets Gil Ra-im, a beautiful, driven stunt-woman, she changes his life as he becomes fascinated by her strength and vulnerability.One day, a magical incident occurs and they find that they have switched bodies.",
        premiered: "2010-11-13",
        ended: "2011-01-16",
      },
      kind: "판타지",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792670559527,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670559527,
      touched: 1792670564123,
      infoTried: true,
      draft: false,
    },
    {
      id: "179267056674352b6",
      title: "장난스런 키스",
      en: "Mischievous Kiss",
      tvId: 16345,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/462/1157245.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/462/1157245.jpg",
      year: "2010",
      network: "MBC",
      eps: 16,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "Based on a Japanese manga, Mischievous Kiss centers on a slow-bubbling romance between a sunny student and her popular classmate",
        premiered: "2010-09-01",
        ended: "2010-10-21",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670566743,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670566743,
      touched: 1792670576192,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670582627037c",
      title: "성균관 스캔들",
      en: "Sungkyunkwan Scandal",
      tvId: 17318,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/582/1456535.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/582/1456535.jpg",
      year: "2010",
      network: "KBS1",
      eps: 20,
      info: {
        genres: ["Drama", "Comedy", "History"],
        summary:
          "Sungkyunkwan Scandal is set in Sungkyunkwan University in the late Joseon era during the reign of King Jeongjo, revolving around the exploits and love stories of four youths. When her younger brother's illness worsens and their family is in danger of being evicted from their house for lack of money, Kim Yoon Hee enters the school under his name, disguised as a boy in her desperation to support him. There, she becomes friends with the intelligent and upright Lee Sun Joon, the playboy Goo Yong Ha and rebellious Moon Jae Shin.",
        premiered: "2010-08-30",
        ended: "2010-11-02",
      },
      kind: "코미디",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670582627,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670582627,
      touched: 1792670588408,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670642554edbb",
      title: "김비서가 왜 그럴까",
      en: "What's Wrong with Secretary Kim",
      tvId: 36183,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/579/1449676.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/579/1449676.jpg",
      year: "2018",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Romance"],
        summary:
          "Lee Young's family runs a large firm in which Lee Young Joon works as vice-president. He is known to be rich, smart and handsome, but is known to be very arrogant. His secretary Kim Mi So, who works for them for many years, makes a decision which shocks him...",
        premiered: "2018-06-06",
        ended: "2018-07-26",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670642554,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670642554,
      touched: 1792670651012,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670652844ab86",
      title: "뷰티 인사이드",
      en: "The Beauty Inside",
      tvId: 38468,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/168/420067.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/168/420067.jpg",
      year: "2018",
      network: "jTBC",
      eps: 16,
      info: {
        genres: ["Drama", "Fantasy", "Romance"],
        summary:
          "Top actress Han Se Kye is known to be a troublemaker and object to many rumours. While her life is for many a mystery, she actually suffers an unusual phenomenon in which her appearance changes to a complete different person once every month. One day she bumps into Seo Do Jae, an executive of an airline. Even though Seo Do Jae is unable to recognize faces, he tries his best to hide his issue and to memorize people by their habits and mannerisms.",
        premiered: "2018-10-01",
        ended: "2018-11-20",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        0.6, 0.5, 0.3, 0.3, 0.4, 0.4, 0.5, 0.7, 0.9, 0.8, 0.8, 0.7, 0.8, 0.7,
        0.6, 0.6,
      ],
      review: "서브 커플이 더 재미있는 드라마 남주가 연기를 좀 못함",
      rating: 6,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670652844,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670652844,
      touched: 1792681318867,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670676207b4f3",
      title: "라이브",
      en: "Live",
      tvId: 33835,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/146/366150.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/146/366150.jpg",
      year: "2018",
      network: "tvN",
      eps: 18,
      info: {
        genres: ["Drama", "Thriller"],
        summary:
          "This is a drama which focus on the daily ins and outs of police officers who work as civil servants and peacekeepers.",
        premiered: "2018-03-10",
        ended: "2018-05-06",
      },
      kind: "휴먼",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670676207,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670676207,
      touched: 1792670677628,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670701226f818",
      title: "더 글로리 파트2",
      en: "The Glory",
      tvId: 65502,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/433/1084564.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/433/1084564.jpg",
      year: "2023",
      network: "Netflix",
      eps: 16,
      info: {
        genres: ["Drama", "Thriller", "Mystery"],
        summary:
          "Moon Dong Eun had to drop out of school because of school violence. Since then, she has lived with thoughts of revenge. Years later, her main abuser got married and gave birth to a child. The former victim becomes this child's homeroom teacher when he goes to elementary school. So begins her long and difficult path of revenge. It targets not only the main offender, but also all those who watched the violence, but did nothing. Joo Ye Jung is a carefree and smiling guy. Instead of being the fairy prince Dong Eun, he decides to become the means of her revenge.",
        premiered: "2022-12-30",
        ended: "2023-03-10",
      },
      kind: "스릴러",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792670701226,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670701226,
      touched: 1792769242797,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670712921fcb8",
      title: "구미호뎐",
      en: "Tale of the Nine Tailed",
      tvId: 49996,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/454/1135598.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/454/1135598.jpg",
      year: "2020",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Thriller", "Supernatural"],
        summary:
          "Tale of the Nine Tailed follows the life of the gumiho, who once ruled as a living god of the Baekdudaegan Mountain Range but now works as a sort of public official between this world and the underworld. His main job is to clean up the mess left behind by those who disturb the world of the living while hiding behind the guise of ghost tales.",
        premiered: "2020-10-07",
        ended: "2023-06-11",
      },
      kind: "스릴러",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670712921,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670712921,
      touched: 1792670715707,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926707245382912",
      title: "마스크걸",
      en: "Mask Girl",
      tvId: 66448,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/481/1202584.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/481/1202584.jpg",
      year: "2023",
      network: "Netflix",
      eps: 7,
      info: {
        genres: ["Drama", "Crime", "Thriller"],
        summary:
          "An office worker who is insecure about her looks becomes a masked internet personality by night --- until a chain of ill-",
        premiered: "2023-08-18",
        ended: "2023-08-18",
      },
      kind: "스릴러",
      status: "watching",
      upTo: 0,
      scores: [null, null, null, null, null, null, null],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670724538,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670724538,
      touched: 1792670726960,
      infoTried: true,
      draft: false,
    },
    {
      id: "179267072838832d7",
      title: "킹더랜드",
      en: "King the Land",
      tvId: 64352,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/461/1153424.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/461/1153424.jpg",
      year: "2023",
      network: "JTBC",
      eps: 16,
      info: {
        genres: ["Comedy", "Romance"],
        summary:
          "Set in the backdrop of a hotelier's dream, the VVIP business lounge 'King the Land', it depicts the story of a man who cannot withstand a fake smile and a woman who always has to smile brightly.",
        premiered: "2023-06-17",
        ended: "2023-08-06",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670728388,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670728388,
      touched: 1792670731528,
      infoTried: true,
      draft: false,
    },
    {
      id: "179267073389699d3",
      title: "경이로운 소문",
      en: "The Uncanny Counter",
      tvId: 51521,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/470/1175302.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/470/1175302.jpg",
      year: "2020",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Action", "Supernatural"],
        summary:
          'The Uncanny Counter is about demon hunters called "Counters" who come to Earth and disguise themselves as employees at a noodle restaurant in order to capture evil spirits.',
        premiered: "2020-11-28",
        ended: "2023-09-03",
      },
      kind: "스릴러",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670733896,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670733896,
      touched: 1792671367118,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926707434908b27",
      title: "악귀",
      en: "Revenant",
      tvId: 66009,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/463/1159188.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/463/1159188.jpg",
      year: "2023",
      network: "SBS",
      eps: 12,
      info: {
        genres: ["Thriller", "Mystery", "Supernatural"],
        summary:
          "Outside the door is a different world. When you open the door, there is a demon there. This is an occult mystery thriller in which a woman possessed by a demon and a man who can see the demon dig into the mysterious death surrounding five bodies.",
        premiered: "2023-06-23",
        ended: "2023-07-29",
      },
      kind: "스릴러",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670743490,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670743490,
      touched: 1792670745910,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670749182c07b",
      title: "퀸메이커",
      en: "Queenmaker",
      tvId: 66447,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/456/1141980.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/456/1141980.jpg",
      year: "2023",
      network: "Netflix",
      eps: 11,
      info: {
        genres: ["Drama", "Legal"],
        summary:
          "Strategy. Influence. Corruption. An unlikely pair of accomplished women joins forces to go up against a powerful conglomerate for the mayorship of Seoul.",
        premiered: "2023-04-14",
        ended: "",
      },
      kind: "휴먼",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670749182,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670749182,
      touched: 1792670753612,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670755482279d",
      title: "연인",
      en: "My Dearest",
      tvId: 70147,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/486/1215120.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/486/1215120.jpg",
      year: "2023",
      network: "MBC",
      eps: 21,
      info: {
        genres: ["Drama", "Romance", "History"],
        summary:
          "A love-story between a noble woman and a mysterious man who shows up in her hometown set in the 1600s during the Qing invasion. Yu Gil Chae is a pretty, bubbly and a bit spoiled young lady who's named as the 99 tailed fox of Neunggun-ri. She is a bit of an outcast too because other young ladies are jealous of her. They seem to think she's too straight forward and her behavior is inappropriate for a young lady while young noble men think highly of her. Gil Chae knows how to get men to fall for her but fails to capture the heart of the person she likes. Lee Jang Hyun is a mysterious man who suddenly appears in the Neunggun-ri social scene one day. Nobody really knows about him. Young nobles don't like him while he has elderly people wrapped around his finger. He's been dating around a lot but becomes curious about a certain 99 tailed fox. And one day, the said fox crash lands to his arm literally. With the brewing war, the pair find themselves separated even before they start to make sense of their feelings.",
        premiered: "2023-08-04",
        ended: "2023-11-18",
      },
      kind: "사극",
      status: "done",
      upTo: 21,
      scores: [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.8, 0.9, 0.7, 0.7, 0.9, 1, 0.9, 0.5,
        0.6, 0.6, 0.3,
      ],
      review: "",
      rating: 8,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792670755482,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670755482,
      touched: 1792926598269,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926707607926804",
      title: "일타 스캔들",
      en: "Crash Course in Romance",
      tvId: 64231,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/434/1087175.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/434/1087175.jpg",
      year: "2023",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Comedy", "Romance"],
        summary:
          "A romantic comedy between Nam Haeng-seon, the owner of a side dish shop who belatedly enters the entrance exam hell, and Choi Chi-yeol, a one-shot instructor who becomes a star in Korea's No. 1 private education.",
        premiered: "2023-01-14",
        ended: "2023-03-05",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670760792,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670760792,
      touched: 1792670765188,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670766754b1d1",
      title: "나쁜 엄마",
      en: "The Good Bad Mother",
      tvId: 66735,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/454/1136784.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/454/1136784.jpg",
      year: "2023",
      network: "jTBC",
      eps: 14,
      info: {
        genres: ["Drama", "Comedy", "Crime"],
        summary:
          'A single mom who has been widowed at a young age, Yeong-soon runs a pig farm, and raises her son Kang-ho by herself. She becomes a "bad mother" - hard on her son because she doesn\'t want him to grow up penniless nor powerless. Thanks to her discipline, Kang-ho grows up to be a prominent prosecutor, but loses his memory due to an unfortunate accident and becomes a 7-year-old again. Young-soon decides to become a "bad mother" again for Kang-ho in this comforting and touching comedy series that tracks the journey of recovery between mother and son.',
        premiered: "2023-04-26",
        ended: "2023-06-08",
      },
      kind: "스릴러",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792670766754,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670766754,
      touched: 1792670769893,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926708374667a29",
      title: "수상한 파트너",
      en: "Suspicious Partner",
      tvId: 26157,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/111/278231.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/111/278231.jpg",
      year: "2017",
      network: "SBS",
      eps: 40,
      info: {
        genres: ["Comedy", "Romance", "Thriller"],
        summary:
          "A forgetful killer can be a dangerous thing. Noh Ji Wook is a prosecutor who changes jobs to become a private attorney at a powerful law firm. Meanwhile, Eun Bong Hee is a prosecutor trainee who works with prosecutor Cha Yoo Jung, Ji Wook's ex-girlfriend who desperately wants to win him back. Attorney Ji Eun Hyuk is a longtime family friend of Ji Wook's but harbors some resentment about their different family circumstances.When a murderer strikes, Bong Hee suddenly finds herself as a suspect in the murder. But it appears the real killer has amnesia, and the killer keeps coming after Bong Hee and Ji Wook. Can the two team up to catch the forgetful killer?",
        premiered: "2017-05-10",
        ended: "2017-07-13",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670837466,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670837466,
      touched: 1792670841104,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926708426062bd0",
      title: "사랑의 온도",
      en: "Temperature of Love",
      tvId: 31524,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/127/318286.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/127/318286.jpg",
      year: "2017",
      network: "SBS",
      eps: 40,
      info: {
        genres: ["Comedy", "Romance"],
        summary:
          'Lee Hyun Soo is an aspiring drama series writer. She uses "Jane" as her username and begins chatting online with username "Good Soup" who is actually Ohn Jung Sun. Jung Sun dreams of becoming a French food chef. They then meet in real life and their relationship grows.',
        premiered: "2017-09-18",
        ended: "2017-11-21",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670842606,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670842606,
      touched: 1792670849678,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670850807b1cf",
      title: "로봇이 아니야",
      en: "I'm Not a Robot",
      tvId: 32272,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/532/1330922.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/532/1330922.jpg",
      year: "2017",
      network: "MBC",
      eps: 32,
      info: {
        genres: ["Drama", "Romance", "Science-Fiction"],
        summary:
          "The story of a man who lives an isolated life due to a severe allergy to other people but meets and falls in love with a woman who pretends to be a robot.",
        premiered: "2017-12-06",
        ended: "2018-01-25",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670850807,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670850807,
      touched: 1792670861645,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926708852568428",
      title: "또 오해영",
      en: "Another Miss Oh",
      tvId: 14833,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/632/1581266.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/632/1581266.jpg",
      year: "2016",
      network: "tvN",
      eps: 18,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "Two women working in the same industry with the exact same name keep getting their lives entangled both professionally and personally.",
        premiered: "2016-05-02",
        ended: "2016-06-28",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670885256,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670885256,
      touched: 1792670892994,
      infoTried: true,
      draft: false,
    },
    {
      id: "179267090028367fb",
      title: "더블유",
      en: "W",
      tvId: 14842,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/68/170142.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/68/170142.jpg",
      year: "2016",
      network: "MBC",
      eps: 16,
      info: {
        genres: ["Drama", "Romance", "Thriller"],
        summary:
          "After being pulled into the webtoon world created by her father, a surgical resident gets entangled in a murder mystery involving the story's hero.",
        premiered: "2016-07-20",
        ended: "2016-09-14",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792670900283,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670900283,
      touched: 1792670905418,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926709071354dcf",
      title: "태양의 후예",
      en: "Descendants of the Sun",
      tvId: 9426,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/46/115575.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/46/115575.jpg",
      year: "2016",
      network: "KBS2",
      eps: 16,
      info: {
        genres: ["Drama", "Romance", "Medical"],
        summary:
          "This story tells of doctors stationed in the fictional war zone of Urk, and follows the love story that develops between a surgeon and a special forces officer, both elite in their respective fields. The story tracks both their personal and professional struggles while exploring issues about the value of life.",
        premiered: "2016-02-24",
        ended: "2016-04-14",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792670907135,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670907135,
      touched: 1792670912287,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926709143178851",
      title: "구르미 그린 달빛",
      en: "Love in the Moonlight",
      tvId: 14844,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/76/190752.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/76/190752.jpg",
      year: "2016",
      network: "KBS2",
      eps: 18,
      info: {
        genres: ["Comedy", "Romance", "History"],
        summary:
          "Hong Ra On, disguises herself as a man and counsels men on dating. Due to a love letter she wrote for a client, she meets Lee Yung---future Crown Prince Hyomyung. Hong Ra On is unaware that he is the Crown Prince and Lee Yung is unaware that Hong Ra On is a woman. The Crown Prince becomes interested in Hong Ra On. As nobody is aware of Ra On being a woman, she is sold to the palace and becomes an eunuch...",
        premiered: "2016-08-22",
        ended: "2016-10-18",
      },
      kind: "사극",
      status: "done",
      upTo: 18,
      scores: [
        0.8, 1, 0.9, 0.8, 1, 1, 1, 0.8, 0.6, 0.6, 0.8, 0.8, 1, 0.8, 1, 0.7, 0.9,
        1,
      ],
      review: "해피엔딩인 몇 안되는 사극, 동시에 엄청 설레는 조합 !",
      rating: 9,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792670914317,
      history: [],
      notes: { 6: "정원씬 색감이 너무 이쁨!", 8: "박보검의 공개 고백씬 .." },
      times: {},
      savedAt: 1792670914317,
      touched: 1792926809491,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792670920617713e",
      title: "낭만닥터 김사부 3",
      en: "Romantic Doctor, Teacher Kim",
      tvId: 19333,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/458/1146656.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/458/1146656.jpg",
      year: "2023",
      network: "SBS",
      eps: 20,
      info: {
        genres: ["Drama", "Romance", "Medical"],
        summary:
          "Both Kang Dong Joo and Yoon Seo Jung worked their backside off to become a doctor. For Kang Dong Joo, it was to beat someone out there and for Yoon Seo Jung, it was to be recognized by someone. The humanist drama depicts how the two doctors meet the oddball doctor, Kim Sa Bu and become to realize the true value of life and solace of love.",
        premiered: "2016-11-07",
        ended: "2023-06-17",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792670920617,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792670920617,
      touched: 1792929589027,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792671043973e06d",
      title: "질투의 화신",
      en: "Jealousy Incarnate",
      tvId: 16143,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/71/179798.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/71/179798.jpg",
      year: "2016",
      network: "SBS",
      eps: 24,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "The drama depicts romance as well as intense competitive rivalry between an anchor and a weather forecaster working together for a television news show.",
        premiered: "2016-08-24",
        ended: "2016-11-10",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671043973,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671043973,
      touched: 1792671052308,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926710560384655",
      title: "푸른 바다의 전설",
      en: "The Legend of the Blue Sea",
      tvId: 18628,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/532/1330925.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/532/1330925.jpg",
      year: "2016",
      network: "SBS",
      eps: 20,
      info: {
        genres: ["Comedy", "Fantasy", "Romance"],
        summary:
          "How can a mermaid from the Joseon era survive in modern-day Seoul? Shim Chung is a mermaid who finds herself transplanted to modern times. She is caught by Heo Joon Jae, a charming but cold con artist who is the doppelgänger for Kim Moon, the son of a nobleman from the Joseon Dynasty. But in the present time, Joon Jae works with Jo Nam Doo, a skilled conman who guides Joon Jae to become a genius scammer. But Joon Jae's friend, Cha Shi Ah, who works as a researcher at KAIST, may be Chung's only hope for surviving in her strange new world.",
        premiered: "2016-11-16",
        ended: "2017-01-25",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792671056038,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671056038,
      touched: 1792671059385,
      infoTried: true,
      draft: false,
    },
    {
      id: "179267108802701ed",
      title: "나의 완벽한 비서",
      en: "Love Scout",
      tvId: 80927,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/620/1552267.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/620/1552267.jpg",
      year: "2025",
      network: "SBS",
      eps: 12,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "A successful and confident woman, Kang Ji Yun, is the CEO of a headhunting company. To survive in the fiercely competitive headhunting field, she puts everything she has into her work. Outside of her job, she doesn't know how to do anything. She has a secretary named Yoo Eun Ho who takes care of pretty much everything for her. Unlike his boss, the secretary is friendly, well-mannered, and considerate of other people. He is a single father, who is also good at parenting and housework.",
        premiered: "2025-01-03",
        ended: "2025-02-14",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671088027,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671088027,
      touched: 1792671099709,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792671108357b53a",
      title: "원경",
      en: "The Queen Who Crowns",
      tvId: 81196,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/546/1365195.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/546/1365195.jpg",
      year: "2025",
      network: "tvN",
      eps: 12,
      info: {
        genres: ["Drama", "History"],
        summary:
          "Queen Won Kyung, born to Min Je during the Goryeo period, came from a prestigious family of high-ranking officials. Married to Lee Bang Won, son of King Taejo, she supported her husband's ambitions to become King Taejong after his father bypassed him for the throne. As a kingmaker, she helped establish a new regime. However, their relationship soured after Lee Bang Won became king, took concubines, and sought to curb Queen Won Kyung's influence and that of her family.",
        premiered: "2025-01-06",
        ended: "2025-02-11",
      },
      kind: "사극",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671108357,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671108357,
      touched: 1792671111189,
      infoTried: true,
      draft: false,
    },
    {
      id: "179267111309744e2",
      title: "언젠가는 슬기로운 전공의생활",
      en: "Resident Playbook",
      tvId: 78417,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/565/1413772.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/565/1413772.jpg",
      year: "2025",
      network: "tvN",
      eps: 12,
      info: {
        genres: ["Drama", "Medical"],
        summary:
          "Set at the Jongno branch of Yulje Medical Center, the series follows the hospital lives and turbulent friendships of young obstetrics and gynecology residents who proudly enter the unpopular department in an era of low birth rates.",
        premiered: "2025-04-12",
        ended: "2025-05-18",
      },
      kind: "메디컬",
      status: "done",
      upTo: 12,
      scores: [0.6, 0.6, 0.8, 0.2, 0.8, 0.5, 0.5, 0.1, 0.3, 0.6, 0.7, 0.6],
      review: "의사생활만큼 재밌지는 않지만 킬링타임으로는 볼만함",
      rating: 6,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671113097,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671113097,
      touched: 1792926888981,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792671141687d1e7",
      title: "폭군의 셰프",
      en: "Bon Appétit, Your Majesty",
      tvId: 85359,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/580/1452461.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/580/1452461.jpg",
      year: "2025",
      network: "tvN",
      eps: 12,
      info: {
        genres: ["Drama", "Food", "History"],
        summary:
          "What happens when a Michelin-worthy chef from Paris accidentally time-slips to the Joseon dynasty? She meets the King, a fearsome tyrant with an unexpectedly refined palate. In a bid to survive palace intrigue and royal appetites, she whips up dazzling fusion dishes that tempt even the coldest heart. But as sparks fly in the royal kitchen, a slow-burn romance simmers beneath the surface.",
        premiered: "2025-08-23",
        ended: "2025-09-28",
      },
      kind: "사극",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671141687,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671141687,
      touched: 1792671146541,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792671148086e448",
      title: "뿌리깊은 나무",
      en: "A Tree with Deep Roots",
      tvId: 19915,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/70/175956.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/70/175956.jpg",
      year: "2011",
      network: "SBS",
      eps: 24,
      info: {
        genres: ["Drama", "Mystery", "History"],
        summary:
          "Set up in the early reign of King Sejong, this drama started when Shim Ohn (King's father in law) and his whole household were framed to execution by the former King Taejong. Two young slaves survive and continue the living with the aim of getting revenge for the innocents' deaths. While King Sejong feeling guilty for not being able to rescue his people, he is determined to create hangul through secret organisation. However, the obstacles started when one by one of his people got involved in serial murder.",
        premiered: "2011-10-05",
        ended: "2011-12-24",
      },
      kind: "스릴러",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671148086,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671148086,
      touched: 1792672427810,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792671153191dfc2",
      title: "드림하이",
      en: "Dream High",
      tvId: 3633,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/49/123557.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/49/123557.jpg",
      year: "2011",
      network: "KBS2",
      eps: 16,
      info: {
        genres: ["Comedy", "Music", "Romance"],
        summary:
          "Dream High takes place at Kirin High School of Art and follows the lives of students as they aspire to become superstars.",
        premiered: "2011-01-03",
        ended: "2012-03-20",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671153191,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671153191,
      touched: 1792671157660,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926711591318139",
      title: "내 남편과 결혼해줘",
      en: "Marry My Husband",
      tvId: 72935,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/619/1549498.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/619/1549498.jpg",
      year: "2024",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Fantasy", "Romance"],
        summary:
          "Kang Ji-won, a terminally ill cancer patient, is killed by her husband and best friend after she witnesses them having an affair. She wakes up 10 years before the incident and decides to seek revenge with the help of Yu Ji-hyuk, a director at the company where she works. Now, she must reclaim her fate and eliminate the trash from her life.",
        premiered: "2024-01-01",
        ended: "2024-02-20",
      },
      kind: "판타지",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671159131,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671159131,
      touched: 1792671164946,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792671184664c476",
      title: "굿파트너",
      en: "Good Partner",
      tvId: 78050,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/525/1312893.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/525/1312893.jpg",
      year: "2024",
      network: "SBS",
      eps: 16,
      info: {
        genres: ["Comedy", "Legal"],
        summary:
          "Facing her own divorce, seasoned divorce lawyer Cha Eun Kyung has grown jaded with the concept of Justice, instead opting for the path with the most monetary gain. This changes after she begins working with passionate rookie lawyer Han Yoo Ri, who believes in helping people regardless of the money.",
        premiered: "2024-07-12",
        ended: "2026-11-21",
      },
      kind: "코미디",
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792671184664,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671184664,
      touched: 1792671187057,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792671268490de02",
      title: "유미의 세포들 3",
      en: "Yumi's Cells",
      tvId: 56626,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/621/1553740.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/621/1553740.jpg",
      year: "2021",
      network: "TVING",
      eps: 14,
      info: {
        genres: ["Comedy", "Anime", "Romance"],
        summary:
          "Yumi is an ordinary single working woman. She is not good at expressing her feelings. Through her romantic relationship and work, she grows as a person and finds happiness in her daily life. Yumi has cells in her brain that represent different emotions like love, violence, rationality, good, and bad. These tiny cells in her brain work actively for her. They deal with her emotions and troubles.",
        premiered: "2021-09-17",
        ended: "2026-05-04",
      },
      kind: "로맨스",
      status: "done",
      upTo: 14,
      scores: [
        0.9, 0.9, 0.9, 0.7, 0.8, 0.9, 0.7, 0.7, 0.8, 0.9, 0.8, 0.7, 1, 1,
      ],
      review: "유미의 상황이 나같아서 몰입하면서 볼 수 있었던 거 같음",
      rating: 8,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671268490,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671268490,
      touched: 1792769409381,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792671390016d6cc",
      title: "응답하라 1997",
      en: "Answer Me 1997",
      tvId: 7266,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/467/1169430.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/467/1169430.jpg",
      year: "2012",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "This drama will focus on the extreme fan culture that emerged in the 1990s when idol groups took center stage and K-pop was blossoming.It tells the story of 6 former high school friends from a school in Busan who meet again in 2012 and brings back memories to 1997 when they were still high school students. Moving back and forth between the '90s and today, the story centers on the life of Sung Shi Won, who idolizes boyband H.O.T., and her 5 high school friends.",
        premiered: "2012-07-24",
        ended: "2012-09-18",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 8,
      keys: ["휴먼", "우정", "로맨스"],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792671390016,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792671390016,
      touched: 1792672041092,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926724521999c74",
      title: "미지의 서울",
      en: "Our Unwritten Seoul",
      tvId: 84106,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/566/1416522.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/566/1416522.jpg",
      year: "2025",
      network: "tvN",
      eps: 12,
      info: {
        genres: ["Drama", "Family", "Romance"],
        summary:
          "Our Unwritten Seoul centers on twin sisters, Yoo Mi Ji and Yoo Mi Rae — identical in appearance yet opposite in personality and life paths. After a complicated twist of fate, they swap identities, each sister navigating unfamiliar challenges to discover love and their true selves.",
        premiered: "2025-05-24",
        ended: "2025-06-29",
      },
      kind: "휴먼",
      status: "done",
      upTo: 12,
      scores: [0.6, 0.5, 0.1, 0.3, 0.3, 0.4, 0.5, 0.2, 0.3, 0.9, 0.5, 0.4],
      review: "",
      rating: 6,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792672452199,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792672452199,
      touched: 1792672559142,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792680189193eb79",
      title: "멋진 신세계",
      en: "My Royal Nemesis",
      tvId: 90692,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/624/1561134.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/624/1561134.jpg",
      year: "2026",
      network: "SBS",
      eps: 14,
      info: {
        genres: ["Comedy", "Fantasy", "Romance"],
        summary:
          "A Joseon-era villain doomed to die opens her eyes in modern-day Seoul — where a ruthless chaebol heir may be her last chance to rewrite her fate.",
        premiered: "2026-05-08",
        ended: "2026-06-20",
      },
      kind: "로맨스",
      status: "done",
      upTo: 14,
      scores: [
        0.8, 0.7, 0.6, 0.6, 0.6, 0.9, 0.8, 0.7, 0.6, 1, 0.7, 0.8, 0.8, 0.7,
      ],
      review:
        "음 약간 병맛? 인듯 아닌듯 허남준의 재발견 같은 드라마 설레긴 하는데 여주 너무 오바함",
      rating: 7,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792680189193,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792680189193,
      touched: 1792682392504,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926803768639d32",
      title: "이 사랑 통역 되나요?",
      en: "Can This Love Be Translated?",
      tvId: 80053,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/608/1520438.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/608/1520438.jpg",
      year: "2026",
      network: "Netflix",
      eps: 12,
      info: {
        genres: ["Drama", "Romance"],
        summary:
          "The emotions of a celebrity and her interpreter get lost in translation as they travel the world filming a TV show. Will love find its own language?",
        premiered: "2026-01-16",
        ended: "2026-01-16",
      },
      kind: "휴먼",
      status: "done",
      upTo: 12,
      scores: [1, 1, 1, 1, 1, 1, 0.9, 0.9, 1, 1, 0.9, 0.9],
      review: "두번 보니까 첫번째 봤을때랑 느낌이 좀 달랐음!!",
      rating: 9,
      keys: [],
      liked: true,
      watchLabel: "2회차",
      watchStart: 1792681772502,
      history: [
        {
          label: "1회차",
          start: 1792680376863,
          end: 1792681772502,
          scores: [1, 1, 1, 1, 0.8, 0.8, 0.6, 0.6, 0.8, 0.6, 0.6, 0.7],
          review:
            "씁 뭔가 내가 생각한 전개는 아니였음 로맨스가 더 드러날줄 알았는데 좀 애매",
          rating: 7,
          upTo: 12,
        },
      ],
      notes: {},
      times: {},
      savedAt: 1792680376863,
      touched: 1792929395583,
      infoTried: true,
      draft: false,
    },
    {
      id: "179268066526946bb",
      title: "환혼 1",
      en: "Alchemy of Souls",
      tvId: 62248,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/609/1523773.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/609/1523773.jpg",
      year: "2022",
      network: "tvN",
      eps: 20,
      info: {
        genres: ["Action", "Fantasy", "Romance"],
        summary:
          'Set in a fictional country called Daeho that does not exist in history or on maps, it is about the love and growth of young mages as they overcome their twisted fates due to a magic spell known as the "alchemy of souls", which allows souls to switch bodies. It follows the story of an elite assassin named Naksu, whose soul is accidentally trapped inside the weak body of Moo Duk—Jang Wook\'s servant from a powerful and noble family in the country. The young master of the Jang Family, Jang Wook, holds a dark secret about his scandalous birth. He wants the formidable assassin to help change his destiny.',
        premiered: "2022-06-18",
        ended: "2023-01-08",
      },
      kind: "로맨스",
      status: "done",
      upTo: 20,
      scores: [
        1, 1, 1, 1, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 0.9, 1, 1, 1, 0.9, 0.8, 1, 0.9,
        0.6, 0.2,
      ],
      review: "",
      rating: 8,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792680665269,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792680665269,
      touched: 1792926601643,
      infoTried: true,
      draft: false,
    },
    {
      id: "179268079897529b4",
      title: "알고있지만,",
      en: "Nevertheless,",
      tvId: 55250,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/326/815740.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/326/815740.jpg",
      year: "2021",
      network: "jTBC",
      eps: 10,
      info: {
        genres: ["Drama", "Romance"],
        summary:
          "Park Jae Eon is a university student, majoring in art. He seems nice to everyone and he is usually cheerful. Yet, he is really indifferent to others and he doesn't want to have a romantic relationship. Unexpectedly, he fall for Yoo Na Bi and begins to change. Yoo Na Bi is an art srudent at the same university as Park Jae Eon. In her past, she broke up with her first love due to his unfaithful ways. After that, she decided to become unswayed by love. She then meets Park Jae Eon and develops feelings for him.",
        premiered: "2021-06-19",
        ended: "2021-08-21",
      },
      kind: "로맨스",
      status: "done",
      upTo: 10,
      scores: [0.8, 1, 0.9, 0.8, 0.7, 0.9, 0.7, 0.4, 0.3, 0.2],
      review: "",
      rating: 6,
      keys: [],
      liked: true,
      watchLabel: "1회차",
      watchStart: 1792680798975,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792680798975,
      touched: 1792926604457,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926810890757457",
      title: "어쩌다 발견한 하루",
      en: "Extraordinary You",
      tvId: 42757,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/211/527722.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/211/527722.jpg",
      year: "2019",
      network: "MBC",
      eps: 32,
      info: {
        genres: ["Drama", "Romance"],
        summary:
          'It tells the story of a girl who realizes that she is a supporting character inside a romance manga named "Secret". She tries to change the fixed story for her love and life.',
        premiered: "2019-10-02",
        ended: "2019-11-21",
      },
      kind: "로맨스",
      status: "done",
      upTo: 32,
      scores: [
        0.4,
        0.4,
        0.4,
        0.4,
        0.3,
        0.3,
        0.3,
        0.3,
        0.2,
        0.2,
        0.1,
        0.1,
        0.1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "남주나 전개가 재밌긴 하나 다음화가 별로 안 궁금함",
      rating: 5,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792681089075,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792681089075,
      touched: 1792681125213,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926812427945fa1",
      title: "아는 와이프",
      en: "Familiar Wife",
      tvId: 36193,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/160/400828.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/160/400828.jpg",
      year: "2018",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Fantasy", "Romance"],
        summary:
          "A married couple suddenly finds themselves living entirely different lives after their fates magically change through an unexpected incident.",
        premiered: "2018-08-01",
        ended: "2018-09-20",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        0.4,
        0.5,
        0.3,
        0.3,
        0.1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 3,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792681242794,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792681242794,
      touched: 1792926557844,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926813281944457",
      title: "황후의 품격",
      en: "The Last Empress",
      tvId: 39121,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/563/1409100.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/563/1409100.jpg",
      year: "2018",
      network: "SBS",
      eps: 52,
      info: {
        genres: ["Drama", "Fantasy", "Romance"],
        summary:
          "Set in an alternate universe, in which Korea is a constitutional monarchy in 2018, Oh Sunny is a bright and vivacious musical actress who marries the emperor. She becomes involved in the palace power struggle and a mysterious murder that sets off events that threaten the monarchy itself, while searching for true love and happiness.",
        premiered: "2018-11-21",
        ended: "2019-02-21",
      },
      kind: "로맨스",
      status: "done",
      upTo: 52,
      scores: [
        0.4, 0.3, 0.3, 0.4, 0.4, 0.4, 0.5, 0.5, 0.7, 0.8, 0.8, 0.6, 0.5, 0.5,
        0.5, 0.4, 0.3, 0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.5,
        0.4, 0.4, 0.4, 0.5, 0.5, 0.6, 0.6, 0.5, 0.4, 0.4, 0.4, 0.5, 0.4, 0.3,
        0.3, 0.3, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
      ],
      review:
        "아줌마들이 왜 막장드라마를 보는 지 알 거 같은 느낌..? 그치만 뒤로 갈수록 임펙트 없음",
      rating: 6,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792681328194,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792681328194,
      touched: 1792681401598,
      infoTried: true,
      draft: false,
    },
    {
      id: "17926814033144646",
      title: "알함브라 궁전의 추억",
      en: "Memories of the Alhambra",
      tvId: 38250,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/173/433813.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/173/433813.jpg",
      year: "2018",
      network: "tvN",
      eps: 16,
      info: {
        genres: ["Drama", "Comedy", "Romance"],
        summary:
          "Yoo Jin Woo is the CEO of an investment company. He has good sense at his work, a strong adventurous spirit and a strong desire for winning. Yoo Jin Woo is going through a hard time emotionally due to things like betrayal from his friends. He visits Granada, Spain on business and stays at an old hostel run by Jung Hee Joo. There, Yoo Jin Woo gets involved in a strange affair.",
        premiered: "2018-12-01",
        ended: "2019-01-20",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        0.3,
        0.4,
        0.4,
        0.3,
        0.2,
        0.1,
        0.1,
        0.1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: 3,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792681403314,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792681403314,
      touched: 1792926608985,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792681493004a360",
      title: "힘쎈여자 도봉순",
      en: "Strong Woman Do Bong Soon",
      tvId: 18627,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/532/1331189.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/532/1331189.jpg",
      year: "2017",
      network: "jTBC",
      eps: 16,
      info: {
        genres: ["Comedy", "Action", "Fantasy"],
        summary:
          "Strong Woman Do Bong Soon tells the story about Do Bong Soon who is a woman born with Herculean strength, anything she touches with too much force crumbles in her hands. Ahn Min Hyuk is her love interest and he is an extraordinary second-generation chaebol with crazy tendencies. Meanwhile, Gook Doo is the guy who's harbored a one-sided crush on the heroine.",
        premiered: "2017-02-24",
        ended: "2017-04-15",
      },
      kind: null,
      status: "done",
      upTo: 16,
      scores: [0.6, 0.6, 0.6, 0.8, 0.8, 0.9, 1, 1, 1, 1, 1, 0.9, 0.9, 1, 1, 1],
      review: "서브 남주 왜저래",
      rating: 8,
      keys: [],
      liked: true,
      watchLabel: "2회차",
      watchStart: 1792681550650,
      history: [
        {
          label: "1회차",
          start: 1792681493004,
          end: 1792681550650,
          scores: [
            0.7, 0.8, 0.9, 0.7, 0.8, 1, 1, 0.8, 0.9, 1, 0.9, 0.8, 0.9, 1, 1, 1,
          ],
          review:
            "여주 남주 아주 잘어울림 로맨스만이 아니라 스릴러가 겹쳐 있어서 지루하지 않음 박보영 개귀여움 !",
          rating: 8,
          upTo: 16,
        },
      ],
      notes: {},
      times: {},
      savedAt: 1792681493004,
      touched: 1792681569153,
      infoTried: true,
    },
    {
      id: "17926815840713e22",
      title: "쌈 마이웨이",
      en: "Fight for My Way",
      tvId: 26158,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/111/279504.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/111/279504.jpg",
      year: "2017",
      network: "KBS2",
      eps: 16,
      info: {
        genres: ["Drama", "Romance"],
        summary:
          "Fight for My Way is about two individuals who have been living every day stuck in the daily grind. Without the connections, money, or education necessary to advance, they've been unable to escape their third-rate lives.",
        premiered: "2017-05-22",
        ended: "2017-07-11",
      },
      kind: "로맨스",
      status: "done",
      upTo: 16,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "남사친 여사친이 없음을 알려주는 드라마..",
      rating: 9,
      keys: [],
      liked: true,
      watchLabel: "3회차",
      watchStart: 1792681666588,
      history: [
        {
          label: "1회차",
          start: 1792681584071,
          end: 1792681628739,
          scores: [
            0.9, 0.9, 0.9, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.8, 1, 1, 0.9, 0.9,
          ],
          review:
            "20대의 마음을 투영한 거같은 드라마 김지원이랑 박서준은 당연히 연기 잘하고 나머지 조연배우들도 연기 개잘함",
          rating: 10,
          upTo: 16,
        },
        {
          label: "2회차",
          start: 1792681628739,
          end: 1792681666588,
          scores: [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
          ],
          review: "2번째 보니 설이 주만이 커플이 되게 현실적이라는 생각이 듦",
          rating: 9,
          upTo: 16,
        },
      ],
      notes: {},
      times: {},
      savedAt: 1792681584071,
      touched: 1792681696791,
      infoTried: true,
      draft: false,
    },
    {
      id: "1792682915738d596",
      title: "SKY 캐슬",
      en: "Sky Castle",
      tvId: 39318,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/174/435629.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/174/435629.jpg",
      year: "2018",
      network: "jTBC",
      eps: 20,
      info: {
        genres: ["Drama", "Comedy", "Family"],
        summary:
          "Sky Castle is set in a four-story apartment building in Seoul's suburbs, which is inhabited by some professionals such as judges, prosecutors, doctors, professors and their wives.It will depict their efforts to have their children admitted into good universities. Some grew up in families with many generations of doctors or lawyers. Thus, their ambitions will be shown with comedy and realism.",
        premiered: "2018-11-23",
        ended: "2019-02-01",
      },
      kind: null,
      status: "done",
      upTo: 20,
      scores: [
        1, 0.8, 0.7, 0.7, 0.7, 0.8, 0.8, 0.6, 0.8, 0.8, 0.6, 0.6, 0.7, 0.8, 0.8,
        0.6, 0.5, 0.6, 0.4, 0.1,
      ],
      review:
        "이거 볼때 중학생이였었는데 입시가 이런거라고..? 하며 심란해했었던 기억이 남",
      rating: 8,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792682915738,
      history: [],
      notes: { 0: "처음부터 파격적이게 시작함" },
      times: {},
      savedAt: 1792682915738,
      touched: 1792926647415,
      infoTried: true,
      draft: false,
    },
    {
      id: "179275574536219e9",
      title: "킬미, 힐미",
      en: "Kill Me, Heal Me",
      tvId: 3199,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/532/1330923.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/532/1330923.jpg",
      year: "2015",
      network: "MBC",
      eps: 20,
      info: {
        genres: ["Comedy", "Romance", "Medical"],
        summary:
          "A romantic comedy between a third-generation billionaire with Dissociative Identity Disorder and a first-year Psychiatrist resident who treats him secretly.After a traumatic experience in his childhood, Cha Do Hyun suffers memory lapses and his personality then fractured into seven different identities. He tries to regain control over his life with the help of Oh Ri Jin, a first-year psychiatric resident who treats him secretly. But Ri Jin's twin brother, Oh Ri Ohn, is a famous mystery novelist who investigates about Do Hyun and his family.",
        premiered: "2015-01-07",
        ended: "2015-03-12",
      },
      kind: "로맨스",
      status: "watching",
      upTo: 11,
      scores: [
        null,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.4,
        0.4,
        0.4,
        0.5,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792755745362,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792755745362,
      touched: 1792755752616,
      infoTried: true,
    },
    {
      id: "1792926451927687f",
      title: "하이에나",
      en: "Hyena",
      tvId: 45681,
      poster:
        "https://static.tvmaze.com/uploads/images/medium_portrait/240/600227.jpg",
      posterBig:
        "https://static.tvmaze.com/uploads/images/original_untouched/240/600227.jpg",
      year: "2020",
      network: "SBS",
      eps: 16,
      info: {
        genres: ["Drama", "Romance", "Legal"],
        summary:
          "Yoon Hee Jae and Jung Geum Ja are lawyers who work for the top 1% in society. Jung Geum Ja is a lawyer, who is after money only. She wins her cases using any means necessary. Yoon Hee Jae is an elite lawyer, who is smart and confident at his job.",
        premiered: "2020-02-21",
        ended: "2020-04-11",
      },
      kind: null,
      status: "watching",
      upTo: 0,
      scores: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      review: "",
      rating: null,
      keys: [],
      liked: false,
      watchLabel: "1회차",
      watchStart: 1792926451927,
      history: [],
      notes: {},
      times: {},
      savedAt: 1792926451927,
      touched: 1792926451927,
      infoTried: true,
    },
  ],
  sets: [
    {
      id: "s1792673541278",
      name: "대사까지 외운 드라마",
      color: "#8C6CE0",
      ids: [
        "179213955178193ea",
        "1792139551781f9d4",
        "1792139551781c144",
        "1792139551781d3cd",
        "179213955178142c3",
        "17921395517813fdf",
        "1792163557557d56b",
        "1792670701226f818",
        "1792670755482279d",
        "179267090028367fb",
        "17926709071354dcf",
        "17926709143178851",
      ],
    },
    {
      id: "s1792674271823",
      name: "최애 사극",
      color: "#E8483B",
      ids: [
        "1792139551781f9d4",
        "1792163557557d56b",
        "17924576006707436",
        "1792670496721d5c9",
        "1792670755482279d",
        "17926709143178851",
      ],
    },
    {
      id: "s1792674501441",
      name: "개 설레는",
      color: "#E05D8C",
      ids: [
        "1792139551781956f",
        "179213955178193ea",
        "179213955178142c3",
        "179213955178166e2",
        "17921395517813fdf",
        "1792139551781b879",
        "17926709071354dcf",
        "17926709143178851",
      ],
    },
    {
      id: "s1792926401496",
      name: "메디컬 드라마",
      color: "#4C86E8",
      ids: ["17921395517817345", "179267111309744e2", "1792670920617713e"],
    },
    {
      id: "s1792926440233",
      name: "법 드라마",
      color: "#F07A2E",
      ids: ["17921395517812c42", "1792671184664c476", "1792926451927687f"],
    },
  ],
  sample: false,
};
