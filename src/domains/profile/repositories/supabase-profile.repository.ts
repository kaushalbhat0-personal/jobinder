import type { ProfileRepository } from './profile-repository';
import { UserProfile } from '../entities/user-profile';
import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { InfrastructureError } from '@/shared/core/errors';
import { createSupabaseBrowserClient } from '@/shared/lib/supabase/client';

export class SupabaseProfileRepository implements ProfileRepository {
  async findById(id: string): Promise<UserProfile | null> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;

      return this.hydrate(data);
    } catch {
      return null;
    }
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return this.hydrate(data);
    } catch {
      return null;
    }
  }

  async save(profile: UserProfile): Promise<Result<UserProfile>> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.from('profiles').upsert(
        {
          id: profile.id,
          user_id: profile.userId,
          name: profile.name,
          headline: profile.headline,
          bio: profile.bio,
          avatar_url: profile.avatarUrl,
          location: profile.location,
          skills: profile.skills,
          experience: profile.experience,
          preferences: profile.preferences,
          career_stage: profile.careerStage,
          target_roles: profile.targetRoles,
          preferred_locations: profile.preferredLocations,
          expected_salary_min: profile.expectedSalaryMin,
          expected_salary_max: profile.expectedSalaryMax,
          created_at: profile.createdAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (error)
        return failure(new InfrastructureError(`Failed to save profile: ${error.message}`));

      return success(profile);
    } catch (err) {
      return failure(new InfrastructureError(`Failed to save profile: ${(err as Error).message}`));
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('profiles').delete().eq('id', id);
    } catch {
      /* silent cleanup */
    }
  }

  private hydrate(data: Record<string, unknown>): UserProfile | null {
    const result = UserProfile.create({
      id: data.id as string,
      userId: data.user_id as string,
      name: data.name as string,
      headline: (data.headline as string) ?? null,
      bio: (data.bio as string) ?? null,
      avatarUrl: (data.avatar_url as string) ?? null,
      location: (data.location as string) ?? null,
      skills: (data.skills as string[]) ?? [],
      experience: (data.experience as number) ?? 0,
      preferences: (data.preferences as Record<string, unknown>) ?? {},
      careerStage: (data.career_stage as UserProfile['careerStage']) ?? null,
      targetRoles: (data.target_roles as string[]) ?? [],
      preferredLocations: (data.preferred_locations as string[]) ?? [],
      expectedSalaryMin: (data.expected_salary_min as number) ?? null,
      expectedSalaryMax: (data.expected_salary_max as number) ?? null,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    });

    return result.isSuccess() ? result.value : null;
  }
}
