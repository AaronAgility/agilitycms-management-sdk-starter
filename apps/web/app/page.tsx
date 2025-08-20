"use client";

import {
  AuthProvider,
  LoginPanel,
} from "@agility/auth-tools/components";
import { configureSdkAdapter } from "@agility/auth-tools/adapters";
import * as ManagementSDK from "@agility/management-sdk";
import { useRouter } from "next/navigation";

// Configure the auth-tools SDK adapter with the management SDK
configureSdkAdapter(ManagementSDK);

function LoginContent() {
  const router = useRouter();

  // Show login panel - middleware handles redirects for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <LoginPanel
          config={{
            title: "Agility CMS",
            buttonText: "Authenticate with Agility",
            theme: "dark",
            onSignIn: () => {
              router.push("/protected");
            }
          }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
