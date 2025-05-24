import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface MultiStepPaginationProps {
  totalLen: number;
  currPos: number;
  handleNext: () => void;
  handlePrev: () => void;
  handleGoto: (pos: number) => void;
  isFirst: boolean;
  isLast: boolean;
  numOfBtnsShown: number;
}

export default function MultiStepPagination({
  totalLen,
  currPos,
  handleGoto,
  handleNext,
  handlePrev,
  isFirst,
  isLast,
  numOfBtnsShown,
}: MultiStepPaginationProps) {
  const positions: number[] = Array.from({ length: totalLen }).map(
    (_, i) => i + 1
  );

  const calcPositions = useMemo(() => {
    if (currPos === positions.length - 1) {
      return positions.slice(currPos - 1);
    }

    if (currPos >= numOfBtnsShown) {
      let stopPos = numOfBtnsShown + currPos;
      return positions.slice(currPos, stopPos);
    }

    return positions.slice(0, numOfBtnsShown);
  }, [numOfBtnsShown, currPos, positions]);

  return (
    <div className="mt-10 flex items-center justify-between gap-10 flex-wrap">
      <p className="font-medium text-xs text-[#595959]">
        Showing page {currPos + 1} of {totalLen}
      </p>
      <div className="flex items-center gap-[5px]">
        <Button
          type="button"
          className="bg-white text-xs h-[30px] text-[#595959] font-normal border border-[#BFBFBF] p-[10px] rounded-sm hover:bg-white/90"
          onClick={handlePrev}
          disabled={isFirst}
        >
          Previous
        </Button>
        {calcPositions.map((val, idx) => (
          <Button
            key={idx}
            className={`${
              val === currPos + 1
                ? "bg-[#003465] hover:bg-[#003465]/90 text-white"
                : "bg-white hover:bg-white/90 text-[#595959]"
            } border border-[#BFBFBF] p-[10px] rounded-sm text-xs font-normal size-[30px]`}
            onClick={() => handleGoto(val - 1)}
          >
            {val}
          </Button>
        ))}
        <Button
          type="button"
          className="bg-white text-xs h-[30px] text-[#595959] font-normal border border-[#BFBFBF] p-[10px] rounded-sm hover:bg-white/90"
          onClick={handleNext}
          disabled={isLast}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
