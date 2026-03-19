import type { Role } from "../valueObjects/Role";

export type TPersistedUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
};
