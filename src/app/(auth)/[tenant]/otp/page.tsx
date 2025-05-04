'use client'
import { useRef, useState } from "react";


const Page = () => {
    return (
        <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-semibold">Enter OTP</h1>
        <p className="text-gray-500">Enter the 6-digit code sent to your email</p>
        <OTPInput />
        <button className="btn btn-primary">Verify</button>
        </div>
    );
}

// import { useRef, useState } from "react";

const OTPInput = ({ length = 6 }: { length?: number }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/, ""); // Allow only numbers
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.length > 1 ? value[0] : value; // Only 1 digit per field
    setOtp(newOtp);

    // Move to the next input
    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length).split("");
    const newOtp = [...otp];

    pastedData.forEach((char, idx) => {
      if (idx < length) newOtp[idx] = char;
    });

    setOtp(newOtp);

    // Move focus to the last filled input
    const lastFilledIndex = pastedData.length - 1;
    if (inputRefs.current[lastFilledIndex]) {
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // Clear the current field
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to the previous input and clear it
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }

    // Allow arrow key navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex space-x-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          value={digit}
          maxLength={1}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
        />
      ))}
    </div>
  );
};



export default Page;
