"use client"
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId,setroomId] = useState("");
  const router = useRouter();
  return (
    <div className={styles.page}>
      <input value={roomId} onChange={(e)=>{
        setroomId(e.target.value)
      }} type="text" placeholder="enter the roomId" />

      <button onClick={()=>{
        router.push(`/backend/room/${roomId}`);
      }}>search</button>
    </div>
  );
}
