import React, { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { SearchResult } from "./SearchResult";
import { useTheme } from "next-themes";
import { useLocalStorage } from "usehooks-ts";
import { isAddress } from "viem";
import { useGasPrice } from "wagmi";
import { Squares2X2Icon } from "@heroicons/react/20/solid";
import { useEstimateFullRegistration } from "~~/ensLibrary/hooks/useEstimateRegistration";
import { useValidate } from "~~/ensLibrary/hooks/useValidate";

export const SearchInput = ({
  handleSearch,
  gotoPageRoot,
}: {
  handleSearch: (input: string) => void;
  gotoPageRoot: (pageNumber: number) => void;
}) => {
  const [inputVal, setInputVal] = useState("");
  const { setTheme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const clearInputValue = () => {
    setInputVal("");
  };

  const inputIsAddress = useMemo(() => isAddress(inputVal), [inputVal]);

  const isEmpty = inputVal === "";

  const { isValid, isETH, is2LD, isShort, type, name } = useValidate({
    input: inputVal,
    enabled: !inputIsAddress && !isEmpty,
  });

  type SearchItemType = "text" | "error" | "address" | "name";
  type SearchItem = {
    type: SearchItemType | "nameWithDotEth";
    value?: string;
  };

  const searchItem: SearchItem = useMemo(() => {
    if (isEmpty) {
      return {
        type: "text",
        value: "emptyText",
      };
    }
    if (inputIsAddress) {
      return {
        type: "address",
      };
    }
    if (!isValid) {
      return {
        type: "error",
        value: "Invalid name",
      };
    }
    if (isETH && is2LD && isShort) {
      return {
        type: "error",
        value: "Too short",
      };
    }
    if (type === "label") {
      return {
        type: "nameWithDotEth",
      };
    }
    return {
      type: "name",
    };
  }, [isEmpty, inputIsAddress, isValid, isETH, is2LD, isShort, type]);

  const normalisedOutput = useMemo(() => (inputIsAddress ? inputVal : name), [inputIsAddress, inputVal, name]);

  return (
    <div className="flex flex-col items-center gap-y-2">
      <div
        onClick={() => gotoPageRoot(2)}
        className={` ${
          isDarkMode ? "text-gray-200 hover:text-blue-500" : "text-gray-500  hover:text-blue-500"
        } flex self-end gap-x-1 text-gray-500 hover:text-blue-500 cursor-pointer `}
      >
        <Squares2X2Icon className="h-6" />
        <div>My Names</div>
      </div>

      <div className="flex items-center w-[350px] relative">
        <input
          className="input rounded-xl h-14 focus:outline-0 focus:border-blue-300 w-[350px] mx-auto  focus:text-lg  pl-4 pr-12 border   placeholder:text-lg  transition-all duration-300"
          placeholder="Search for a name"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          readOnly={false}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          data-testid="search-input-box-fake"
        />

        <div
          onClick={() => clearInputValue()}
          className="absolute right-4 hover:scale-95  transition-all duration-200 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
      </div>

      {
        <div
          className={`${
            searchItem.value !== "emptyText" ? "opacity-100" : "opacity-0"
          }  transition-opacity ease-in duration-200`}
        >
          <SearchResult
            value={searchItem.value || normalisedOutput}
            type={searchItem.type}
            clickCallback={handleSearch}
          />
        </div>
      }
    </div>
  );
};
