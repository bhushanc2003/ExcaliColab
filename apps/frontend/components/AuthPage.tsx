"use client"
export function AuthPage({isSignin}: {isSignin: boolean}) {
    return <div className="w-scren h-screen flex items-center justify-center ">
        <div className="p-2 m-2 bg-white rounded">
            <input type="text" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button onClick={
                ()=>{

                }
            }>{isSignin?"sign in":"sign up"}</button>
        </div>
         


    </div>

}