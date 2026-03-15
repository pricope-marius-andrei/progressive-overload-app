import { supabase, SUPABASE_CONFIG_ERROR } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContextType } from "./auth/auth.types";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const normalizeAuthError = (rawMessage: string): string => {
  const message = rawMessage.trim();
  const normalized = message.toLowerCase();

  if (
    normalized.includes("oauth") &&
    normalized.includes("secret") &&
    normalized.includes("missing")
  ) {
    return "Google OAuth is not fully configured in Supabase. Add Google Client ID and Client Secret in Supabase Dashboard -> Authentication -> Providers -> Google, then try again.";
  }

  if (
    normalized.includes("provider") &&
    (normalized.includes("disabled") || normalized.includes("not enabled"))
  ) {
    return "Google provider is disabled in Supabase. Enable it in Dashboard -> Authentication -> Providers -> Google.";
  }

  return message;
};

const parseQueryParams = (url: string): URLSearchParams => {
  const queryStartIndex = url.indexOf("?");
  if (queryStartIndex < 0) {
    return new URLSearchParams();
  }

  const hashStartIndex = url.indexOf("#", queryStartIndex);
  const queryString =
    hashStartIndex >= 0
      ? url.slice(queryStartIndex + 1, hashStartIndex)
      : url.slice(queryStartIndex + 1);

  return new URLSearchParams(queryString);
};

const parseHashParams = (url: string): URLSearchParams => {
  const hashStartIndex = url.indexOf("#");
  if (hashStartIndex < 0) {
    return new URLSearchParams();
  }

  return new URLSearchParams(url.slice(hashStartIndex + 1));
};

const completeOAuthSession = async (redirectedUrl: string): Promise<void> => {
  const queryParams = parseQueryParams(redirectedUrl);
  const hashParams = parseHashParams(redirectedUrl);

  const accessToken =
    hashParams.get("access_token") ?? queryParams.get("access_token");
  const refreshToken =
    hashParams.get("refresh_token") ?? queryParams.get("refresh_token");
  const authCode = queryParams.get("code");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  if (authCode) {
    const { error } = await supabase.auth.exchangeCodeForSession(authCode);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  throw new Error("Missing OAuth tokens in callback URL.");
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (SUPABASE_CONFIG_ERROR) {
      setAuthError(SUPABASE_CONFIG_ERROR);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw new Error(error.message);
        }

        if (isMounted) {
          setSession(data.session);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        if (isMounted) {
          setAuthError(normalizeAuthError(message));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (SUPABASE_CONFIG_ERROR) {
      setAuthError(SUPABASE_CONFIG_ERROR);
      throw new Error(SUPABASE_CONFIG_ERROR);
    }

    setAuthError(null);
    setIsSigningIn(true);

    try {
      const redirectTo = "progressiveoverloadapp://auth/callback";

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.url) {
        throw new Error("Missing Google OAuth URL.");
      }

      const browserResult = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (browserResult.type !== "success" || !browserResult.url) {
        if (
          browserResult.type === "cancel" ||
          browserResult.type === "dismiss"
        ) {
          throw new Error("Google sign in was cancelled.");
        }

        throw new Error("Google sign in did not complete.");
      }

      await completeOAuthSession(browserResult.url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setAuthError(normalizeAuthError(message));
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (SUPABASE_CONFIG_ERROR) {
      setAuthError(SUPABASE_CONFIG_ERROR);
      throw new Error(SUPABASE_CONFIG_ERROR);
    }

    setAuthError(null);

    const { error } = await supabase.auth.signOut();
    if (error) {
      const message = error.message;
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      isSigningIn,
      authError,
      signInWithGoogle,
      signOut,
    }),
    [session, isLoading, isSigningIn, authError, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
