import { useState } from "react";

export default function useMultiStepForm(steps: React.ReactElement[]) {
  const [currStep, setCurrStep] = useState(0);

  const handleNext = () => {
    setCurrStep((prevStep) => {
      if (prevStep >= steps.length - 1) return prevStep;

      return prevStep + 1;
    });
  };

  const handlePrevious = () => {
    setCurrStep((prevStep) => {
      if (prevStep <= 0) return prevStep;

      return prevStep - 1;
    });
  };

  const handleGoto = (val: number) => {
    setCurrStep(val);
  };

  return {
    steps,
    currentPos: currStep,
    isFirstStep: currStep === 0,
    isLastStep: currStep === steps.length - 1,
    totalStep: steps.length,
    handleNext,
    handlePrevious,
    handleGoto,
  };
}
