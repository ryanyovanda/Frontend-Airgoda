import { Spinner } from "flowbite-react";
import { FC } from "react";

const CustomSpinner: FC = () => {
  return (
    <div className="flex items-center justify-center w-full">
      <Spinner color="warning" aria-label="Loading..." />
    </div>
  );
};

export default CustomSpinner;