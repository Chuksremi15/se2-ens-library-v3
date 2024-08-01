import React from "react";

export const PrimaryButton = ({
  text,
  loading = false,
  action,
  btnWidth = "150px",
}: {
  text: string;
  loading?: boolean;
  action?: () => void;
  btnWidth?: string;
}) => {
  return (
    <div
      onClick={action}
      className={`py-2 w-[${btnWidth}] btn btn-primary flex items-centern justify-center text-center text-sm rounded-xl font-body font-medium cursor-pointer`}
    >
      {text}
    </div>
  );
};
export const SecondaryButton = ({
  text,
  loading = false,
  action,
}: {
  text: string;
  loading?: boolean;
  action?: () => void;
}) => {
  return (
    <div
      onClick={action}
      className="py-2 w-[150px] btn btn-secondary flex items-centern justify-center text-center text-sm rounded-xl font-body font-medium cursor-pointer"
    >
      {text}
    </div>
  );
};

export const OpenModalBtn = ({ text, modalId }: { modalId: string; text: string }) => {
  return (
    <label
      htmlFor={modalId}
      className="py-2 w-[150px] btn btn-primary flex items-centern justify-center text-center text-sm rounded-xl font-body font-medium cursor-pointer"
    >
      {text}
    </label>
  );
};
