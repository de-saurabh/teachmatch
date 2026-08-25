import { BrowserRouter, Route, Routes } from "react-router";

import { AdminVerificationsPage } from "./routes/AdminVerificationsPage";
import { AppShell } from "./routes/AppShell";
import { DashboardPage } from "./routes/DashboardPage";
import { EditJobPostingPage } from "./routes/EditJobPostingPage";
import { JobApplicantsPage } from "./routes/JobApplicantsPage";
import { JobsBrowsePage } from "./routes/JobsBrowsePage";
import { LoginPage } from "./routes/LoginPage";
import { MyApplicationsPage } from "./routes/MyApplicationsPage";
import { MyJobPostingsPage } from "./routes/MyJobPostingsPage";
import { NewJobPostingPage } from "./routes/NewJobPostingPage";
import { NotificationsPage } from "./routes/NotificationsPage";
import { OnboardingSchoolPage } from "./routes/OnboardingSchoolPage";
import { OnboardingTeacherPage } from "./routes/OnboardingTeacherPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { SchoolMatchesPage } from "./routes/SchoolMatchesPage";
import { SignupPage } from "./routes/SignupPage";
import { TeacherMatchesPage } from "./routes/TeacherMatchesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/school"
          element={
            <ProtectedRoute>
              <AppShell>
                <OnboardingSchoolPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/teacher"
          element={
            <ProtectedRoute>
              <AppShell>
                <OnboardingTeacherPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <AppShell>
                <JobsBrowsePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <NewJobPostingPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/mine"
          element={
            <ProtectedRoute>
              <AppShell>
                <MyJobPostingsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/edit"
          element={
            <ProtectedRoute>
              <AppShell>
                <EditJobPostingPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/applicants"
          element={
            <ProtectedRoute>
              <AppShell>
                <JobApplicantsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/matches"
          element={
            <ProtectedRoute>
              <AppShell>
                <SchoolMatchesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches/mine"
          element={
            <ProtectedRoute>
              <AppShell>
                <TeacherMatchesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/mine"
          element={
            <ProtectedRoute>
              <AppShell>
                <MyApplicationsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppShell>
                <NotificationsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute>
              <AppShell>
                <AdminVerificationsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
