import React, { useEffect, useState } from "react";
import { OpenModalBtn, PrimaryButton, SecondaryButton } from "../Button/Button";
import ConfirmTrxDetails from "./ConfirmTrxDetails";

export const TimerAlert = ({
  searchItem,
  prevPage,
  nextPage,
}: {
  searchItem: string;
  prevPage: () => void;
  nextPage: () => void;
}) => {
  if (!searchItem) {
    prevPage();
  }

  const [time, setTime] = useState<number>(60);
  const [startTimer, setStartTimer] = useState<boolean>(false);

  useEffect(() => {
    if (startTimer) {
      if (time > 0) {
        const timer = setTimeout(() => {
          setTime(time - 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [time, startTimer]);

  return (
    <div>
      <div className="flex flex-col gap-y-0 pt-2 pb-4 px-6 bg-base-100 w-full md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
        <div>
          <h5 className="text-xl font-medium text-startself-start"> {searchItem}</h5>
          <h5 className="text-2xl font-medium text-center">Almost there</h5>

          <div>
            <ConfirmTrxDetails searchItem={searchItem} action="Start timer" info="Start timer to register name" />
          </div>

          <div className="my-5">
            <div className="w-28 h-28 border-[10px] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              {time}
            </div>
          </div>

          <p className="text-xs text-center font-medium">
            You will need to complete two transactions to secure your name. The second transaction must be completed
            within 24 hours of the first.
          </p>
        </div>
        <div className="flex items-center justify-center gap-x-2 ">
          <SecondaryButton text="Back" action={prevPage} />
          <OpenModalBtn text="Start timer" modalId="transaction-modal" />
        </div>
      </div>
    </div>
  );
};

export default TimerAlert;
