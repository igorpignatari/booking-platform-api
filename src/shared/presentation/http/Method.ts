export type Method = "get" | "post" | "put" | "delete" | "patch";

export const Methods = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
  PATCH: "patch",
} as const;
