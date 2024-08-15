import React, { useEffect } from "react";
import { MyNames } from "../components/Register/MyNames";
import { Register } from "../components/Register/Register";
import { SearchInput } from "../components/SearchInput/SearchInput";
import { PageSlider } from "../components/slider/PageSlider";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";

const burnerStorageKey = "scaffoldEth2.burnerWallet.sk";

const EnsSe2 = () => {
  const [page, setPage] = useLocalStorage<number>("page", 0, {
    initializeWithValue: false,
  });
  const [searchItem, setSearchItem] = useLocalStorage<string>(burnerStorageKey, "", {
    initializeWithValue: false,
  });

  const maxPage = 2;

  const nextPageRoot = () => {
    if (page <= maxPage) setPage(page + 1);
    else () => {};
  };
  const prevPageRoot = () => {
    if (page > 0) setPage(page - 1);
    else () => {};
  };

  const gotoPageRoot = (pageNumber: number) => {
    if (pageNumber <= maxPage && pageNumber >= 0) setPage(pageNumber);
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
    <SearchInput handleSearch={handleSearch} gotoPageRoot={gotoPageRoot} />,
    <Register searchItem={searchItem} prevPageRoot={prevPageRoot} gotoPageRoot={gotoPageRoot} />,
    <MyNames gotoPageRoot={gotoPageRoot} />,
    // <Info searchItem={searchItem} prevPage={prevPage} nextPage={nextPage} />,
    // <TimerAlert searchItem={searchItem} prevPage={prevPage} nextPage={nextPage} />,
  ];

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-4">
        {!searchItem ? <>...loading</> : <PageSlider>{components[page]}</PageSlider>}
      </div>
    </>
  );
};

export default EnsSe2;
