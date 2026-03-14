import { useTranslation } from "react-i18next";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search questions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-[#142850] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
    </div>
  );
}