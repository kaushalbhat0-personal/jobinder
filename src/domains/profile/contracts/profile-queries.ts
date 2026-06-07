export interface ProfileQueryContract {
  getProfile(
    userId: string,
  ): Promise<{
    id: string;
    name: string;
    headline: string | null;
    avatarUrl: string | null;
    skills: string[];
  } | null>;
  getPreferences(userId: string): Promise<Record<string, unknown>>;
}
