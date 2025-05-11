interface SectionHeaderProps {
  title: string;
  description?: string;
}

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="h-[200px] bg-[linear-gradient(to_right,rgba(0,52,101,.8)),url('/assets/sectionHeaderBG.png')] bg-center bg-no-repeat flex flex-col justify-center items-center">
      <h2 className="font-medium text-[32px] text-white">{title}</h2>
      <p className="font-normal text-sm text-white">{description}</p>
    </div>
  );
}
