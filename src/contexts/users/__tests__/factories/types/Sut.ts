import type { UserRepository } from "@contexts/users/application/ports/output/UserRespository";

export type SutType = {
  userRepository: UserRepository;
};
