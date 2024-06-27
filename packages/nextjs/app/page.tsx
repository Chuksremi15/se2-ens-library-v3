"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { SearchInput } from "~~/ensLibrary/components/SearchInput/SearchInput";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="font-head  text-blue-500  font-semibold container text-center text-4xl py-10">
          Component test page
        </h1>

        <SearchInput />
      </div>
    </>
  );
};

export default Home;
