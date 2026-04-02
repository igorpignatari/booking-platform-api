import type { TCreateResource } from "./TCreateResource";

export type TPersistedResource = TCreateResource & {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
