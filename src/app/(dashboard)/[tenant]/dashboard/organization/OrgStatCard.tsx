import {
  ActiveOrgChart,
  AllOrgChart,
  DeactivatedOrgChart,
  InactiveOrgChart,
} from "@/components/icons/icon";
import { ChartNoAxesColumn, Hospital } from "lucide-react";

export const cards: {
  cardType: "all" | "active" | "inactive" | "deactivate";
  title: string;
  statNum: number;
  orgIcon: React.ReactNode;
  chart: React.ReactNode;
  barChartIcon: React.ReactNode;
  OrgPercentChanges?: string;
}[] = [
  {
    cardType: "all",
    title: "All Organizations",
    statNum: 490,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <AllOrgChart className="w-full h-full object-fill" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#003465]" />,
  },
  {
    cardType: "active",
    title: "Active Organizations",
    statNum: 250,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <ActiveOrgChart className="w-full h-full object-fit" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#3FA907]" />,
    OrgPercentChanges: "+2.45%",
  },
  {
    cardType: "inactive",
    title: "Inactive Organizations",
    statNum: 100,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <InactiveOrgChart className="w-full h-full object-fit" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#FAD900]" />,
    OrgPercentChanges: "+2.45%",
  },
  {
    cardType: "deactivate",
    title: "Deactivated Organizations",
    statNum: 140,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <DeactivatedOrgChart className="w-full h-full object-fit" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#EC0909]" />,
    OrgPercentChanges: "+2.45%",
  },
];

interface OrgCardStatusProps {
  cardType: "all" | "active" | "inactive" | "deactivate";
  title: string;
  statNum: number;
  orgIcon: React.ReactNode;
  chart: React.ReactNode;
  barChartIcon: React.ReactNode;
  OrgPercentChanges?: string;
}

export default function OrgCardStatus({
  cardType,
  title,
  statNum,
  orgIcon,
  chart,
  barChartIcon,
  OrgPercentChanges,
}: OrgCardStatusProps) {
  const color =
    cardType === "all"
      ? "#003465"
      : cardType === "active"
      ? "#3FA907"
      : cardType === "inactive"
      ? "#FAD900"
      : "#EC0909";

  return (
    <div className="rounded-[10px] shadow-[0px_4px_4px_0px_#00000040] bg-white text-black flex flex-col gap-[25.85px]">
      <div className="pt-[30px] px-4">
        <h3 className="font-normal text-base mb-[11px]">{title}</h3>
        <div className="flex items-center justify-between gap-5">
          <p className="font-normal text-[32px]">{statNum}</p>
          <span
            className={`w-9 h-9 rounded-full flex items-center justify-center bg-[${color}]`}
          >
            {orgIcon}
          </span>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="relative w-[103%] h-[102%] -translate-x-1">
          {chart}
          {OrgPercentChanges && (
            <span
              className={`absolute top-0 left-5 rounded-[58px] py-[7px] px-3 text-xs bg-[${color}] text-white font-bold -tracking-[2%]`}
            >
              {OrgPercentChanges}
            </span>
          )}
          <span
            className={`w-[43px] h-[43px] bg-white text-[${color}] rounded-[7px] absolute right-[17px] bottom-[11px] flex items-center justify-center`}
          >
            {barChartIcon}
          </span>
        </div>
      </div>
    </div>
  );
}

export const ActiveOrgCards: {
  cardType: "all" | "active" | "inactive" | "deactivate";
  title: string;
  statNum: number;
  orgIcon: React.ReactNode;
  chart: React.ReactNode;
  barChartIcon: React.ReactNode;
  OrgPercentChanges?: string;
}[] = [
  {
    cardType: "all",
    title: "All Organizations",
    statNum: 490,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <AllOrgChart className="w-full h-full object-fill" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#003465]" />,
  },
  {
    cardType: "active",
    title: "Active Organizations",
    statNum: 250,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <ActiveOrgChart className="w-full h-full object-fit" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#3FA907]" />,
    OrgPercentChanges: "+2.45%",
  },
];

export const InactiveOrgCards: {
  cardType: "all" | "active" | "inactive" | "deactivate";
  title: string;
  statNum: number;
  orgIcon: React.ReactNode;
  chart: React.ReactNode;
  barChartIcon: React.ReactNode;
  OrgPercentChanges?: string;
}[] = [
  {
    cardType: "all",
    title: "All Organizations",
    statNum: 490,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <AllOrgChart className="w-full h-full object-fill" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#003465]" />,
  },
  {
    cardType: "inactive",
    title: "Inactive Organizations",
    statNum: 100,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <InactiveOrgChart className="w-full h-full object-fit" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#FAD900]" />,
    OrgPercentChanges: "+2.45%",
  },
];

export const deactivatedOrgCards: {
  cardType: "all" | "active" | "inactive" | "deactivate";
  title: string;
  statNum: number;
  orgIcon: React.ReactNode;
  chart: React.ReactNode;
  barChartIcon: React.ReactNode;
  OrgPercentChanges?: string;
}[] = [
  {
    cardType: "all",
    title: "All Organizations",
    statNum: 490,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <AllOrgChart className="w-full h-full object-fill" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#003465]" />,
  },
  {
    cardType: "deactivate",
    title: "Deactivated Organizations",
    statNum: 140,
    orgIcon: <Hospital className="text-white size-5" />,
    chart: <DeactivatedOrgChart className="w-full h-full object-fit" />,
    barChartIcon: <ChartNoAxesColumn className="text-[#EC0909]" />,
    OrgPercentChanges: "+2.45%",
  },
];
