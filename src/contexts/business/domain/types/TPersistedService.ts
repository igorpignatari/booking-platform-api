import type { TCreateService } from "./TCreateService";

export type TPersistedService = TCreateService & {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
