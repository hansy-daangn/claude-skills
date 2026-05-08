# 자주 있는 실패 패턴 → 처방

생성 후 스크린샷 검증에서 문제가 보이면 이 표를 참고해 원인 파일을 다시 확인한다.

| 증상 | 처방 | 원인 파일 |
|---|---|---|
| 텍스트 겹침 | `calcH()` 사용 확인 | `foundation-typography.md` |
| 텍스트가 프레임 밖으로 | `fitSize()` 적용 확인 | `foundation-typography.md` |
| 로고가 이모지/SVG | `importComponentByKeyAsync` 확인 | `foundation-logo.md` |
| 카피 밍밍함 | copy-library 템플릿 사용 + voice 9개 체크리스트 재실행 | `foundation-voice-tone.md`, `copy-library.md` |
| Landscape에서 로고↔텍스트 충돌 | `layC` 수직 안전 로직 확인 | `figma-generator.md` |
| 색 hex가 SEED와 다름 | Drift 알림 참고, Role 토큰 정확값으로 교체 | `foundation-color.md` |
| 큰 배너에서 padding이 점처럼 좁음 | 비율 공식 + clamp 적용 확인 | `foundation-spacing.md` |
| 카피에 "할인", "최저가" 같은 마케팅어 섞임 | voice 자가 검증 6개 재실행, 능동·동네·구체 위배 확인 | `foundation-voice-tone.md` |
