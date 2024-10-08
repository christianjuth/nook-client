"use client";

import React, { memo, useEffect, useState } from "react";
import { ThemeName, ToastProvider } from "@nook/app-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider, useAuth } from "@nook/app/context/auth";
import * as amplitude from "@amplitude/analytics-browser";
import { Toasts } from "@nook/app/components/toasts";
import {
  FarcasterUserV1,
  GetSignerResponse,
  Session,
} from "@nook/common/types";
import { ThemeProvider } from "@nook/app/context/theme";
import { usePathname } from "next/navigation";

const queryClient = new QueryClient();
export const Providers = ({
  children,
  session,
  user,
  signer,
}: {
  children: React.ReactNode;
  session?: Session;
  user?: FarcasterUserV1;
  signer?: GetSignerResponse;
}) => {
  return (
    <PrivyLoginProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider
          defaultSession={session}
          defaultUser={user}
          defaultSigner={signer}
        >
          <ThemeProvider defaultTheme={session?.theme as ThemeName | undefined}>
            <AnalyticsProvider>
              <ToastProvider>
                <Toasts />
                {children}
              </ToastProvider>
            </AnalyticsProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </PrivyLoginProvider>
  );
};

const PrivyLoginProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [loginMethods, setLoginMethods] = useState<("farcaster" | "wallet")[]>([
    "farcaster",
    "wallet",
  ]);

  useEffect(() => {
    if (pathname === "/signup") {
      setLoginMethods(["wallet"]);
    } else {
      setLoginMethods((prev) =>
        prev.includes("farcaster") ? prev : ["farcaster", "wallet"],
      );
    }
  }, [pathname]);

  return (
    <PrivyProvider
      appId="cm1jvb01r03lmqwb292sv3v61"
      clientId="client-WY5bqR95tgfJFXnxfxKMNdQFKvY6TSsLzRCTptyp6YPUw"
      config={{
        appearance: { logo: "", theme: "dark" },
        loginMethods,
      }}
    >
      {children}
    </PrivyProvider>
  );
};

const AnalyticsProvider = memo(
  ({ children }: { children: React.ReactNode }) => {
    const { session } = useAuth();

    useEffect(() => {
      if (session) {
        amplitude.init(
          "7819c3ae9a7a78fc6835dcc60cdeb018",
          `user:${session.id}`,
        );
        amplitude.track("login", { fid: session.fid });
      }
    }, [session]);

    return <>{children}</>;
  },
);
