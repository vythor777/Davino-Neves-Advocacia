// Render with Higgsedit from the repository root: higgsedit build scripts/login-presentation.jsx
export default async ({project}) => {
 const p = await project({dir:"./.video-build/login",size:"1280x800",fps:24,background:"#0c1f3d"});
 const labels = ["Assistente jurídico IA","Consulta processual","Agenda e prazos"];
 const names = ["ai","cnj","agenda"];
 for(let i=0;i<3;i++){
 const asset=await p.add("./frontend/public/login/shot-"+names[i]+".jpg");
 p.compose(<frame x={0} y={0} width={1280} height={800} layout="none">
   <rect x={0} y={0} width={1280} height={800} fill="#0c1f3d" />
   <text x={64} y={28} width={1152} height={50} fontSize={30} fontFamily="Montserrat" fontWeight={600} color="#dbeafe">{labels[i]}</text>
   <frame x={64} y={100} width={1152} height={632} layout="none" radius={18} clip={true}
     motion={{enter:{from:{x:i===1?90:-70,scale:0.98,opacity:0},duration:0.6},exit:{to:{x:i===1?-45:45,opacity:0},duration:0.5,anchor:"end"}}}>
      <media x={0} y={0} file={asset} width={1152} height={632} fit="cover"
        animate={[{property:"scale",from:1,to:1.035,duration:4.6,easing:"smooth"}]} />
   </frame>
   <rect x={64} y={764} width={1152} height={2} fill="#234067" />
   <rect x={64} y={764} width={1152} height={2} fill="#60a5fa" animate={[{property:"scaleX",from:0,to:1,duration:4.6,easing:"linear"}]} />
 </frame>,{at:i*4,dur:4.6,name:names[i]});
 }
 await p.frame(1.5,"./.video-build/login/cover.png");
 await p.render("./.video-build/login/presentation.mp4",{bitrate:1400000,accel:"cpu",concurrency:2});
};