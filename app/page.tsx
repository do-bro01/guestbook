import { DEVELOPER_NAME, STUDENT_ID } from "@/lib/developer";
import { Guestbook } from "./_components/Guestbook";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold">미니 방명록</h1>
        <p className="text-sm text-zinc-500">
          자유롭게 글을 남기고, 비밀번호로 내 글을 수정하거나 삭제할 수 있어요.
        </p>
      </header>
      <main className="flex-1">
        <Guestbook />
      </main>
      <footer className="border-t border-black/10 pt-4 text-center text-sm text-zinc-500 dark:border-white/15">
        개발자: {DEVELOPER_NAME} ({STUDENT_ID})
      </footer>
    </div>
  );
}
