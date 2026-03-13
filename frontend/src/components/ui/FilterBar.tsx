import { useTranslation } from "react-i18next";

type Props = {
  categories: string[];
  selected: string;
  onChange: (value: string) => void;
};

export default function FilterBar({
  categories,
  selected,
  onChange,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        onClick={() => onChange("all")}
        className={`px-3 py-1 rounded-full text-sm
        ${
          selected === "all"
            ? "bg-yellow-400 text-[#1B3067]"
            : "bg-[#142850] text-white"
        }`}
      >
        {t("all")}
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1 rounded-full text-sm
          ${
            selected === cat
              ? "bg-yellow-400 text-[#1B3067]"
              : "bg-[#142850] text-white"
          }`}
        >
          {t(`cat_${cat.toLowerCase()}`) || cat}
        </button>
      ))}
    </div>
  );
}