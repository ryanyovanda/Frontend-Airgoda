import React from "react";

interface ProfileDetailsProps {
  user: {
    name?: string;
    email?: string;
  };
}

const ProfileDetailsSection: React.FC<ProfileDetailsProps> = ({ user }) => {
  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">User Details</h2>

      <div className="mb-4">
        <label className="text-gray-600 block">Name</label>
        <p className="text-lg font-semibold">{user?.name || "N/A"}</p>
      </div>

      <div className="mb-4">
        <label className="text-gray-600 block">Email</label>
        <p className="text-lg">{user?.email || "N/A"}</p>
      </div>
    </div>
  );
};

export default ProfileDetailsSection;