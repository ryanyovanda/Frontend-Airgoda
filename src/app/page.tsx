import { FC } from "react";
import PropertyList from "@/app/components/lists/PropertyList";
import HeroSlideshow from "@/app/components/heroslideshow";

const Home: FC = () => {
  return (
    <>
    <HeroSlideshow />
      <div className="container mx-auto p-6">
        <PropertyList />
      </div>
    </>
  );
};

export default Home;
