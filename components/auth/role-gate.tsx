"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import { FormError } from "../form-error";

type Role = "ADMIN" | "USER";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: Role;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const role = useCurrentRole();

  if (role !== allowedRole) {
    return (
      <FormError message="You don't have permission to view this content" />
    );
  }

  return <>{children}</>;
};
