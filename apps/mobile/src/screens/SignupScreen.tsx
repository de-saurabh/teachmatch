import type { AccountType } from "@teachmatch/shared";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { signUp } from "../lib/auth-client";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

const ACCOUNT_TYPES: { label: string; value: AccountType }[] = [
  { label: "Teacher", value: "TEACHER" },
  { label: "School", value: "SCHOOL" },
  { label: "Agency", value: "AGENCY" },
];

export function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("TEACHER");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const { error: signUpError } = await signUp.email({ name, email, password, accountType });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-chalk-board px-6">
      <View className="w-full max-w-sm rounded border-2 border-dashed border-chalk-white/30 px-6 py-8">
        <Text className="font-caveat text-4xl text-chalk-white">Create your account</Text>
        <Text className="mt-1 font-figtree text-chalk-blue">Join TeachMatch as a school, agency, or teacher</Text>

        {error && <Text className="mt-4 font-figtree text-red-400">{error}</Text>}

        <Text className="mt-6 font-figtree-medium text-chalk-white">I am a</Text>
        <View className="mt-2 flex-row gap-2">
          {ACCOUNT_TYPES.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setAccountType(option.value)}
              className={`flex-1 items-center rounded border py-2 ${
                accountType === option.value ? "border-chalk-yellow bg-chalk-yellow" : "border-chalk-white/30"
              }`}
            >
              <Text
                className={`font-figtree-medium ${
                  accountType === option.value ? "text-chalk-boardDeep" : "text-chalk-white"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="mt-4 font-figtree-medium text-chalk-white">Full name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="mt-1 border-b border-dashed border-chalk-white/40 py-2 font-figtree text-chalk-white"
        />

        <Text className="mt-4 font-figtree-medium text-chalk-white">Email</Text>
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
            {submitting ? "Signing up…" : "Sign up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} className="mt-4 items-center">
          <Text className="font-figtree text-chalk-blue">Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
