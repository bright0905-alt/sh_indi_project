"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StudyPanel } from "@/components/study/study-panel";
import { WordBook } from "@/components/word-book/word-book";

export function AppShell() {
  return (
    <Tabs defaultValue="study" className="mx-auto w-full max-w-5xl @container">
      <TabsList>
        <TabsTrigger value="study">학습</TabsTrigger>
        <TabsTrigger value="wordbook">단어장</TabsTrigger>
        <TabsTrigger value="sentences">문장 노트</TabsTrigger>
        <TabsTrigger value="quiz">복습 퀴즈</TabsTrigger>
      </TabsList>

      <TabsContent value="study" className="mt-5">
        <StudyPanel />
      </TabsContent>
      <TabsContent value="wordbook" className="mt-5">
        <WordBook />
      </TabsContent>
      <TabsContent value="sentences" className="mt-5">
        <p className="text-sm text-muted-foreground">준비 중입니다.</p>
      </TabsContent>
      <TabsContent value="quiz" className="mt-5">
        <p className="text-sm text-muted-foreground">준비 중입니다.</p>
      </TabsContent>
    </Tabs>
  );
}
