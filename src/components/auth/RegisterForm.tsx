'use client';

import { useState } from "react";
import { registerUser } from "@/services/api";

export default function RegisterForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const handleRegister = async () => {
    const res = await registerUser(form);
    console.log(res);
    alert("Registered successfully");
  };

  return (
    <div className="flex flex-col gap-3">
      <input placeholder="Email" onChange={(e)=>setForm({...form,email:e.target.value})}/>
      <input placeholder="Password" onChange={(e)=>setForm({...form,password:e.target.value})}/>
      <input placeholder="First Name" onChange={(e)=>setForm({...form,first_name:e.target.value})}/>
      <input placeholder="Last Name" onChange={(e)=>setForm({...form,last_name:e.target.value})}/>

      <button onClick={handleRegister} className="bg-green-500 text-white p-2">
        Register
      </button>
    </div>
  );
}