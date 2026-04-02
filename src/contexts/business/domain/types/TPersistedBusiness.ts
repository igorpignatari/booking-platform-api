import type { TCreateBusiness } from "./TCreateBusiness";

export type TPersistedBusiness = TCreateBusiness & {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
