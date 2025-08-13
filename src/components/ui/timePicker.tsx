import { useEffect, useState } from "react";
import { Button } from "./button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  selected: string;
  onSelect: (val: string) => void;
  className?: string;
}

const hours = Array.from({ length: 12 }).map((_, idx) =>
  `${idx + 1}`.padStart(2, "0")
);
const minutes = Array.from({ length: 60 }).map((_, idx) =>
  `${idx}`.padStart(2, "0")
);

export default function TimePicker({
  selected,
  onSelect,
  className,
}: TimePickerProps) {
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");
  const [format, setFormat] = useState<string>("AM");

  useEffect(() => {
    if (hour && minute) {
      onSelect(`${hour}:${minute} ${format}`);
    }
  }, [hour, minute, format]);

  useEffect(() => {
    if (selected) {
      const time = selected.split(":");
      const min = time.join(" ").split(" ")[0];
      const format = time.join(" ").split(" ")[1];

      setHour(time[0]);
      setMinute(min);
      setFormat(format);
    }
  }, []);

  return (
    <div className={cn("flex h-[200px] py-5", className)}>
      <div className="overflow-y-auto flex flex-col gap-2">
        {hours.map((val) => (
          <Button
            key={val}
            type="button"
            className="w-[80px] h-[30px]"
            onClick={() => setHour(val)}
          >
            <span className="w-full">
              {hour === val && <Check size={16} />}
            </span>
            <span> {`${val}`.padStart(2, "0")}</span>
          </Button>
        ))}
      </div>
      <div className="overflow-y-auto flex flex-col gap-2">
        {minutes.map((val) => (
          <Button
            key={val}
            type="button"
            className="w-[80px] h-[30px]"
            onClick={() => setMinute(val)}
          >
            <span className="w-full">
              {minute === val && <Check size={16} />}
            </span>
            <span> {`${val}`.padStart(2, "0")}</span>
          </Button>
        ))}
      </div>
      <div className="overflow-y-auto flex flex-col gap-3">
        <Button
          type="button"
          className="w-[80px] h-[30px]"
          onClick={() => setFormat("AM")}
        >
          <span className="w-full">
            {format === "AM" && <Check size={16} />}
          </span>
          <span>AM</span>
        </Button>
        <Button
          type="button"
          className="w-[80px] h-[30px]"
          onClick={() => setFormat("PM")}
        >
          <span className="w-full">
            {format === "PM" && <Check size={16} />}
          </span>
          <span>PM</span>
        </Button>
      </div>
    </div>
  );
}
