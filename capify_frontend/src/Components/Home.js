import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import Img from './508-icon.png'
import './Home.css'
import Login from './Login/Login';


function Home() {
    const [image,setImage] = useState(null)
    const [caption, setCaption] = useState('')
    const [error, setError] = useState('')
    const [previewURL, setPreviewURL] = useState(null)
    const captionRef = useRef(null)
    const [trailCount, setTrailCount] = useState(0);
    const [showLogin, setShowLogin] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loginMessage, setLoginMessage] = useState('')
    

    useEffect(()=>{
      const loggedIn = localStorage.getItem('isLoggedIn')
      setIsLoggedIn(loggedIn==='true');


      if (!loggedIn){
        const count = parseInt(localStorage.getItem('free_trail') || '0')
        setTrailCount(count);
      }
      
    },[]);

    const handleImageChange = (e) =>{
        const file = (e.target.files[0]);
        if (file) {
          setImage(file)
          setPreviewURL(URL.createObjectURL(file))
        }
    };

    const handleSubmit = () =>{
        if(!image){
            setError('please select an image');
            return;
        }


    const attempts = parseInt(localStorage.getItem('free_trail') || '0')

    if (!isLoggedIn) {
      if (attempts >=2){
        sessionStorage.setItem('trailMessage', 'free trail limit reached, please login to continue');
        setShowLogin(true)
        return;
    }
    }
    
    if (!isLoggedIn && trailCount >= 2){
      setShowLogin(true);
      return;
    }

    


    const formData = new FormData();
    formData.append('image',image)
    setLoading(true)

    axios
    .post('http://127.0.0.1:8000/api/caption/',formData, {withCredentials : true})
    .then((response) => {
        setCaption(response.data.caption);
        setError('');
        const newCount = attempts +1;
        localStorage.setItem('free_trail', newCount)
        setTrailCount(newCount)
        captionRef.current?.scrollIntoView({behavior : 'smooth'})
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Upload failed.');
      })
      .finally(()=>{
        setLoading(false)
      })
    }

    const handleLoginSuccess = (message='Login successful!')=>{
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn','true')
      localStorage.setItem('free_trail','0')
      setShowLogin(false)
      setLoginMessage(message)

      setTimeout(()=>{
        setLoginMessage('')
      }, 3000)
    }



  return (
    <>
    {loginMessage && (
      <div className="login-success">
        {loginMessage}
      </div>
    )}


    {showLogin && 

          <Login onLoginSuccess={handleLoginSuccess} onClose={()=>setShowLogin(false)}/>
  


    }
    
     <nav class="navbar">
      <h2 class="logo">Capify</h2>
      <ul class="nav-links">
        <li><button id='login-btn' onClick={()=> setShowLogin(true)}>Login</button></li>
      </ul>
    </nav>
    <div className='head'>
      <h3 id='headline'>Generate The Caption</h3>
    </div>
    
    <div className='hero'>
        <label for="input-file" id='img-container'>
            <input type="file" accept='image/*' id='input-file' hidden onChange={handleImageChange}/>
            <div id='img-view'>

              {previewURL ? 
              (
                <>
                  <img src={previewURL} alt="preview" />
                </>
              ):
              (
                <>
                <img src={Img} alt="" className='upload-icon'/>
                <p>Upload Image <br />to generate caption</p>
                </>
              )}           
            </div>
            
        </label>
        {previewURL && (
          loading ? (
            <div className='spinner'></div>
          ):(
          <button onClick={handleSubmit} id='submitBtn'>{isLoggedIn ? 'Submit' : `(${trailCount}/2 used)`}</button>
          )
        )}
        <div className='caption-section'>
              {caption && <p>{caption}</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        
        
    </div>
  </>
  )
}

export default Home