import { StudyPanel } from "@/components/study/study-panel";

export default function Page() {
  return (
    <main className="min-h-dvh p-6">
      <h1 className="mx-auto mb-6 max-w-3xl text-xl font-bold">영어 학습 도우미</h1>
      <StudyPanel />
    </main>
  );
}
