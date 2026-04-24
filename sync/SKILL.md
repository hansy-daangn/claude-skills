---
name: sync
description: |
  ~/.claude/skills 를 GitHub에 동기화하는 스킬.
  `#동기화` 키워드가 있을 때만 발동. 자연어로는 발동하지 않는다.
  변경된 스킬 파일을 커밋하고 push한다.
---

# sync 스킬

`#동기화` 감지 시 즉시 아래 Bash 명령 실행:

```bash
cd ~/.claude/skills && git add -A && git commit -m "sync: $(date '+%Y-%m-%d %H:%M')" && git push
```

- 변경사항 없으면 "nothing to commit" — 그대로 종료
- push 성공 시 "✅ 동기화 완료" 출력
- 실패 시 에러 메시지 그대로 출력
