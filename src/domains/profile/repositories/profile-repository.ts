export interface ProfileRepository {
  findById(id: string): Promise<unknown>;
  save(data: unknown): Promise<void>;
}
