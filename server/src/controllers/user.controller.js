import { ErrorHandler } from "../middleware/error.middleware.js";
import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
export const getRecommendedUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends || [] } },
        { isOnboarded: true },
      ]
    }).select("-password");
    res.status(200).json({
      success: true,
      data: {
        recommendedUsers,
      }
    })
  }
  catch (error) {
    console.error("Error in getRecommended controller " + error);
    return next(new ErrorHandler('Internal Server Error', 500));
  }
}

export const getMyFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("friends").populate("friends", "fullName, profilePic nativeLanguage learningLanguage");
    res.status(200).json({
      status: "success",
      data: {
        friends: user.friends,
      }
    })
  } catch (error) {
    console.error("Error in getMyFriends controller " + error);
    return next(new ErrorHandler('Internal Server Error', 500));
  }
}

export async function sendFriendRequest(req, res, next) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return next(new ErrorHandler("You can't send friend request to yourself", 400));
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return next(new ErrorHandler("Recipient not found", 404));
    }

    if (recipient.friends.includes(myId)) {
      return next(new ErrorHandler("You are already friends with this user", 400));
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return next(new ErrorHandler("A friend request already exists between you and this user", 400));
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json({
      status: "success",
      data: friendRequest,
    });
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}