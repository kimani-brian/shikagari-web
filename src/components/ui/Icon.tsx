import { cn } from "@/lib/utils";

type IconName =
  | "search"
  | "location_on"
  | "directions_car"
  | "local_shipping"
  | "two_wheeler"
  | "airport_shuttle"
  | "star"
  | "favorite"
  | "schedule"
  | "shield"
  | "bolt"
  | "group"
  | "trending_up"
  | "map_pin"
  | "chevron_right"
  | "chevron_left"
  | "chevron_down"
  | "arrow_forward"
  | "arrow_back"
  | "menu"
  | "close"
  | "person"
  | "dashboard"
  | "logout"
  | "add_circle"
  | "chat_bubble"
  | "settings"
  | "speed"
  | "local_gas_station"
  | "palette"
  | "calendar_today"
  | "visibility"
  | "share"
  | "phone"
  | "mail"
  | "lock"
  | "info"
  | "warning"
  | "check_circle"
  | "error"
  | "tune"
  | "grid_view"
  | "view_list"
  | "filter_list"
  | "expand_more"
  | "expand_less"
  | "payments"
  | "handshake"
  | "storefront"
  | "store"
  | "swap_horiz";

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  filled?: boolean;
}

export default function Icon({ name, className, size = 20, filled = false }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontSize: size,
        width: size,
        height: size,
        lineHeight: `${size}px`,
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 300, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
