const Post = require("../models/Post");
const User = require("../models/User");
const { post } = require("../routes");

//POST METHOD
async function createpost(req, res) {
    const userId = req.user._id;
    const userName = req.user.name;
    const { text } = req.body;
    const newpost = new Post({
        text,
        userId,
        userName
    });

    const response = await newpost
        .save()
        .then((post) => {
            console.log("New post Saved");
        })
        .catch((err) => console.log(err));

    return response;
    
}

// GET CONTACTS FROM ID
async function getpostsByUser(req) {
    const userID = req.user._id;

    const data = await Post.find({ userId: userID }).catch((err) => console.error(err));
    return data;
}

// GET METHOD
async function getpostsbySearch(req) {
    const { searchtext } = req.body;
    const regex = new RegExp(searchtext,"i");
    const posts = await Post.find({text: {$regex : regex}});

    console.log(posts);
    return posts;
}

// Delete Method
async function deletepost(req, res) {
    Post.findByIdAndRemove(req.params.id)
        .then((data) => console.log(data))
        .catch((err) => console.error(err));
    res.redirect("/profile");
}

// get posts
async function getpost(req) {
    const postId = req.params.id;
    const data = await Post.findById(postId).catch((err) =>
        console.error(err)
    );
    return data;
}

// Get all posts
async function getAllPosts(req,res) {
    console.log("get all posts function here" );

    const allposts = await Post.find().catch((err) =>console.error(err));
    const friends = req.user.friends;
    var array = [];
    var names= []
    for(var i=0;i<allposts.length;i++)
    {
        if(allposts)
        {
            console.log("all posts" );
            if(friends!="")
            {

                for(var j=0;j<friends.length;j++)
                {                
                    if(allposts[i].userId.equals(friends[j]))
                    {
                        array.push(allposts[i]);
                        const data = await User.findById({ _id: friends[j]}).catch((err) => console.error(err));
                        names.push(data.name)
                    }
                    if(allposts[i].userId.equals(req.user._id))
                    {
                        array.push(allposts[i]);
                        names.push(req.user.name)

                        break;
                    }
                }
            }
            else
            {
                const userID = req.user._id;
                const data = await Post.find({ userId: userID }).catch((err) => console.error(err));
                names.push(req.user.name)
               // res.render("dashboard", {name: req.user.name , data:array , names: names})

            }
            
        }
        else
            break;
    }
    res.render("dashboard", {name: req.user.name , data:array , names: names})
    //return array , names;
}

// Get names for all posts
async function getNamesforAllPosts(req) {
    const allposts = await Post.find().catch((err) =>console.error(err));
    const friends = req.user.friends;
    const friendaccount = []
    for(var i=0;i<friends.length;i++)
    {
        const data = await User.findById({ _id: friends[i]}).catch((err) => console.error(err));
        friendaccount.push(data.name)
    }
    var names = [];
    
    return names;
}

                            //////////////////////////////////// Users ///////////////////////////////////////////////
// GET ALL USERS
async function getusers(req) {
    const data = await User.find().catch((err) => console.error(err));
    const userID = req.user._id;
    var i =0;

    data.forEach(function(obj)
    {

        if (obj.id == userID)
        {
            index = i;
            data.splice(index, 1);
        }
        i++;
    })

    return data;
}

// Get All Friends
async function getfriends(req) {
    const friends = req.user.friends;
    var arrayfriends = [];
    
    for(let i=0;i<friends.length;i++)
    {
        const frienddata = await User.findById(friends[i]).catch((err) => console.error(err));
        arrayfriends.push(frienddata);
    }
    
    // friends.forEach(async function(item){
    //     const frienddata = await User.findById(item).catch((err) => console.error(err));
    //     arrayfriends.push(frienddata);
    // })
    
    return arrayfriends;    
}

// Add friend
async function addfriend(req,res) {
    const user = req.user

    const friendId = req.params.id;

    const Newfriend = await User.findById(friendId).catch((err) => console.error(err));

    const friends = user.friends;
    var m = 0;
    if (friends.length === 0)
    { 
        friends.push(Newfriend._id);
        const updated = User.findByIdAndUpdate(user._id,{friends},{useFindAndModify: false}).then(data => console.log(data)).catch(err=> console.error(err));
        return updated;
    }
    else
    {
        for(let i=0;i<friends.length;i++)
        {
            if(Newfriend._id.equals(friends[i]))
            {   
                m = 1;
                return user;
            }
        }
        if (m == 0)
        {
            friends.push(Newfriend._id);
            User.findByIdAndUpdate(user._id,{friends}, {useFindAndModify: false}).catch(err=> console.error(err));
            return user;
        }
    
    };
}

// delete friend
async function deletefriend(req, res) {
    const friendId = req.params.id;

    var friends = req.user.friends;

    var i =0;
    for(i=0;i<friends.length;i++)
    {
        if(friendId==friends[i])
        {   
            index = i;
            friends.splice(index, 1);
        }
    }
    

    User.findByIdAndUpdate(req.user._id,{friends}, {useFindAndModify: false}).catch(err=> console.error(err));
    res.redirect("/friends");
}

















module.exports = {
    deletefriend,
    createpost,
    getNamesforAllPosts,
    getpost,
    getAllPosts,
    deletepost,
    getpostsByUser,
    getpost,
    getpostsbySearch,
    getusers,
    addfriend,
    getfriends
};
