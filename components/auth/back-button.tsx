"use client";

import { Button } from "../ui/button";
import Link from "next/link";

interface BackButtonProps {
  label: string;
  href: string;
}

export const BackButton = ({ label, href }: BackButtonProps) => {
  return (
    <Button className="font-normal w-full" size={"sm"} variant={"link"} asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
};
