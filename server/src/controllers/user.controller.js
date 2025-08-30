export const getRecommendedUsers = async(req, res, next) => {
  try{
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = User.find({
      $and: [
        {id: {$ne: currentUserId}},
        {id: {$nin: currentUser.friends}},
        {isOnboard: true},
      ]
    })
  }
  catch(error){

  }
}

export const getMyFriends = async(req, res, next) => {
  
}