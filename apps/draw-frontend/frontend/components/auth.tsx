"use client"

export function Auth({isSignin}:{
    isSignin:boolean
}){

return <div className="w-screen h-screen items-center justify-center flex">

    <div className="p-20 rounded bg-sky-300 text-black m-20 flex flex-col gap-10 ">
        <input className="border-2 border-indigo-400 pl-3" type="tsxt" placeholder="enter your email" />
        <input className="border-2 border-indigo-400 pl-3" type="password" placeholder="enter your password" />

        <button className="cursor-pointer bg-sky-600 rounded" onClick={()=>{

        }}>{isSignin?"signin": "signup"}</button>

    </div>
</div>
    
}