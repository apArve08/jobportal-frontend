const variants = {
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red:    "bg-red-100 text-red-700",
  gray:   "bg-gray-100 text-gray-600",
  purple: "bg-purple-100 text-purple-700",
} as const;

interface BadgeProps {
  label: string;
  variant?: keyof typeof variants;
}

export default function Badge({ label, variant = "gray" }: BadgeProps) {
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${variants[variant]}`}>
      {label}
    </span>
  );
}
