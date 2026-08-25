import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";

import { apiFetch } from "../lib/api";
import { signOut, useSession } from "../lib/auth-client";

interface TeacherMatch {
  id: string;
  score: number;
  jobPosting: {
    id: string;
    subject: string;
    gradeLevel: string;
    board: string;
    city: string;
    state: string;
    schoolName: string;
  };
}

interface SchoolMatch {
  id: string;
  score: number;
  teacher: {
    fullName: string;
    subjects: string[];
    gradeLevels: string[];
    experienceYears: number;
    city: string;
    state: string;
  };
}

interface MyJobPosting {
  id: string;
  subject: string;
  gradeLevel: string;
  status: "OPEN" | "FILLED" | "CLOSED";
}

function TopBar({ subtitle }: { subtitle: string }) {
  return (
    <View className="flex-row items-center justify-between border-b-2 border-dashed border-chalk-white/25 px-5 py-4">
      <View>
        <Text className="font-caveat text-2xl text-chalk-white">TeachMatch</Text>
        <Text className="font-figtree text-xs text-chalk-blue">{subtitle}</Text>
      </View>
      <TouchableOpacity onPress={() => signOut()} className="rounded border border-chalk-white/40 px-3 py-1.5">
        <Text className="font-figtree-medium text-chalk-white">Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyDeck({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center font-figtree text-chalk-blue">{message}</Text>
    </View>
  );
}

function useSwipe(matchQueryKey: unknown[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, direction }: { matchId: string; direction: "LIKE" | "PASS" }) =>
      apiFetch<{ matched: boolean }>(`/api/matches/${matchId}/swipe`, {
        method: "POST",
        body: JSON.stringify({ direction }),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: matchQueryKey });
      if (result.matched) {
        Alert.alert("It's a match!", "Added to the applicant pipeline.");
      }
    },
  });
}

function TeacherSwipeDeck() {
  const { data, isPending } = useQuery({
    queryKey: ["matches", "mine"],
    queryFn: () => apiFetch<{ matches: TeacherMatch[] }>("/api/matches/mine"),
  });
  const swipe = useSwipe(["matches", "mine"]);

  if (isPending) return <EmptyDeck message="Loading suggestions…" />;
  if (!data || data.matches.length === 0) {
    return <EmptyDeck message="No suggestions right now — check back once more schools post jobs." />;
  }

  return (
    <Swiper<TeacherMatch>
      cards={data.matches}
      stackSize={3}
      backgroundColor="transparent"
      onSwipedRight={(index) => swipe.mutate({ matchId: data.matches[index].id, direction: "LIKE" })}
      onSwipedLeft={(index) => swipe.mutate({ matchId: data.matches[index].id, direction: "PASS" })}
      renderCard={(match) => (
        <View className="flex-1 justify-center rounded-lg border-2 border-dashed border-chalk-white/30 bg-chalk-panel p-6">
          <Text className="font-figtree-semibold text-2xl text-chalk-white">
            {match.jobPosting.subject} · {match.jobPosting.gradeLevel}
          </Text>
          <Text className="mt-2 font-figtree text-chalk-blue">{match.jobPosting.schoolName}</Text>
          <Text className="mt-1 font-figtree text-chalk-blue">
            {match.jobPosting.board} · {match.jobPosting.city}, {match.jobPosting.state}
          </Text>
          <Text className="mt-6 font-figtree text-xs uppercase tracking-wide text-chalk-yellow">
            Swipe right to like, left to pass
          </Text>
        </View>
      )}
    />
  );
}

function SchoolSwipeDeck() {
  const { data: postings, isPending: postingsPending } = useQuery({
    queryKey: ["job-postings", "mine"],
    queryFn: () => apiFetch<{ postings: MyJobPosting[] }>("/api/job-postings/mine"),
  });

  const openPosting = postings?.postings.find((posting) => posting.status === "OPEN");

  const { data, isPending } = useQuery({
    queryKey: ["matches", "job-postings", openPosting?.id],
    queryFn: () => apiFetch<{ matches: SchoolMatch[] }>(`/api/matches/job-postings/${openPosting!.id}`),
    enabled: Boolean(openPosting),
  });
  const swipe = useSwipe(["matches", "job-postings", openPosting?.id]);

  if (postingsPending || (openPosting && isPending)) return <EmptyDeck message="Loading candidates…" />;
  if (!openPosting) return <EmptyDeck message="Post an open job to start seeing candidates." />;
  if (!data || data.matches.length === 0) {
    return <EmptyDeck message="No candidates yet for this posting — check back once more teachers sign up." />;
  }

  return (
    <Swiper<SchoolMatch>
      cards={data.matches}
      stackSize={3}
      backgroundColor="transparent"
      onSwipedRight={(index) => swipe.mutate({ matchId: data.matches[index].id, direction: "LIKE" })}
      onSwipedLeft={(index) => swipe.mutate({ matchId: data.matches[index].id, direction: "PASS" })}
      renderCard={(match) => (
        <View className="flex-1 justify-center rounded-lg border-2 border-dashed border-chalk-white/30 bg-chalk-panel p-6">
          <Text className="font-figtree-semibold text-2xl text-chalk-white">{match.teacher.fullName}</Text>
          <Text className="mt-2 font-figtree text-chalk-blue">
            {match.teacher.experienceYears} yrs experience · {match.teacher.city}, {match.teacher.state}
          </Text>
          <Text className="mt-2 font-figtree text-chalk-white">
            {match.teacher.subjects.join(", ")} · {match.teacher.gradeLevels.join(", ")}
          </Text>
          <Text className="mt-6 font-figtree text-xs uppercase tracking-wide text-chalk-yellow">
            Swipe right to like, left to pass
          </Text>
        </View>
      )}
    />
  );
}

export function SwipeScreen() {
  const { data: session } = useSession();
  const accountType = session?.user.accountType;
  const [subtitle] = useState(
    accountType === "SCHOOL" ? "Suggested candidates" : "Suggested for you",
  );

  return (
    <View className="flex-1 bg-chalk-board">
      <TopBar subtitle={subtitle} />
      {accountType === "TEACHER" && <TeacherSwipeDeck />}
      {accountType === "SCHOOL" && <SchoolSwipeDeck />}
      {accountType !== "TEACHER" && accountType !== "SCHOOL" && (
        <EmptyDeck message="Swiping is available for teacher and school accounts." />
      )}
    </View>
  );
}
