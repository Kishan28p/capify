import React from 'react'

function Register() {
  return (
    <>
     <div className='modal-overlay'>
        <div className='modal-box'>
            <button onClick={onClose} className='close-btn'>x</button>
            <div className="login-header">
                <h4 className="login-heading">Login</h4>
            </div>
            <form className='modal-form' onSubmit={handleSubmit}>
                <label htmlFor="">username</label>
                <input  type="text" name='name' value={formData.name}  onChange={handleInput}/>
                <label htmlFor="">password</label>
                <input  type="password" name='password' value={formData.password}  onChange={handleInput}/>
                <button>login</button>
            </form>
            <div className="register-wrapper">
            <p className="register-link">
                Don’t have an account? <a href="/register" className="register-a">Register</a>
            </p>
            </div>

        </div>

    </div>
    </>
  )
}

export default Register