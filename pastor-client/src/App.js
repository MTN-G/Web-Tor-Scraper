import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css';

function App() {

  const [postsLists, setPostsLists] = useState([])
  const [lastCheck, setLastCheck] = useState(new Date())
  const [label, setLabel] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchposts = async () => {
      const { data } = await axios.get(`/posts/${label}`, {
        params: {
          search
        }
      })
      setPostsLists(data)
    }
    fetchposts()
  }, [lastCheck, search, label]);


  postsLists.map((post) =>
    post.Date = post.Date.toString().slice(0, 21).replace('T', ' , ')
  );

  const LABELS = ['All', 'Pornography', 'Weapon', 'Social', 'Money'];

  return (
    <div className="App">
      <button onClick={() => setLastCheck(new Date())}>Check for new pastes</button>
      <input onChange={
        (e) => {
          setSearch(e.target.value);
          setLastCheck(new Date());
        }} />
      <select onChange={(e) => setLabel(e.target.value)}>
        {LABELS.map(label => <option >{label}</option>)}
      </select>
      <div className="PasteList">
        {postsLists.map(post => 
          <div className="Paste">
            <div className="firstLine">
              <h4 className="PasteTitle">{post.Title}</h4>
              <div className="labels">
                {post.Labels.map(label => <button>{label}</button>)}
              </div>
            </div>
            <div className="PasteContent">{post.Content}</div>
            <footer>Posted by <b>{`${post.Author}`}</b> at {`${post.Date}`} </footer>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
