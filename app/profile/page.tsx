import React from "react";
import ProfileEditor from "@/components/profile/ProfileEditor";

export const metadata = {
  title: "Your Profile",
  description: "Manage preferences, dislikes, likes, and personal details",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <ProfileEditor />
    </div>
  );
}

