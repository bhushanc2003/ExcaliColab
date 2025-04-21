import {useEffect,useState} from "react";
import {WS_URL} from "../app/config";

export function useSocket(){
    const [loading,setLoading]=useState(true);
    const [socket,setSocket]=useState<WebSocket>();

    useEffect(()=>{
        const ws=new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MGQ0NTE1Mi1kMWE5LTRmYjgtOGI3Ny1iYTY5NDZkNTZkNmEiLCJpYXQiOjE3NDUwNzEwMzN9.D3TPLD-dQpZw7pgggErAhG0PwHRkYeTPEMNGwWB1gXE`);
        ws.onopen=()=>{
            setLoading(false);
            setSocket(ws);

        }
    },[]);

    return {
        socket,
        loading
    }
   


} 