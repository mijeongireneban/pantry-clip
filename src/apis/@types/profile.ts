export type ProfileDto = {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileRequest = {
  username: string;
  avatarUrl: string;
};
