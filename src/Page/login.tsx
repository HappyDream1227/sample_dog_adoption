import { useState } from "react"
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  name: string;
  email: string;
}

export default function Login() {
  const [user, setUser] = useState<User>({ name: '', email: '' });
  const nav = useNavigate()

  const handleUser = (newData: Partial<User>) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newData
    }));
  };

  const login = () => {
    console.log(user)
    axios.post('https://frontend-take-home-service.fetch.com/auth/login', {
      name: user.name,
      email: user.email
    }, {
        withCredentials: true // This sends cookies with the request
    })
    .then(response => {
        // Handle successful login
        console.log(response.data);
        nav('/home')
    })
    .catch(error => {
        alert('---------  Request Failed! ----------');
    });
  }

  return(
    <>
      <div className="flex w-full h-screen bg-[#111827] justify-center items-center text-white">
        <div className="bg-[#232A39] py-20 px-40 flex flex-col border-[1px] border-slate-700 rounded-[30px] justify-center items-center">
          <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"></path></svg>
          <label className="font-semibold">Login</label>

          <div>

          </div>
          <div className="flex flex-col mt-10 gap-2 items-start w-full">
            <label className="text-[20px]">Login</label>
            <input value={user.name} className="outline-none border focus:border-teal-500 text-xs rounded-lg block w-[350px] p-2.5 bg-gray-700 border-gray-600 placeholder-gray-500 text-[16px]" onChange={(e) => handleUser({name : e.target.value})}></input>
          </div>

          <div className="flex flex-col mt-4 gap-2 items-start w-full">
            <label className="text-[20px]">Email</label>
            <input value={user.email} type="text" className="outline-none border focus:border-teal-500 text-xs rounded-lg block w-[350px] p-2.5 bg-gray-700 border-gray-600 placeholder-gray-500 text-[16px]" onChange={(e) => handleUser({email : e.target.value})}></input>
          </div>

          <button onClick={login} className="mt-10 w-full flex justify-center text-sm md:text-xl bg-teal-500 hover:bg-teal-700 hover:text-teal-100 transition py-2 rounded-md">Login</button>
        </div>
      </div>
      
    </>
  )
}