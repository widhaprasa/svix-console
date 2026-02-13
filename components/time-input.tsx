"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";

interface TimeInputProps {
  value?: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  className?: string;
}

interface TimeParts {
  hours: number;
  minutes: number;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const [time, setTime] = React.useState<TimeParts>(() => {
    const d = value ? new Date(value) : new Date();
    return {
      hours: d.getHours(),
      minutes: d.getMinutes(),
    };
  });

  const hoursRef = React.useRef<HTMLInputElement | null>(null);
  const minutesRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      setTime({
        hours: d.getHours(),
        minutes: d.getMinutes(),
      });
    }
  }, [value]);

  const updateTime = (newTime: TimeParts) => {
    if (disabled) return;

    const currentDate = value ? new Date(value) : new Date();
    currentDate.setHours(newTime.hours);
    currentDate.setMinutes(newTime.minutes);
    currentDate.setSeconds(0);

    onChange(currentDate);
    setTime(newTime);
  };

  const handleInputChange =
    (field: keyof TimeParts) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const value = e.target.value.replace(/\D/g, "");
      if (!value) return;

      const numValue = Number.parseInt(value, 10);

      let newValue: number | string = numValue;
      if (field === "hours") {
        if (numValue < 0) newValue = 0;
        else if (numValue > 23) newValue = 23;
      } else if (field === "minutes") {
        if (numValue < 0) newValue = 0;
        else if (numValue > 59) newValue = 59;
      }

      updateTime({ ...time, [field]: newValue });
    };

  const incrementHours = () => {
    if (disabled) return;
    const newHours = (time.hours + 1) % 24;
    updateTime({ ...time, hours: newHours });
  };

  const decrementHours = () => {
    if (disabled) return;
    const newHours = (time.hours - 1 + 24) % 24;
    updateTime({ ...time, hours: newHours });
  };

  const incrementMinutes = () => {
    if (disabled) return;
    const newMinutes = (time.minutes + 1) % 60;
    updateTime({ ...time, minutes: newMinutes });
  };

  const decrementMinutes = () => {
    if (disabled) return;
    const newMinutes = (time.minutes - 1 + 60) % 60;
    updateTime({ ...time, minutes: newMinutes });
  };

  const formatTimeValue = (value: number): string => {
    return value.toString().padStart(2, "0");
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-1 rounded-md border p-1",
        className,
      )}
    >
      <div className="flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={incrementHours}
          disabled={disabled}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Input
          ref={hoursRef}
          type="text"
          inputMode="numeric"
          value={formatTimeValue(time.hours)}
          onChange={handleInputChange("hours")}
          className="w-8 border-0 text-center focus:outline-none focus:ring-0 p-0 disabled:opacity-50"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={decrementHours}
          disabled={disabled}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
      <span className="text-sm font-medium">:</span>
      <div className="flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={incrementMinutes}
          disabled={disabled}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Input
          ref={minutesRef}
          type="text"
          inputMode="numeric"
          value={formatTimeValue(time.minutes)}
          onChange={handleInputChange("minutes")}
          className="w-8 border-0 text-center focus:outline-none focus:ring-0 p-0 disabled:opacity-50"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={decrementMinutes}
          disabled={disabled}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

TimeInput.displayName = "TimeInput";