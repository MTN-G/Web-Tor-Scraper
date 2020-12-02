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
    // const timeout = (ms) => {
    //     return new Promise((resolve) => setTimeout(resolve, ms));
    // };
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log('start scraping')
    await fetchAndSavePosts()
    setInterval(fetchAndSavePosts , 1000*2*60);
})()

app.get('/posts/:label', (req, res) => {
    const { label } = req.params
    if (req.query.search !== '') {
        const regex = new RegExp(req.query.search, "i")
        Post.find(
            {
                $or:
                    [{ Title: regex }, { Content: regex }]
            })
            .then(posts => res.json(filterByLabel(label, posts)))
            .catch(error => console.error(error))        
    } else {
        Post.find({})
        .sort(
            {
                "Date": -1
            })
            .then(posts => res.json(filterByLabel(label, posts)));
    }
});

app.get('/charts/perLabel', (req, res) => {
    const { day } = req.query
    const dayStart = new Date(day)
    const dayEnd = new Date(dayStart.getTime() + 1000 * 60 * 60 * 24)
    let response = {}
    Post.find(day ?
        {
            Date: { $gte: dayStart, $lte: dayEnd }
        } : {}
    ).then(posts => {
        posts.forEach(post => {
            post.Labels.forEach(label => {
                response[label] ? response[label]++ : response[label] = 1
                console.log(response)
            })
        })
        return response
    }).then(response => res.json(response))
});

app.get('/charts/perDay', (req, res) => {
    Post.aggregate([{
        $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
            count: {$sum: 1}
        }
    }]).then(response => {
        sortedRes = response.sort((a, b) => new Date(a._id) - new Date(b._id))
        res.json(sortedRes)
    })
})

app.get('/charts/perAuthor', (req, res) => {
    Post.aggregate([{
        $group: {
            _id: "$Author",
            count: {$sum: 1}
        }
    }]).then(response => res.json(response))
})

app.get('/charts/samePosts', (req, res) => {
    const postsComparer = []
    Post.find({})
        .then(posts => {
            posts.forEach(post => {
                const postString = post.Title + post.Content
                const samePost = postsComparer.find(obj => obj.compare === postString)
                if (samePost) {
                    samePost.count++
                } else {
                    postsComparer.push({
                        post,
                        compare: postString,
                        count: 1
                    });
                };
            });
            const onlyRepeatedPosts = postsComparer.filter(obj => obj.count > 1)
            for (let obj of onlyRepeatedPosts) delete obj.compare
            return onlyRepeatedPosts
        }).then(response => res.json(response))
    
})

       
function savePosts(posts) {
    try {
        if (posts.length > 0) {
            posts.forEach(newPost => {
                newPost.Labels = stickLabels(newPost)
                const post = new Post(newPost)
                post.save()
                .then(console.log('new post in db:', newPost))
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

async function fetchAndSavePosts() {
    for (let i = 1; i < 10; i++) {
        const lastDate = await fetchLastDate()
        const newPosts = await fetchAllPostsFromTor(StrongHoldPaste + `?page=${i}`, lastDate)
        savePosts(newPosts)
        if (newPosts.length === 0) break;
    }
}
function filterByLabel (label, arr) {
    if (label === 'All') {
            return arr
        } else {
            return arr.filter(string => string.Labels.includes(label.toLowerCase()))
    };
};

module.exports = app;