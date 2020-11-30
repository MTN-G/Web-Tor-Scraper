require('dotenv').config();
const express = require('express');
const Post = require('./models');
const fetchAllPostsFromTor = require('./scraper');
const app = express();

app.use(express.json());
// app.use(express.static('build'));

const local = 'file:///C:/Users/mgk27/OneDrive/%D7%A9%D7%95%D7%9C%D7%97%D7%9F%20%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94/projects/pastor/index.html'
const StrongHoldPaste = 'http://nzxj65x32vh2fkhk.onion/all'


// Fetch all new posts since the last server's activity
Post.findOne()
.sort(
    {
        "Date": -1
    }
    ).then(async lastPost => {
        const lastPostDate = lastPost.Date
        const newPosts = await fetchAllPostsFromTor(StrongHoldPaste, lastPostDate)
        savePosts(newPosts)
    });
    
    
    // // Check for new posts every 2 minutes
    setInterval(async () => {
        const newPosts = await fetchAllPostsFromTor(StrongHoldPaste, new Date(new Date() - 1000*60*2))
        savePosts(newPosts) 
}, 1000*60*2);


app.get('/posts/all', (req, res) => {
    if (req.query.search !== '') {
        const regex = new RegExp(req.query.search, "i")
        Post.find(
            {
                $or:
                [{ Title : regex }, { Content: regex }]
            }).then(posts => res.json(posts))
    } else {
        Post.find({})
        .sort(
            {
                "Date": -1
            })
            .then((posts) => {
                res.json(posts);
            });
        }
    });
    
    // Post.find({}).then(docs => docs.forEach(doc => doc.update({Labels: stickLabels(doc)})))
    function savePosts(posts) {
        try {
            if (posts.length > 0) {
                posts.forEach(newPost => {
                    const post = new Post(newPost)
                    post.save()
                    .then(console.log('new post in db'))
                    .catch(error => console.log(error.message))
                })  
            } else console.log('no new posts')
    } catch (error) {
        console.log(error.message)
    }
};

// const pornArr = ['sex', 'video', 'porn']
// const weaponArr = ['weapon', 'gun', 'bomb']
// const allll = [pornArr, weaponArr]

// function stickLabels(obj) {
//     const labels = []
//     allll.forEach(labelarr => {
//         const objString = Object.values(obj).join().toLowerCase()
//         if (labelarr.some(exp => objString.includes(exp))) {
//             labels.push(labelarr[0])
//         }
//     })
//     return labels
// };

module.exports = app;

// app.post('/posts/init', async (req, res) => {
    //     try {
//         const posts = await fetchAllPostsFromTor(realShit, new Date(Date.now - 2*60))
//         savePosts(posts)
//         res.send(posts)
//     } catch (error) {
    //         res.status(402).send(error.message)
    //     }
    
    // })