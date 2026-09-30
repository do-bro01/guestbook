# 미니 방명록 (Guestbook)

누구나 이름과 메시지를 남길 수 있는 간단한 방명록입니다.
회원가입이나 로그인은 없고, 글을 쓸 때 함께 입력한 비밀번호로 본인 글만 수정·삭제할 수 있습니다.

- **배포 URL**: https://guestbook-202404193.vercel.app

## 주요 기능

| 기능          | 설명                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| 작성          | 이름, 메시지, 비밀번호를 입력해 새 글을 남깁니다.                                                               |
| 조회          | 전체 글 목록을 보여줍니다. (이름, 메시지, 작성 시각)                                                            |
| 수정          | 비밀번호를 입력해 자신이 쓴 글의 메시지를 수정합니다.                                                           |
| 삭제          | 비밀번호를 입력해 자신이 쓴 글을 삭제합니다.                                                                    |
| 좋아요·싫어요 | 글마다 👍 좋아요 / 👎 싫어요를 누를 수 있습니다. 같은 버튼을 다시 누르면 취소되고, 반대 버튼을 누르면 바뀝니다. |
| 정렬          | 최신순(기본)과 좋아요순 중에서 골라 볼 수 있습니다.                                                             |

- 비밀번호가 틀리면 수정·삭제가 거부되고, 해당 글 아래에 "비밀번호가 일치하지 않습니다" 안내가 표시됩니다.
- 입력 제한: 이름 1\~20자, 메시지 1\~500자, 비밀번호 4자 이상
- 메시지 입력창 아래에 `123 / 500` 형식의 글자 수 카운터가 표시되고, 500자를 넘으면 등록 버튼이 비활성화됩니다.
- 작성 시각은 "방금 전", "3분 전", "어제"처럼 상대 시간으로 표시되며, 마우스를 올리면 정확한 시각이 나옵니다.
- 좋아요·싫어요는 글 하나에 한 사람당 하나만 누를 수 있고, 누른 사람만 취소할 수 있습니다. 로그인이 없으므로 "누른 사람"은 브라우저 쿠키로 구분합니다.
- 좋아요·싫어요 버튼과 정렬 버튼은 전체 디자인에 맞춰 무채색으로 표시됩니다.

## 기술 스택

- **프레임워크**: Next.js (App Router) + TypeScript
- **API**: Next.js Route Handlers (API Routes)
- **데이터베이스**: Neon Postgres (`@neondatabase/serverless`, ORM 없이 SQL 직접 작성)
- **테스트**: Vitest (비밀번호 해시, 입력 검증, 좋아요·싫어요 규칙, 상대 시간)
- **배포**: Vercel
- **개발 도구**: Claude Code + Matt Pocock's Skills

## API

| 메서드 | 경로                         | 설명                                                               | 주요 응답          |
| ------ | ---------------------------- | ------------------------------------------------------------------ | ------------------ |
| GET    | `/api/entries`               | 전체 글 목록 (`?sort=latest` 최신순(기본), `?sort=likes` 좋아요순) | 200, 400           |
| POST   | `/api/entries`               | 새 글 작성                                                         | 201, 400           |
| PATCH  | `/api/entries/[id]`          | 메시지 수정 (비밀번호 필요)                                        | 200, 400, 403, 404 |
| DELETE | `/api/entries/[id]`          | 글 삭제 (비밀번호 필요)                                            | 204, 400, 403, 404 |
| POST   | `/api/entries/[id]/reaction` | 좋아요·싫어요 누르기/취소 (`{ "kind": "like" \| "dislike" }`)      | 200, 400, 404      |

- `400`: 입력값 누락, 길이 제한 위반, 잘못된 정렬 값 또는 반응 종류
- `403`: 비밀번호 불일치
- `404`: 존재하지 않는 글
- 목록 응답의 각 글에는 좋아요 수(`likes`), 싫어요 수(`dislikes`), 내가 누른 반응(`myReaction`)이 함께 포함됩니다.

## 보안

- 비밀번호는 평문으로 저장하지 않고, `scrypt` + 랜덤 salt로 해시해 저장합니다.
- 비밀번호 비교는 `timingSafeEqual`로 수행합니다.
- 조회 API 응답에는 비밀번호 해시가 포함되지 않습니다.
- 좋아요·싫어요를 누른 사람은 서버가 발급한 무작위 ID(`voter_id`)로 구분합니다. 이 쿠키는 `httpOnly`라서 페이지 스크립트에서 읽거나 바꿀 수 없습니다.
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

CREATE TABLE reactions (
  entry_id   integer     NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
  voter_id   uuid        NOT NULL,  -- 브라우저 쿠키로 구분한 익명 사용자
  kind       text        NOT NULL,  -- 'like' 또는 'dislike'
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entry_id, voter_id)  -- 글 하나에 한 사람당 반응 하나
);
```

글을 삭제하면 그 글의 좋아요·싫어요도 함께 삭제됩니다.

전체 스키마는 [`db/schema.sql`](db/schema.sql)에 있습니다.

## 폴더 구조

```
app/
  page.tsx                           # 방명록 화면 (단일 페이지)
  _components/                       # 작성 폼, 글 목록, 수정·삭제, 좋아요·싫어요, 정렬 UI
  api/entries/route.ts               # GET, POST
  api/entries/[id]/route.ts          # PATCH, DELETE
  api/entries/[id]/reaction/route.ts # 좋아요·싫어요
lib/
  entries.ts                         # DB 조회·저장 (SQL은 이 파일에만 있음)
  password.ts                        # 비밀번호 해시·검증
  validation.ts                      # 입력값 검증
  reaction.ts                        # 좋아요·싫어요 규칙 (누르기/취소/전환)
  voter.ts                           # 반응한 사람을 구분하는 쿠키
  relative-time.ts                   # "3분 전" 같은 상대 시간 표시
db/schema.sql                        # 테이블 생성 SQL
scripts/db-setup.mjs                 # schema.sql을 DB에 적용 (npm run db:setup)
```

## 개발 과정 (SDD)

Matt Pocock's Skills를 사용해 명세 중심(Spec-Driven Development)으로 개발했습니다.

1. `/grill-with-docs`: 요구사항을 구체화하고 용어집([`GLOSSARY.md`](GLOSSARY.md))과 설계 결정 기록([`docs/adr/`](docs/adr/))을 작성
2. `/to-spec`: 스펙 문서 작성 ([`.scratch/guestbook/spec.md`](.scratch/guestbook/spec.md))
3. `/to-tickets`: 작업을 티켓으로 분해 (작성·조회 / 수정 / 삭제)
4. `/implement`: 티켓 단위로 구현
5. `/code-review`: 컨벤션 준수(Standards)와 스펙 부합(Spec) 두 기준으로 리뷰하고 반영

이후 추가한 기능(좋아요·싫어요, 글자 수 카운터·상대 시간·정렬)은 스펙에 추가 내용을 붙이고 티켓 04–05를 만든 뒤, 테스트를 먼저 작성하는 방식(TDD)으로 구현했습니다. 좋아요·싫어요에서 누른 사람을 쿠키로 구분하기로 한 결정은 [`docs/adr/0006`](docs/adr/0006-anonymous-voter-cookie-for-reactions.md)에 기록했습니다.
