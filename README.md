# 미니 방명록 (Guestbook)

누구나 이름과 메시지를 남길 수 있는 간단한 방명록입니다.
회원가입이나 로그인은 없고, 글을 쓸 때 함께 입력한 비밀번호로 본인 글만 수정·삭제할 수 있습니다.

- **배포 URL**: https://guestbook-202404193.vercel.app

## 주요 기능

| 기능 | 설명                                                                 |
| ---- | -------------------------------------------------------------------- |
| 작성 | 이름, 메시지, 비밀번호를 입력해 새 글을 남깁니다.                    |
| 조회 | 전체 글 목록을 최신 작성순으로 보여줍니다. (이름, 메시지, 작성 시각) |
| 수정 | 비밀번호를 입력해 자신이 쓴 글의 메시지를 수정합니다.                |
| 삭제 | 비밀번호를 입력해 자신이 쓴 글을 삭제합니다.                         |

- 비밀번호가 틀리면 수정·삭제가 거부되고, 해당 글 아래에 "비밀번호가 일치하지 않습니다" 안내가 표시됩니다.
- 입력 제한: 이름 1\~20자, 메시지 1\~500자, 비밀번호 4자 이상

## 기술 스택

- **프레임워크**: Next.js (App Router) + TypeScript
- **API**: Next.js Route Handlers (API Routes)
- **데이터베이스**: Neon Postgres (`@neondatabase/serverless`, ORM 없이 SQL 직접 작성)
- **배포**: Vercel
- **개발 도구**: Claude Code + Matt Pocock's Skills

## API

| 메서드 | 경로                | 설명                        | 주요 응답          |
| ------ | ------------------- | --------------------------- | ------------------ |
| GET    | `/api/entries`      | 전체 글 목록 (최신순)       | 200                |
| POST   | `/api/entries`      | 새 글 작성                  | 201, 400           |
| PATCH  | `/api/entries/[id]` | 메시지 수정 (비밀번호 필요) | 200, 400, 403, 404 |
| DELETE | `/api/entries/[id]` | 글 삭제 (비밀번호 필요)     | 204, 400, 403, 404 |

- `400`: 입력값 누락 또는 길이 제한 위반
- `403`: 비밀번호 불일치
- `404`: 존재하지 않는 글

## 보안

- 비밀번호는 평문으로 저장하지 않고, `scrypt` + 랜덤 salt로 해시해 저장합니다.
- 비밀번호 비교는 `timingSafeEqual`로 수행합니다.
- 조회 API 응답에는 비밀번호 해시가 포함되지 않습니다.
- DB 연결 문자열은 환경변수(`DATABASE_URL`)로만 관리하며 저장소에 올리지 않습니다.

## 데이터베이스

```sql
CREATE TABLE entries (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          text        NOT NULL,  -- 1~20자
  message       text        NOT NULL,  -- 1~500자
  password_hash text        NOT NULL,  -- "salt:hash" 형식
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

전체 스키마는 [`db/schema.sql`](db/schema.sql)에 있습니다.

## 폴더 구조

```
app/
  page.tsx                  # 방명록 화면 (단일 페이지)
  _components/              # 작성 폼, 글 목록, 수정·삭제 UI
  api/entries/route.ts      # GET, POST
  api/entries/[id]/route.ts # PATCH, DELETE
lib/
  entries.ts                # DB 조회·저장 (SQL은 이 파일에만 있음)
  password.ts               # 비밀번호 해시·검증
  validation.ts             # 입력값 검증
db/schema.sql               # 테이블 생성 SQL
```

## 개발 과정 (SDD)

Matt Pocock's Skills를 사용해 명세 중심(Spec-Driven Development)으로 개발했습니다.

1. `/grill-with-docs`: 요구사항을 구체화하고 용어집([`GLOSSARY.md`](GLOSSARY.md))과 설계 결정 기록([`docs/adr/`](docs/adr/))을 작성
2. `/to-spec`: 스펙 문서 작성 ([`.scratch/guestbook/spec.md`](.scratch/guestbook/spec.md))
3. `/to-tickets`: 작업을 티켓으로 분해 (작성·조회 / 수정 / 삭제)
4. `/implement`: 티켓 단위로 구현
5. `/code-review`: 컨벤션 준수(Standards)와 스펙 부합(Spec) 두 기준으로 리뷰하고 반영
