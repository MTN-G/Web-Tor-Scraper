import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css';

function App() {

  const [postsLists, setPostsLists] = useState([])
  const [lastCheck, setLastCheck] = useState(new Date())
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchposts = async () => {
      const { data } = await axios.get('/posts/all', {
        params: {
          search
        }
      })
      setPostsLists(data)
    }
    fetchposts()
  }, [lastCheck, search]);


  postsLists.map((post) => 
    post.Date = post.Date.toString().slice(0, 21).replace('T', ' , ')
  )

  return (
    <div className="App">
      <button onClick={() => setLastCheck(new Date())}>Check for new pastes</button>
      <input onChange={
        (e) => {
          setSearch(e.target.value)
          setLastCheck(new Date())
        }} />
      <div className="PasteList">
        {postsLists.map(post => 
          <div className="Paste">
            <h4 className="PasteTitle">{post.Title}</h4>
            <div className="PasteContent">{post.Content}</div>
            <footer>Posted by <b>{`${post.Author}`}</b> at {`${post.Date}`} </footer>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
