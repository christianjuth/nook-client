"use client";

import React, { memo, useEffect, useState } from "react";
import { ThemeName, ToastProvider } from "@nook/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider, useAuth } from "@nook/app/context/auth";
import * as amplitude from "@amplitude/analytics-browser";
import { Toasts } from "@nook/app/components/toasts";
import { FarcasterUser, GetSignerResponse, Session } from "@nook/app/types";
import { ThemeProvider } from "@nook/app/context/theme";
import { usePathname } from "next/navigation";

const queryClient = new QueryClient();
export const Providers = ({
  children,
  nook,
  session,
  user,
  signer,
}: {
  children: React.ReactNode;
  nook?: string;
  session?: Session;
  user?: FarcasterUser;
  signer?: GetSignerResponse;
}) => {
  return (
    <PrivyLoginProvider>
      <OtherProviders nook={nook} session={session} user={user} signer={signer}>
        {children}
      </OtherProviders>
    </PrivyLoginProvider>
  );
};

const OtherProviders = memo(
  ({
    children,
    nook,
    session,
    user,
    signer,
  }: {
    children: React.ReactNode;
    nook?: string;
    session?: Session;
    user?: FarcasterUser;
    signer?: GetSignerResponse;
  }) => {
    return (
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
    );
  },
);

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
      appId="clsnxqma102qxbyt1ght4j14w"
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
      if (session?.fid) {
        amplitude.init(
          "7819c3ae9a7a78fc6835dcc60cdeb018",
          `fid:${session.fid}`,
        );
      }
    }, [session?.fid]);

    return <>{children}</>;
  },
);
