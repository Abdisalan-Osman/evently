"use client";

import { headerLinks } from "@/constants";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((header) => {
        const isActive = pathname === header.route;

        return (
          <li
            key={header.label}
            className={`${
              isActive && "text-primary-500"
            } flex-center p-medium-16 whitespace-nowrap `}
          >
            <Link href={header.route} className="text-[20px]">
              {header.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default Navbar;
