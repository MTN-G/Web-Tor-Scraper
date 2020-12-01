require('dotenv').config();
const express = require('express');
const Post = require('./mongo/models');
const fetchAllPostsFromTor = require('./scraper');
const connectDb = require('./mongo/connection')
const dictonary = require('./dictonary')
const app = express();

app.use(express.json());
// app.use(express.static('build'));

const StrongHoldPaste = 'http://nzxj65x32vh2fkhk.onion/all'

connectDb()
    .then(() => {
        console.log('connected to MongoDB');
      })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message);
      });

// // Check for new posts every 2 minutes
let scraper;
(scraper = async () => {
    for (let i = 1; i < 4; i++) {
        const lastDate = await fetchLastDate()
        const newPosts = await fetchAllPostsFromTor(StrongHoldPaste + `?page=${i}`, lastDate)
        savePosts(newPosts) 
    }
    setInterval(async () => {
        for (let i = 1; i < 4; i++) {
            const lastDate = await fetchLastDate()
            const newPosts = await fetchAllPostsFromTor(StrongHoldPaste + `?page=${i}`, lastDate)
            savePosts(newPosts)
        }}, 1000*2*60);
})()

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
                .then(posts => res.json(posts));
            }
});
        
function savePosts(posts) {
    try {
        if (posts.length > 0) {
            posts.forEach(newPost => {
                newPost.Labels = stickLabels(newPost)
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

async function fetchLastDate() {
    let lastDate
    await Post.findOne()
    .sort(
        {
            "Date": -1
        }
        ).then(async lastPost => {
            lastDate = lastPost.Date
        }).catch(() => {
            lastDate = 0
        });
        return lastDate
}
    
function stickLabels(obj) {
                const labels = []
                const objString = Object.values(obj).join().toLowerCase()
                dictonary.forEach(labelarr => {
                        if (labelarr.some(exp => objString.includes(exp))) {
                                labels.push(labelarr[0])
                            }
                })
                console.log('labels:' ,labels)
                return labels
};  
                      
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
                                
                                // Fetch all new posts since the last server's activity
                                // Post.findOne()
                                // .sort(
                                    //     {
                                        //         "Date": -1
                                        //     }
                                        //     ).then(async lastPost => {
                            //         const lastPostDate = lastPost.Date
                            //         const newPosts = await fetchAllPostsFromTor(StrongHoldPaste, lastPostDate)
                            //         savePosts(newPosts)
                            //     });