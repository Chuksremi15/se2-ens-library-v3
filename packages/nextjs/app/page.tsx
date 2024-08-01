"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useLocalStorage } from "usehooks-ts";
import { useAccount, useChainId } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { Info } from "~~/ensLibrary/components/Info/Info";
import { Register } from "~~/ensLibrary/components/Register/Register";
import TimerAlert from "~~/ensLibrary/components/Register/TimerAlert";
import { RegistrationReducerDataItem } from "~~/ensLibrary/components/Register/types";
import { SearchInput } from "~~/ensLibrary/components/SearchInput/SearchInput";
import { PageSlider } from "~~/ensLibrary/components/slider/PageSlider";
import useRegistrationReducer from "~~/ensLibrary/hooks/useRegistrationReducer";
import { isEmpty } from "~~/ensLibrary/utils/ensUtils";

const burnerStorageKey = "scaffoldEth2.burnerWallet.sk";

const Home: NextPage = () => {
  const [page, setPage] = useLocalStorage<number>("page", 0, {
    initializeWithValue: false,
  });
  const [searchItem, setSearchItem] = useLocalStorage<string>(burnerStorageKey, "", {
    initializeWithValue: false,
  });

  console.log("search Item: ", searchItem);
  const { address: connectedAddress } = useAccount();

  const maxPage = 2;

  const nextPageRoot = () => {
    if (page < maxPage) setPage(page + 1);
    else () => {};
  };
  const prevPageRoot = () => {
    if (page > 0) setPage(page - 1);
    else () => {};
  };

  // useEffect(() => {
  //   window.addEventListener("unload", handlesCompUnload);

  //   return () => {
  //     window.removeEventListener("unload", handlesCompUnload);
  //   };
  // }, []);

  // const handlesCompUnload = () => {
  //   setPage(0);
  // };

  const handleSearch = (input: string) => {
    setSearchItem(input);
    nextPageRoot();
  };

  const components = [
    <SearchInput setSearchItem={setSearchItem} nextPageRoot={nextPageRoot} handleSearch={handleSearch} />,
    <Register searchItem={searchItem} prevPageRoot={prevPageRoot} />,
    // <Info searchItem={searchItem} prevPage={prevPage} nextPage={nextPage} />,
    // <TimerAlert searchItem={searchItem} prevPage={prevPage} nextPage={nextPage} />,
  ];

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-4">
        <h1 className="font-head  text-blue-500  font-semibold container text-center text-4xl pb-8">
          Component test page
        </h1>
        {!searchItem ? <>...loading</> : <PageSlider>{components[page]}</PageSlider>}
      </div>
    </>
  );
};

export default Home;
