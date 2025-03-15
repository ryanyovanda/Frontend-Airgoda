import PropertyList from "@/app/components/lists/PropertyList";
import HeroSlideshow from "@/app/components/heroslideshow";
import SearchBar from "@/app/components/search/SearchBar";
import EmailVerificationNotice from "@/app/components/emailverificationnotice/page";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default async function Home() {
  try {
    // ✅ Fetch categories and locations (server-side)
    const [categoriesRes, locationsRes] = await Promise.all([
      axios.get(`${BACKEND_URL}/categories`),
      axios.get(`${BACKEND_URL}/api/locations`),
    ]);

    const categories = categoriesRes.data || [];
    const locations = locationsRes.data || [];

    return (
      <>
        <EmailVerificationNotice />
        <SearchBar />
        <HeroSlideshow />
        <div className="container mx-auto p-6">
          {/* ✅ Move property fetching & pagination to Client Component */}
          <PropertyList initialCategories={categories} initialLocations={locations} />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <>
        <SearchBar />
        <HeroSlideshow />
        <div className="container mx-auto p-6">
          <PropertyList initialCategories={[]} initialLocations={[]} />
        </div>
      </>
    );
  }
}
