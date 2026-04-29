"use client";

import { LandingPage } from "@/components/LandingPage";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/AppContext";

export default function LandingPageClient() {
  const router = useRouter();
  const { language } = useAppContext();

  return (
    <LandingPage
      onCreate={() => router.push("/event/new")}
      onNavigate={(v) => {
        if (v === "dashboard") router.push("/dashboard");
        else if (v === "teams") router.push("/teams");
        else if (v === "calendar") router.push("/calendar");
        else router.push(`/${v}`);
      }}
      language={language}
    />
  );
}
