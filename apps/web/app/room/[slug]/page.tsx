import axios from "axios";
import { ChatRoom } from "../../../components/ChatRoom";
import { BACKEND_URL } from "../../../app/config";
async function getRoomId(slug:string){
    const responce=await axios.get(`${BACKEND_URL}/room/${slug}`)
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
    console.log(roomId);

    return <ChatRoom id={roomId}></ChatRoom>
    
}