"use client";

import type { NextPage } from "next";
import EnsSe2 from "~~/ensLibrary/Home/Index";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-4">
        <h1 className="font-head  text-blue-500  font-semibold container text-center text-4xl pb-8">
          Component test page
        </h1>
        <EnsSe2 />
      </div>
    </>
  );
};

export default Home;
