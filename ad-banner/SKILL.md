---
name: ad-banner
description: |
  당근 광고 이미지 배너를 SEED 디자인 시스템 + 당근 브랜드 보이스에 맞춰 자동으로 기획하고 Figma 파일로 생성하는 스킬.

  **다음 명시적 트리거가 있을 때만 발동. 자연어 문맥만으로는 절대 발동하지 않는다.**
  - `#소재제작`
  - `#배너제작`
  - `#광고소재`

  **발동 안 함:** 해시태그 없는 "배너 만들어줘", "이미지 시안 보여줘" 같은 자연어 / SEED 토큰 단순 조회 / Figma 파일 일반 편집.

  워크플로우: 당근 voice 카피 작성 → Figma 신규 페이지에 전 사이즈 프레임 생성 → 스크린샷 검증
---

# ad-banner 스킬

## 사용법

메시지 어디에든 `#소재제작` / `#배너제작` / `#광고소재` 중 하나를 포함하면 발동:

> `#소재제작` 요새 메모리 대란으로 노트북 가격이 급상승하고 있어. 비싼 새거보다 당근에서 합리적인 가격에 올라온거 있는지 둘러보라는 맥락에서 소재를 제작해봐

> `#배너제작` 당근페이 송금, 몰로코용으로

> `#광고소재` 봄맞이 옷 정리, 메타 사이즈로

해시태그 없이 "소재 만들어", "배너 뽑아줘" 같은 자연어만으로는 발동하지 않는다.

스킬이 알아서 카피 작성 → Figma 새 페이지 생성(`주제_MMDD`) → 배너 10종 생성 → 스크린샷 검증.

---

## 페이지 네이밍 규칙

캠페인마다 **새 페이지** 생성. 기존 페이지는 절대 건드리지 않음.

- 형식: `[주제요약]_[MMDD]` — 예: `노트북_중고거래_2604`, `당근페이송금_2604`
- 주제 요약: 핵심 키워드 2~3개, 공백 없이 언더스코어 연결
- MMDD: 오늘 날짜 4자리
- 같은 이름 페이지가 이미 있으면 내용만 덮어쓰기 (재실행 케이스)

---

## 실행 순서

1. **입력 파싱** — 주제/소구점/매체 추출. 미지정이면 몰로코 기본.
2. **카피 작성** — `references/foundation-voice-tone.md` + `references/copy-library.md` 참조. HEAD/SUB/CTA 3종.
3. **Figma 생성** — `references/figma-generator.md` 코드 템플릿에 PAGE_NAME + 카피만 치환해서 `use_figma` 실행.
4. **검증** — `get_screenshot` 2~3개 확인 (겹침/잘림/로고 충돌). 문제 있으면 `references/troubleshooting.md` 참고하여 파라미터 조정 후 재생성.
5. **체크리스트 출력** — 아래 SEED 확인 블록 반드시 포함.

---

## 성공 출력 예시

마지막에 사용자에게 보여줘야 할 형태:

```
✅ ad-banner 완료
- 페이지: 노트북_중고거래_2604
- 생성 사이즈: 10개 (몰로코 기본)
- 카피: HEAD "메모리값 또 올랐대요" / SUB "동네 노트북 한 번 둘러봐요" / CTA "당근에서 보기"

✅ SEED 적용 확인
- 폰트: Karrot Sans Heavy/Bold
- 브랜드 컬러: $color.bg.brand-solid (#ff6600)
- 연한 배경: $color.bg.brand-weak (#fff2ec)
- 메인 텍스트: $color.fg.neutral (#212124)
- CTA 모서리: $radius.full (9999px)
- Logo_korean 컴포넌트 인스턴스 (Primary/White)
- 당근 voice 키워드: "또 올랐대요", "동네", "둘러봐요"
- 검증 스크린샷: 320×100, 720×720, 1200×1500 (3장 OK)
```

카피 voice가 통과하는 예시 vs 실패하는 예시:

| ✅ 통과 | ❌ 실패 |
|---|---|
| "메모리값 또 올랐대요" (능동·구체·~해요) | "노트북 최저가 할인" (마케팅어) |
| "동네 노트북 한 번 둘러봐요" (동네·~해요) | "전국 최저가 보장" (전국·과장) |
| "당근에서 보기" (구체·동사) | "지금 클릭" (밍밍·일반어) |

---

## 절대 규칙

R1~R7 전체 표는 `references/rules.md`. SEED 토큰·voice·spacing 모두 그 표의 정답 출처(foundation 파일)를 따라간다.

> **공유 토큰**: 색·타이포 등 SEED 디자인 토큰의 단일 출처는 `seed-design` 스킬이다. 본 스킬의 foundation-* references는 배너 생성에 필요한 부분만 발췌·캐시한 것이며, 충돌 시 `seed-design` 쪽이 우선.

---

## Reference Files

| 파일 | 언제 |
|---|---|
| `references/rules.md` | R1~R7 절대 규칙 표 |
| `references/sizes.md` | 매체별 기본 사이즈 + 레이아웃 함수 분기 |
| `references/troubleshooting.md` | 검증 실패 시 처방표 |
| `references/foundation-voice-tone.md` | 카피 작성 시 — voice/tone, 헤드 패턴, 자가 검증 9개 |
| `references/foundation-color.md` | 색 결정 시 — SEED Role 토큰, 배경/텍스트 페어링 |
| `references/foundation-spacing.md` | 간격 결정 시 — 비율 공식 + clamp + 사이즈별 환산표 |
| `references/foundation-radius.md` | 모서리 결정 시 — CTA/장식원/노트 |
| `references/foundation-typography.md` | 폰트 크기·행간·자간 — fitSize·calcH 수식 근거 |
| `references/foundation-logo.md` | 로고 컴포넌트 키 + 비율별 크기 |
| `references/copy-library.md` | 캠페인별 헤드/서브/CTA 후보 |
| `references/layout-spec.md` | 비율별(A/B/C/D) 레이아웃 구조 |
| `references/figma-generator.md` | Figma 생성 코드 템플릿 |
| `references/quality-checklist.md` | 출력 전 자가 검증 |
