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
      onClick={loading ? () => {} : action}
      className={`py-2 w-[${btnWidth}] btn btn-primary flex items-centern justify-center text-center text-sm rounded-xl font-body font-medium cursor-pointer`}
    >
      {!loading ? text : <span className="loading loading-spinner loading-sm"></span>}
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
      onClick={loading ? () => {} : action}
      className="py-2 w-[150px] btn btn-secondary flex items-centern justify-center text-center text-sm rounded-xl font-body font-medium cursor-pointer"
    >
      {!loading ? text : <span className="loading loading-spinner loading-sm"></span>}
    </div>
  );
};

export const BackButton = ({
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
      onClick={loading ? () => {} : action}
      className="py-2 w-[100px] btn border-none bg-red-100 text-red-600 hover:bg-red-200 flex items-centern justify-center text-center text-sm rounded-xl font-body font-medium cursor-pointer"
    >
      {!loading ? text : <span className="loading loading-spinner loading-sm"></span>}
    </div>
  );
};

export const OpenModalBtn = ({
  text,
  modalId,
  loading = false,
  action,
}: {
  modalId: string;
  text: string;
  loading?: boolean;
  action: () => void;
}) => {
  return (
    <label
      htmlFor={modalId}
      className="py-2 w-[150px] btn btn-primary flex items-centern justify-center text-center text-sm rounded-xl font-body font-medium cursor-pointer"
      onClick={loading ? () => {} : action}
    >
      {!loading ? text : <span className="loading loading-spinner loading-sm"></span>}
    </label>
  );
};
