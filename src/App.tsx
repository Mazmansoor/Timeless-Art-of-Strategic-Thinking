import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { PlatformProvider } from './context/PlatformContext.tsx';
import Layout from './components/Layout.tsx';
import HomePage from './pages/HomePage.tsx';
import LearnIndexPage from './pages/LearnIndexPage.tsx';
import LessonPage from './pages/LessonPage.tsx';
import StrategyLabPage from './pages/StrategyLabPage.tsx';
import LibraryPage from './pages/LibraryPage.tsx';
import ForTeamsPage from './pages/ForTeamsPage.tsx';
import BookPage from './pages/BookPage.tsx';
import WorkspacePage from './pages/WorkspacePage.tsx';
import ProgramsPage from './pages/ProgramsPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import { AboutPage, PrivacyPage, SourcesPage } from './pages/SecondaryPages.tsx';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <PlatformProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/learn" element={<LearnIndexPage />} />
              <Route path="/learn/:slug" element={<LessonPage />} />
              <Route path="/strategy-lab" element={<StrategyLabPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/library/:kind/:slug" element={<LibraryPage />} />
              <Route path="/for-teams" element={<ForTeamsPage />} />
              <Route path="/book" element={<BookPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PlatformProvider>
    </MotionConfig>
  );
}
