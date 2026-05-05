# Foundation: Typography (광고 배너용)

> **출처**
> - https://seed-design.io/docs/foundation/typography/overview
> - https://seed-design.io/docs/foundation/design-token-reference
>
> SEED 폰트 크기 토큰은 11~26px 범위 (모바일 본문/제목 기준). 배너 헤드는 작은 320×100에서도 30px+, 1200×1500에서는 200px+가 필요.
>
> → **배너 폰트 크기는 토큰을 직접 쓰지 않고, 헤드 길이 + 가용 폭을 기준으로 동적 계산**한다.

---

## 0. 폰트 패밀리 결정

```js
const fonts = await figma.listAvailableFontsAsync();
const hasKarrot = fonts.some(f => f.fontName.family.toLowerCase().includes('karrot'));
const FAM = hasKarrot ? 'Karrot Sans' : 'Noto Sans KR';
const HV  = hasKarrot ? 'Heavy' : 'Black';   // 헤드 / CTA / 로고 텍스트
const BD  = 'Bold';                            // 서브 / 본문
```

- **1순위: Karrot Sans Heavy/Bold** (당근 공식)
- **대체: Noto Sans KR Black/Bold** + 노란 경고 노트
- 그 외 폰트 사용 = **즉시 재작업**

> SEED엔 Heavy(800/900) 토큰이 정의되어 있지 않다. 배너는 광고 강도가 필요해 SEED 외 가중치(Heavy/Black)를 정식 규칙으로 채택.

---

## 1. SEED font-size 토큰 (참고만)

| Token | px |
|---|---|
| `$font-size.t1` | 11 |
| `$font-size.t5` | 16 |
| `$font-size.t8` | 22 |
| `$font-size.t9` | 24 |
| `$font-size.t10` | 26 |

→ 배너 헤드(30~200px)와 절대 비교 불가. 모바일 본문 스케일이라 배너 헤드엔 너무 작음. **참고 컨텍스트로만 본다.**

---

## 2. SEED line-height 비율 추출

SEED line-height/font-size 비율을 보면:

| 토큰 쌍 | font-size | line-height | 비율 |
|---|---|---|---|
| t1 | 11 | 15 | 1.36 |
| t5 | 16 | 22 | 1.375 |
| t9 | 24 | 32 | 1.33 |
| t10 | 26 | 35 | 1.346 |

→ **평균 ≈ 1.35**. 배너에서도 `lineHeight = fontSize × 1.35` 채택.

한국어 Black/Heavy 가중에서 1.35는 줄간격이 답답하지도 헐겁지도 않은 안전 표준값.

---

## 3. 배너 폰트 크기 결정 알고리즘 (3단계)

### 3-1. 권장 비율 (preferred)

| 비율 | layout | Head 권장 | Sub 권장 | CTA 권장 |
|---|---|---|---|---|
| ≥ 2.5 (Wide) | A | `h × 0.36` | — | — |
| 0.9 ~ 1.3 (Square) | B | `h × 0.14` | `h × 0.048` | `h × 0.060` |
| 1.3 ~ 2.5 (Landscape) | C | `h × 0.20` | `h × 0.060` | `h × 0.072` |
| < 0.9 (Portrait) | D | `h × 0.10` | `h × 0.040` | `h × 0.048` |

### 3-2. fitSize — 길이 기반 자동 축소

`preferred` 그대로 쓰면 카피가 길 때 frame 밖으로 튀어나간다. 그래서:

```js
const CF = 0.97; // Korean Black/Heavy 평균 글자폭/font-size
function fitSize(text, maxW, preferred) {
  const longestLine = Math.max(1, ...text.split('\n').map(l => l.length));
  const maxFromWidth = Math.floor(maxW / (longestLine * CF));
  return Math.max(10, Math.min(preferred, maxFromWidth));
}
```

> **CF=0.97 근거:** Karrot Sans Heavy / Noto Sans KR Black의 한글 글자 너비는 폰트 크기와 거의 1:1 (정확히는 letter-spacing -3% 적용 후 0.97). 라틴 알파벳은 더 좁지만 한국어 카피 비중이 높아 0.97이 안전 마진.

### 3-3. calcH — 텍스트 박스 실제 높이

Figma의 `text.height`는 `textAutoResize='HEIGHT'` 직후 갱신이 안 된다 (항상 10 반환). 좌표 계산엔 수식 함수를 써야 한다:

```js
const LH = 1.35;
function calcH(text, size, maxW) {
  const charsPerLine = Math.max(1, Math.floor(maxW / (size * CF)));
  const lines = text.split('\n').reduce((sum, line) =>
    sum + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
  return Math.ceil(lines * size * LH);
}
```

**`fitSize`와 `calcH`가 배너 타이포그래피의 유일한 정답.** SEED 절대 px 토큰을 직접 쓰면 사이즈 불일치 → 텍스트 잘림.

---

## 4. letter-spacing

| 역할 | 값 | 근거 |
|---|---|---|
| 헤드 (Heavy/Black) | `-3%` | 한글 자간 시각 보정 |
| 서브 (Bold) | `-2%` | 가벼운 보정 |
| CTA 라벨 (Heavy) | `-2%` | 짧은 단어라 -3%까지 안 가도 됨 |

> SEED엔 letter-spacing 토큰이 없음. 위 값들은 Karrot Sans Heavy 한글 가독성 실측 결과 표준화한 배너 전용 룰.

---

## 5. 사이즈별 실측 폰트 크기 (HEAD, 카피 길이 8자 가정)

| 배너 | h | preferred (h×ratio) | maxW (cW) | fitSize 결과 | calcH 2줄 |
|---|---|---|---|---|---|
| 320×100 (Wide) | 100 | 36 | ~232 | min(36, 232/(8×.97))=29 → **29** | (1줄) ~39 |
| 720×720 (Square) | 720 | 100 | 612 | min(100, 612/(8×.97))=78 → **78** | 211 |
| 1200×600 (Landscape) | 600 | 120 | 696 | min(120, 696/(8×.97))=89 → **89** | 240 |
| 1200×1500 (Portrait) | 1500 | 150 | 1044 | min(150, 1044/(8×.97))=134 → **134** | 362 |

→ 같은 헤드 카피여도 사이즈에 따라 29~134px로 자동 조정. 이게 **사이즈 비례 환산의 핵심**.

---

## 6. 폰트 두께 매핑

| 역할 | SEED weight | Karrot Sans | Noto Sans KR |
|---|---|---|---|
| 헤드 / CTA / 로고 영역 | (없음 — Heavy 신설) | Heavy | Black |
| 서브 / 본문 | `$font-weight.bold` (700) | Bold | Bold |

---

## 7. 즉시 실패 사유

- Karrot Sans / Noto Sans KR Black 외 폰트
- `text.height`로 좌표 계산 (항상 10 반환되는 함정)
- letter-spacing 미적용 (한글 자간 너무 헐거움)
- preferred 비율만 쓰고 fitSize 누락 → 카피 7자 이상에서 frame 밖으로 침범
- `lineHeight` 비율 ≠ 1.35 (1.0~1.2면 줄 겹침, 1.5+면 시각 그룹 깨짐)

---

## 8. 디자이너 의사 결정 흐름

```
1. 비율(w/h) → layout A/B/C/D 결정
2. preferred 폰트 크기 = h × ratio
3. fitSize(text, maxW, preferred) → 실제 폰트 크기
4. calcH(text, size, maxW) → 텍스트 박스 높이
5. bottom-up 좌표 계산 (CTA부터 위로 스택)
```
