import { ChangeEventHandler, Dispatch, InputHTMLAttributes, SetStateAction, useCallback, useState } from "react";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/20/solid";
import { createChangeEvent } from "~~/ensLibrary/utils/syntheticEvent";

// import { createChangeEvent } from "~~/utils/ens-utils/synthenticEvent";

type InputProps = InputHTMLAttributes<HTMLInputElement>;
type Props = {
  highlighted?: boolean;
  value?: number;
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
  unit?: string;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
} & Omit<InputProps, "value" | "defaultValue" | "min" | "max">;

export const PlusMinusControl = ({
  value,
  defaultValue,
  name = "plus-minus-control",
  minValue = 1,
  maxValue = Number.MAX_SAFE_INTEGER - 1,
  onChange,
}: Props) => {
  const isValidValue = useCallback(
    (val: number) => {
      if (Number.isNaN(val)) return false;
      if (val < minValue) return false;
      if (val > maxValue) return false;
      return true;
    },
    [minValue, maxValue],
  );

  const getDefaultValue = useCallback(() => {
    return value || defaultValue || minValue;
  }, [value, defaultValue, minValue]);

  const [inputValue, setInputValue] = useState<string>(getDefaultValue().toFixed(0));

  const normalizeValue = useCallback(
    (val: number) => {
      if (Number.isNaN(val)) return getDefaultValue();
      if (val < minValue) return minValue;
      if (val > maxValue) return maxValue;
      return val;
    },
    [minValue, maxValue, getDefaultValue],
  );

  const incrementHandler = (inc: number) => () => {
    const newValue = (value || 0) + inc;
    const normalizedValue = normalizeValue(newValue);
    if (normalizedValue === value) return;
    setInputValue(normalizedValue.toFixed(0));
    const newEvent = createChangeEvent(normalizedValue, name);
    onChange?.(newEvent);
  };

  return (
    <div className="flex items-center justify-between border w-full py-2 px-3 rounded-full ">
      <MinusCircleIcon onClick={incrementHandler(-1)} className="text-blue-500 w-14 cursor-pointer" />
      <div className="w-full py-0 px-[5px] flex text-[28px] items-center justify-center">
        <input
          type="text"
          className="bg-transparent text-blue-500 font-semibold font-body text-2xl border-none w-full outline-none text-center rounded-full transition-all duration-150"
          value={inputValue + ` years`}
          disabled
        />
      </div>
      <PlusCircleIcon onClick={incrementHandler(1)} className="text-blue-500 w-14 cursor-pointer" />
    </div>
  );
};
