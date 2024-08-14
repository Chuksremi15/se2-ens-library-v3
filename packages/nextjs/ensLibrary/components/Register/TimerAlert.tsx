import React, { useEffect, useState } from "react";
import { BackButton, OpenModalBtn, PrimaryButton, SecondaryButton } from "../Button/Button";
import ConfirmTrxDetails from "./ConfirmTrxDetails";
import { RegistrationReducerDataItem } from "./types";
import { useTheme } from "next-themes";
import { CheckIcon } from "@heroicons/react/20/solid";

export const TimerAlert = ({
  prevPage,
  nextPage,
  registrationData,
}: {
  prevPage: () => void;
  nextPage: () => void;
  registrationData: RegistrationReducerDataItem;
}) => {
  const [isRegisterNameModalOpen, setRegisterNameModalOpen] = useState<boolean>(false);
  const [isCommitNameModalOpen, setCommitNameModalOpen] = useState<boolean>(false);

  const [startTimer, setStartTimer] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);

  const openCommitNameModal = () => {
    setCommitNameModalOpen(true);
  };
  const openRegisterNameModal = () => {
    setRegisterNameModalOpen(true);
  };

  const onCommitNameSuccess = () => {
    setStartTimer(true);
    setCommitNameModalOpen(false);
  };
  const onRegisterNameSuccess = () => {
    setRegisterNameModalOpen(false);
    nextPage();
  };

  return (
    <div>
      {isCommitNameModalOpen && (
        <ConfirmTrxDetails
          transactioName={"commitName"}
          registrationData={registrationData}
          onSuccessFn={onCommitNameSuccess}
        />
      )}
      {isRegisterNameModalOpen && (
        <ConfirmTrxDetails
          transactioName={"registerName"}
          registrationData={registrationData}
          onSuccessFn={onRegisterNameSuccess}
        />
      )}

      <div className="flex flex-col gap-y-0 pt-2 pb-4 px-6 bg-base-100 w-full md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
        <div>
          <h5 className="text-xl font-medium text-startself-start"> {registrationData.name}</h5>
          <h5 className="text-2xl font-medium text-center">Almost there</h5>

          <div className="my-5">
            <MovingCircularBorder minutes={1} startTimer={startTimer} timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
          </div>

          <p className="text-xs text-center font-medium">
            You will need to complete two transactions to secure your name. The second transaction must be completed
            within 24 hours of the first.
          </p>
        </div>
        <div className="flex items-center justify-center gap-x-2 ">
          <BackButton action={prevPage} text={"Back"} />
          {timeLeft === 0 ? (
            <OpenModalBtn action={openRegisterNameModal} text={"Finish"} modalId="transaction-modal" />
          ) : (
            <OpenModalBtn
              action={openCommitNameModal}
              text="Start timer"
              modalId="transaction-modal"
              loading={timeLeft < 60}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const MovingCircularBorder = ({
  minutes,
  startTimer = false,
  timeLeft,
  setTimeLeft,
}: {
  minutes: number;
  startTimer: boolean;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { setTheme, resolvedTheme } = useTheme();

  // Convert minutes to seconds

  useEffect(() => {
    if (startTimer) {
      if (timeLeft > 0) {
        const timer = setInterval(() => {
          setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [timeLeft, startTimer]);

  // Calculate the stroke-dashoffset based on the time left
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (timeLeft / (minutes * 60)) * circumference;

  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className=" flex items-center justify-center relative">
      <svg height="120" width="120">
        <circle
          className=""
          cx="60"
          cy="60"
          r={radius}
          stroke={isDarkMode ? "#bdc7ea" : "#dae0ea"}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round" // Added this line for curved edges
        />
        <circle
          className="circle"
          cx="60"
          cy="60"
          r={radius}
          stroke={isDarkMode ? "#212638" : "#93BBFB"}
          strokeWidth="11"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round" // Added this line for curved edges
        />
      </svg>

      {timeLeft === 0 ? (
        <div className="absolute">
          <CheckIcon className={`${isDarkMode ? "text-#212638" : "text-blue-500"}  w-10  text-3xl`} />
        </div>
      ) : (
        <div className="time-left absolute ">{("0" + timeLeft).slice(-2)}</div>
      )}
    </div>
  );
};

export default TimerAlert;
