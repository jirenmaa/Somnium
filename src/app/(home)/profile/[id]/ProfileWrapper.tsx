"use client";

import { useState, useEffect } from "react";

import { UserX } from "lucide-react";
import { CloudAlertIcon } from "lucide-react";

import { getUser } from "@/actions/users";

import Header from "@/components/Header";
import InfiniteVideos from "@/components/Videos/Infinite";
import EmptyVideo from "@/components/EmptyVideo";

const ProfileWrapper = ({
  userId,
  query,
  filter,
}: {
  userId: string;
  query?: string;
  filter?: string;
}) => {
  const [user, setUser] = useState<UserProfile>();
  const [error, setError] = useState<ActionResultError>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const getUserData = async () => {
      await getUser(userId).then((result) => {
        setUser(result?.data as UserProfile);
        setError(result?.error as ActionResultError);
        setLoading(false);
      });
    };

    getUserData();
  }, [userId]);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!loading && error?.type === "server") {
    return (
      <EmptyVideo
        path="home"
        title="Something went wrong on our side"
        icon={<CloudAlertIcon />}
      />
    );
  }

  if (!loading && error?.type === "notFound") {
    return (
      <EmptyVideo
        path="home"
        title={(user as ActionResultType).error?.message}
        icon={<UserX />}
      />
    );
  }

  return (
    <>
      <Header
        userImg={user?.image}
        title={user?.displayUsername || user?.name || "-"}
        subHeader={"@" + (user?.displayUsername || user?.name || "-")}
      />
      <InfiniteVideos userId={userId} query={query} filter={filter} />
    </>
  );
};

export default ProfileWrapper;
