"use client"

import { log } from "console";
import { useEffect, useRef } from "react";



export default function Canvas(){
  const canvasRef = useRef<HTMLCanvasElement>(null);



  useEffect(()=>{
    if(canvasRef.current){
    const canvas =canvasRef.current;
    const ctx = canvas.getContext("2d")

    if(!ctx){
      return
    }
    canvas.addEventListener("mousedown", (e)=>{
      console.log(e.clientX)
      console.log(e.clientY)
    })

    canvas.addEventListener("mouseup", (e)=>{
      console.log(e.clientX);
      console.log(e.clientY);
      
    })

    canvas.addEventListener("mousemove", (e)=>{
      console.log(e.clientX);
      console.log(e.clientY);
      
    })


    }
  },[canvasRef])

  return <div>

  <canvas ref={canvasRef} width={500} height={500}></canvas>
  </div>
}