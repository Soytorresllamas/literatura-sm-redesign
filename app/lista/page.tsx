import { redirect } from "next/navigation";
import { FAVORITES_UI_ENABLED } from "../lib/features";
import { WishlistPageContent } from "./wishlist-page-content";

export default function WishlistPage() {
  if (!FAVORITES_UI_ENABLED) redirect("/seccion");
  return <WishlistPageContent />;
}
