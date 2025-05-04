import { redirect } from "next/navigation";
import ResetPasswordOtpClient from "../ResetPasswordOtpClient";

const ResetPasswordOtp = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const token = (await params).slug;
  if (!token || token.length < 10) {
    redirect("/forgot-password");
  }
  return <ResetPasswordOtpClient token={token} />;
};

export default ResetPasswordOtp;
