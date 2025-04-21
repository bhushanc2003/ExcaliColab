import axios from "axios";
import { ChatRoom } from "../../../components/ChatRoom";
async function getRoomId(slug:string){
    const responce=await axios.get(`{BACKEND_URL}/room/${slug}`)
    return responce.data.room.id;

}

export default async function ChatRoom1({
    params}:{
        params:{
            slug:string

        }
    
}){
    const slug=await params.slug;
    const roomId=await getRoomId(slug);

    return <ChatRoom id={roomId}></ChatRoom>
    
}