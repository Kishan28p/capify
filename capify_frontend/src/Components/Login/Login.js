import React, { useState } from 'react'
import './Login.css'

function Login({onClose , onLoginSuccess}) {

    const [formData,setFormData] = useState({});
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');




    const handleInput =(e)=>{
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]:value,
        })


    }
    const handleSubmit = async(e)=> {
        e.preventDefault();
        setError('');
        if (isRegistering && formData.password !== formData.password_confirm) {
            setError('passwords do not match')
            return;
        }
        console.log(formData)
        const url = isRegistering 
        ? 'http://127.0.0.1:8000/register/' 
        : 'http://127.0.0.1:8000/login/';
        try {
            const response = await
            fetch(url,{
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
            },
            body : JSON.stringify(formData)
                

                }
            );
            if (response.ok){
                const message = isRegistering ? 'Registered successfully!' : 'Login successful!'
                onLoginSuccess(message)
            }else {
                setError('invalid username or password')
            }
        } catch (error){
            console.log('Error',error)
        }
    }


    
  return (
    <>
    <div className='modal-overlay'>
        <div className='modal-box'>
            <button onClick={onClose} className='close-btn'>x</button>
            <div className="login-header">
                <h4 className="login-heading">{isRegistering ? 'Register' : 'Login'}</h4>
            </div>
            <form className='modal-form' onSubmit={handleSubmit}>

                <label htmlFor="">Username</label>
                <input  type="text" name='username' value={formData.username || ''}  onChange={handleInput} required/>

                {isRegistering && (
                <>
                <label htmlFor="email"> Email</label>
                <input type="email" value={formData.email || ''} name='email' onChange={handleInput} />

                
                </> )}
                <label htmlFor="">Password</label>
                <input  type="password" name='password' value={formData.password || ''}  onChange={handleInput}required/>
                {!isRegistering && error && <p style={{ color: 'red', marginTop: '5px' }}>{error}</p>}
                {isRegistering && (
                <>
                <label htmlFor="password">Confirm Password</label>
                <input type="password" value={formData.password_confirm || ''} name='password_confirm' onChange={handleInput} required/>


                {error && <p style={{color :'red'}}>{error}</p>}

                
                </> )}

                <button>{isRegistering ? 'Register' : 'Login'}</button>
            </form>
            <div className="register-wrapper">
            <p className="register-link">
                {isRegistering ? (
                    <>
                    already have an account?{' '} <span onClick={()=>setIsRegistering(false)} className="register-a">Login</span>
                    </>
                ):(
                    <>
                    Don’t have an account?{' '} <span onClick={()=>setIsRegistering(true)} className="register-a">Register</span>
                    
                    </>
                )}
            </p>
            </div>

        </div>

    </div>
    </>
  )
}

export default Login