import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import API from "../utils/api";
import { setSuggestedUser } from "@/redux/authSlice";

const SuggestedUser = () => {
  const { suggestedUsers = [], user } = useSelector(
    (store) => store.auth
  );
  const dispatch = useDispatch();

  // ⛔ wait until auth is ready
  if (!user || !user._id) return null;

  const followHandler = async (userId) => {
    try {
      const res = await API.post(
        `/api/v1/user/followorunfollow/${userId}`
      );

      if (res.data.success) {
        const updatedUsers = suggestedUsers.map((u) => {
          if (!u || u._id !== userId) return u;

          const followers = Array.isArray(u.followers)
            ? u.followers
            : [];

          const isFollowing = followers.includes(user._id);

          return {
            ...u,
            followers: isFollowing
              ? followers.filter((id) => id !== user._id)
              : [...followers, user._id],
          };
        });

        dispatch(setSuggestedUser(updatedUsers));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update follow status");
    }
  };

  return (
    <div className="my-10">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-600">
          Suggested for you
        </h1>
        <span className="font-medium cursor-pointer">
          See All
        </span>
      </div>

      {suggestedUsers.length === 0 && (
        <p className="text-sm text-gray-500 mt-4">
          No suggestions available
        </p>
      )}

      {suggestedUsers
        .filter((u) => u && u._id)
        .map((suggestedUser) => {
          const followers = Array.isArray(
            suggestedUser.followers
          )
            ? suggestedUser.followers
            : [];

          const isFollowing = followers.includes(user._id);

          return (
            <div
              key={suggestedUser._id}
              className="flex items-center justify-between my-5"
            >
              <div className="flex items-center gap-2">
                <Link to={`/profile/${suggestedUser._id}`}>
                  <Avatar>
                    <AvatarImage
                      src={suggestedUser.profilePicture}
                    />
                    <AvatarFallback>
                      {suggestedUser.username
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div>
                  <h1 className="font-semibold text-sm">
                    <Link
                      to={`/profile/${suggestedUser._id}`}
                    >
                      {suggestedUser.username}
                    </Link>
                  </h1>
                  <span className="text-gray-600 text-sm">
                    {suggestedUser.bio || "Bio here..."}
                  </span>
                </div>
              </div>

              {user._id !== suggestedUser._id && (
                <span
                  onClick={() =>
                    followHandler(suggestedUser._id)
                  }
                  className="text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]"
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </span>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default SuggestedUser;
