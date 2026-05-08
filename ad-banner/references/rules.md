# 절대 규칙 (R1~R8)

각 항목은 해당 foundation 파일이 정답. 충돌 시 항상 foundation 파일이 우선한다.

| # | 룰 | 정답 출처 |
|---|---|---|
| R1 | Karrot Sans Heavy/Bold (없으면 Noto Sans KR Black/Bold + 노란 경고) | `foundation-typography.md` |
| R2 | Logo_korean 컴포넌트 인스턴스 (🥕 이모지·SVG 직접 그리기 금지) | `foundation-logo.md` |
| R3 | SEED Role 토큰 정확값만 (#FF6F0F 등 유사값 금지) | `foundation-color.md` |
| R4 | spacing은 비율 + clamp(min, max). 절대 px 토큰 그대로 금지 | `foundation-spacing.md` |
| R5 | radius는 CTA·장식원만. CTA = `$radius.full`(9999) | `foundation-radius.md` |
| R6 | `text.height` 사용 금지 — `calcH()` 수식만 | `foundation-typography.md` |
| R7 | 카피는 당근 voice 9개 체크리스트 통과 (능동·동네·구체·~해요) + CTA 4가지 후킹 패턴 + 자가 검증 6개 통과. copy-library는 사례 참고만 | `foundation-voice-tone.md` |
