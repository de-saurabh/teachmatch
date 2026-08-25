import { BrowserRouter, Route, Routes } from "react-router";

import { AppShell } from "./routes/AppShell";
import { DashboardPage } from "./routes/DashboardPage";
import { JobApplicantsPage } from "./routes/JobApplicantsPage";
import { JobsBrowsePage } from "./routes/JobsBrowsePage";
import { LoginPage } from "./routes/LoginPage";
import { MyJobPostingsPage } from "./routes/MyJobPostingsPage";
import { NewJobPostingPage } from "./routes/NewJobPostingPage";
import { OnboardingSchoolPage } from "./routes/OnboardingSchoolPage";
import { OnboardingTeacherPage } from "./routes/OnboardingTeacherPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { SignupPage } from "./routes/SignupPage";

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
          path="/jobs/:id/applicants"
          element={
            <ProtectedRoute>
              <AppShell>
                <JobApplicantsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
