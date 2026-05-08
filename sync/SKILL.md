---
name: sync
description: |
  `~/.claude/skills` 디렉토리(= 이 repo의 작업 본)를 GitHub에 동기화하는 스킬.

  **`#동기화` 키워드가 있을 때만 발동.**

  **발동 안 함:** 일반 git 작업, 다른 repo push, 자연어 "동기화 좀 해줘"(해시태그 없으면 무시).

  변경된 스킬 파일을 staging → 변경 요약을 commit message에 포함 → push. 충돌·인증 실패는 사용자에게 그대로 전달.
---

# sync 스킬

`#동기화` 감지 시 아래 순서로 실행한다.

## 1. 변경 확인

```bash
cd ~/.claude/skills && git status --short
```

- 출력 비어있음 → "변경 없음. 종료." 출력하고 끝.
- 변경 있음 → 다음 단계.

## 2. 요약 + 커밋

```bash
cd ~/.claude/skills && \
  CHANGES=$(git diff --stat HEAD 2>/dev/null; git status --short) && \
  git add -A && \
  git commit -m "sync: $(date '+%Y-%m-%d %H:%M')

$CHANGES"
```

커밋 메시지 본문에 `git diff --stat` 요약을 넣어 나중에 어떤 스킬이 바뀌었는지 추적 가능하게 한다.

## 3. 푸시

```bash
cd ~/.claude/skills && git push
```

네트워크 오류면 2s → 4s → 8s → 16s 백오프로 최대 4회 재시도.

## 4. 실패 분기

| 케이스 | 처방 |
|---|---|
| `nothing to commit` | "변경 없음. 종료." 출력 후 끝 |
| `Authentication failed` / 401 | "GitHub 인증 만료. `gh auth login` 또는 PAT 갱신 필요." 출력 |
| `non-fast-forward` / rejected | `git pull --rebase` 후 재시도 (충돌 시 사용자에게 맡김) |
| 머지 충돌 | 충돌 파일 목록 출력 → 사용자에게 해결 요청. 자동 resolve 금지 |
| 그 외 에러 | stderr 그대로 출력 |

## 성공 출력 예시

**변경 있음:**
```
✅ 동기화 완료
- 커밋: sync: 2026-05-08 14:32
- 변경:
  ad-banner/SKILL.md       | 18 +++---
  ad-banner/references/rules.md | 14 ++++++
  seed-design/SKILL.md     | 42 +++++-----
- push: origin/main
```

**변경 없음:**
```
변경 없음. 종료.
```

**인증 실패:**
```
❌ 동기화 실패: GitHub 인증 만료
→ gh auth login 또는 PAT 갱신 후 다시 #동기화 실행
```
