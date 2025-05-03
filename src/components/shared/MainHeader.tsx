import { IoSettingsSharp } from "react-icons/io5";
import { SearchIcon } from "lucide-react";
import { BellIcon } from "../icons/icon";
import Image from "next/image";
import profileImage from "./../../../public/assets/profile.png";

const MainHeader = () => {
  return (
    <header className="flex items-center justify-between gap-5 h-[150px] px-[24px] py-12 shadow-[0px_4px_25px_0px_#0000001A]">
      <div className="relative flex items-center justify-center px-2 py-[10px] rounded-[60px] bg-white shadow-[4px_4px_4px_0px_#B7B5B566] basis-[50%]">
        <input
          type="search"
          placeholder="search..."
          className="px-5 h-[60px] rounded-[30px] pl-5 pr-12 bg-[#E4E8F2] outline-none focus:outline-1 focus:outline-slate-400 w-full"
        />
        <SearchIcon className="absolute right-10" />
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center bg-white w-[60px] h-[60px] rounded-[10px] shadow-[0px_4px_25px_0px_#0000001A]">
          <BellIcon className="cursor-pointer" />
        </span>
        <span className="flex items-center justify-center bg-white w-[60px] h-[60px] rounded-[10px] shadow-[0px_4px_25px_0px_#0000001A]">
          <IoSettingsSharp className="w-[32.82px] h-[34.84px] text-[#EC0909] cursor-pointer" />
        </span>
        <div className="flex items-center gap-[10.32px] cursor-pointer">
          <span className="block w-[64px] h-[64px] rounded-full overflow-hidden">
            <Image
              src={profileImage}
              alt="profile image"
              className="aspect-square w-full h-full object-cover"
            />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#003465] mb-1">
              Daniel James
            </p>
            <p className="text-xs font-medium text-[#595959]">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
