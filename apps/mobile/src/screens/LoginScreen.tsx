import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { signIn } from "../lib/auth-client";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn.email({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message ?? "Invalid email or password.");
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-chalk-board px-6">
      <View className="w-full max-w-sm rounded border-2 border-dashed border-chalk-white/30 px-6 py-8">
        <Text className="font-caveat text-4xl text-chalk-white">Welcome back</Text>
        <Text className="mt-1 font-figtree text-chalk-blue">Log in to your TeachMatch account</Text>

        {error && <Text className="mt-4 font-figtree text-red-400">{error}</Text>}

        <Text className="mt-6 font-figtree-medium text-chalk-white">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="mt-1 border-b border-dashed border-chalk-white/40 py-2 font-figtree text-chalk-white"
        />

        <Text className="mt-4 font-figtree-medium text-chalk-white">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="mt-1 border-b border-dashed border-chalk-white/40 py-2 font-figtree text-chalk-white"
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="mt-6 items-center rounded bg-chalk-yellow py-3"
        >
          <Text className="font-figtree-semibold text-chalk-boardDeep">
            {submitting ? "Logging in…" : "Log in"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")} className="mt-4 items-center">
          <Text className="font-figtree text-chalk-blue">Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
