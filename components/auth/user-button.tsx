"use client";

import { FaUser } from "react-icons/fa";
import { ExitIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "./logout-button";

export const UserButton = () => {
  const user = useCurrentUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage
            className="h-10 w-10 rounded-full"
            src={user?.image || ""}
          />
          <AvatarFallback className="bg-sky-500 flex items-center justify-center h-10 w-10 rounded-full">
            <FaUser className="text-white" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 bg-white rounded p-2" align="end">
        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className="h-4 w-4 mr-2 inline" />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
