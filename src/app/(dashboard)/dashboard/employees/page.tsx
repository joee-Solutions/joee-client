import SectionHeader from "@/components/shared/SectionHeader";
import Image from "next/image";

const employeeCards = [
  {
    id: 1,
    name: "Denise Hampton",
    role: "Doctor",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/doctorFemale.png",
    rgbColorCode: "0, 52, 101",
  },
  {
    id: 2,
    name: "Susan Denilson",
    role: "Lab Attendant",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/labAttendant.png",
    rgbColorCode: "63, 169, 7",
  },
  {
    id: 3,
    name: "Cole Joshua",
    role: "Doctor",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/doctorMale.png",
    rgbColorCode: "236, 9, 9",
  },
  {
    id: 4,
    name: "Jenifer Gloria",
    role: "Nurse",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/doctorFemale.png",
    rgbColorCode: "225, 195, 0",
  },
];

export default function EmployeePage() {
  return (
    <section>
      <SectionHeader
        title="Employees"
        description="Employees are the foundation for ensuring good health"
      />
      <div className="py-[50px] px-[30px]">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] gap-[19px]">
          {employeeCards.map((empCard) => (
            <div
              key={empCard.id}
              className="rounded-[10px] shadow-[0px_4px_4px_0px_#00000040] bg-white flex flex-col overflow-hidden"
            >
              <div
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(${empCard.rgbColorCode},.8)), url('/assets/sectionHeaderBG.png')`,
                }}
                className={`h-[87.2px] bg-cover bg-no-repeat`}
              ></div>
              <div className="pb-5 flex flex-col items-center">
                <div
                  style={{
                    borderWidth: "3px",
                    borderColor: `rgb(${empCard.rgbColorCode})`,
                  }}
                  className="size-[80px] -mt-10 rounded-full mb-[10px] flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={empCard.picture}
                    width={80}
                    height={80}
                    alt={`${empCard.name} photo`}
                  />
                </div>
                <h3>{empCard.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
