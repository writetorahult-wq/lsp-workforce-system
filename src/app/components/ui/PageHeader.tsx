import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router";
import { Breadcrumbs } from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  badge?: {
    text: string;
    color: "blue" | "green" | "red" | "yellow" | "gray";
  };
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  showBackButton = false,
  actions,
  badge,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const badgeColors = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    red: "bg-red-100 text-red-700 border-red-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors group flex-shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            </button>
          )}

          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              {badge && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                    badgeColors[badge.color]
                  }`}
                >
                  {badge.text}
                </span>
              )}
            </div>
            {description && (
              <p className="text-gray-600 mt-2 text-base">{description}</p>
            )}
          </div>

          {/* Home Button */}
          <button
            onClick={() => navigate("/")}
            className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors group flex-shrink-0"
            title="Go to dashboard"
          >
            <Home className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
