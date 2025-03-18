import PropertyList from "@/app/components/PropertyList";
import HeroSlideshow from "@/app/components/HeroSlideShow";
import SearchBar from "@/app/components/SearchBar";
import EmailVerificationNotice from "@/app/components/EmailVerificationNotice";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default async function Home() {
  try {
  
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
