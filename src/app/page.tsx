import { FC } from "react";
import Navbar from "@/app/components/navbar";
import PropertyList from "./components/lists/PropertyList";

const Home: FC = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Available Properties</h1>
        <PropertyList />
      </div>
    </>
  );
};

export default Home;
