import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CoursesPage } from "@/features/courses/pages/CoursesPage";
import { LearnPage } from "@/features/learn/pages/LearnPage";
import { PracticePage } from "@/features/practice/pages/PracticePage";
import { AnalysisPage } from "@/features/analysis/pages/AnalysisPage";
import { NavigatorPage } from "@/features/navigator/pages/NavigatorPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { MockTestPage } from "@/features/mock-test/pages/MockTestPage";
import { ChapterTestPage } from "@/features/chapter-test/pages/ChapterTestPage";
import { CurrentAffairsPage } from "@/features/current-affairs/pages/CurrentAffairsPage";
import { MockSchedulePage } from "@/features/mock-schedule/pages/MockSchedulePage";

export function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* App shell with persistent navigation */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mock-test" element={<MockTestPage />} />
          <Route path="/chapter-test" element={<ChapterTestPage />} />
          <Route path="/mock-schedule" element={<MockSchedulePage />} />
          <Route path="/current-affairs" element={<CurrentAffairsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/navigator" element={<NavigatorPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
