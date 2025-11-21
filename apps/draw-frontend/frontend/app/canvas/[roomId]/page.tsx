"use client"

import CanvasDrawing, { initdraw } from "@/app/draw";
import { log } from "console";
import { flatMap } from "lodash";
import { useEffect, useRef } from "react";



export default function Canvas(){
  const canvasRef = useRef<HTMLCanvasElement>(null);



  useEffect(()=>{
    if(canvasRef.current){
    
      if(canvasRef.current){
        initdraw(canvasRef.current)
      }
  


       


    }
  },[canvasRef])

  return <div>
    <CanvasDrawing></CanvasDrawing>
  
  </div>
}