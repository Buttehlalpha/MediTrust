// The original project used Lovable's `@lovable.dev/cloud-auth-js` OAuth
// broker, which only works inside the Lovable editor/preview environment.
// Outside Lovable this calls Supabase's own OAuth flow directly instead —
// Google (or any other provider) must be enabled in your Supabase project's
// Authentication > Providers settings first.
import { supabase } from "@/integrations/supabase/client";

type OAuthResult = { error: Error | null; redirected: boolean };

export const lovable = {
  auth: {
    async signInWithOAuth(
      provider: "google",
      opts: { redirect_uri: string },
    ): Promise<OAuthResult> {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: opts.redirect_uri },
      });
      if (error) return { error, redirected: false };
      // Supabase performs a full-page redirect to the provider's consent
      // screen, so execution normally never reaches past this point.
      return { error: null, redirected: true };
    },
  },
};
