// Native Higgsedit commercial. Run from repository root: higgsedit build scripts/login-presentation.jsx
export default async ({project}) => {
 const root=process.cwd();
 const file=s=>root+'/'+s;
 const p=await project({dir:file('.video-build/login-v2'),size:'1280x800',fps:24,background:'#081528'});
 const logo=await p.add(file('frontend/public/brand/davino-neves-logo.png'));
 const shots=await Promise.all(['ai','cnj','agenda'].map(n=>p.add(file('frontend/public/login/shot-'+n+'.jpg'))));
 const gold='#cfb578';
 const fade=d=>[{property:'opacity',keyframes:[{at:0,value:0},{at:.5,value:1},{at:d-.35,value:1},{at:d,value:0}]}];
 const rise=d=>({enter:{from:{y:25,opacity:0},duration:.55},exit:{to:{opacity:0},duration:.3,anchor:'end'}});
 const txt=(s,x,y,w,size,color='#f8fafc',weight=600)=><text x={x} y={y} width={w} height={size*4} fontFamily="Montserrat" fontSize={size} fontWeight={weight} lineHeight={1.2} color={color}>{s}</text>;
 p.compose(<frame x={0} y={0} width={1280} height={800} layout="none">
  <rect x={0} y={0} width={1280} height={800} fill={{kind:'linear',angle:25,stops:[{offset:0,color:'#081528'},{offset:1,color:'#18324c'}]}}/>
  <rect x={400} y={100} width={650} height={600} radius={250} fill={{kind:'radial',stops:[{offset:0,color:'#31536c',opacity:.6},{offset:1,color:'#31536c',opacity:0}]}} animate={[{property:'offsetX',from:-70,to:90,duration:20}]}/>
 </frame>,{dur:20,name:'Studio'});
 p.compose(<frame x={0} y={0} width={1280} height={800} layout="none" background="#f4f1e9" animate={fade(3.2)}>
  <rect x={80} y={54} width={1120} height={692} radius={26} fill="#fffdf8" strokeColor="#d8c9a4" strokeWidth={1}/>
  <media x={320} y={95} width={640} height={323} fit="contain" file={logo} animate={[{property:'scale',from:.9,to:1,duration:1.5,easing:'house'},{property:'opacity',from:0,to:1,duration:.8}]}/>
  <frame x={180} y={462} width={920} height={190} layout="none" motion={rise(3.2)}>
    {txt('Sua advocacia.\nUma nova perspectiva.',0,0,920,48,'#0c1f3d')}
  </frame>
  {txt('GESTÃO JURÍDICA INTELIGENTE',390,680,700,17,'#7d6632',500)}
 </frame>,{dur:3.2,name:'Original brand'});
 p.compose(<frame x={0} y={0} width={1280} height={800} layout="none" animate={fade(14.2)}>
  <rect x={48} y={38} width={225} height={112} radius={10} fill="#fffdf8"/>
  <media x={61} y={48} width={199} height={100} file={logo} fit="contain"/>
  <rect x={312} y={680} width={930} height={26} radius={13} fill="#020915" shadow={{x:0,y:15,blur:35,color:'#00000080'}}/>
  <frame x={326} y={185} width={902} height={500} layout="none" motion={{enter:{from:{y:65,scale:.88,opacity:0},duration:.8}}}
    >
   <rect x={0} y={0} width={902} height={500} radius={20} fill={{kind:'linear',angle:90,stops:[{offset:0,color:'#5f6d7b'},{offset:1,color:'#141e2c'}]}} strokeColor="#7c8a99" strokeWidth={2}/>
   <rect x={7} y={7} width={888} height={486} radius={15} fill="#050a12"/>
   <rect x={448} y={7} width={6} height={6} radius={3} fill="#34465a"/>
   <frame x={15} y={22} width={872} height={460} layout="none" clip={true} radius={5}>
    {shots.map((shot,i)=><frame x={0} y={0} width={872} height={460} layout="none" clip={true} at={i*4.3} duration={i===2?5.6:4.65} animate={fade(i===2?5.6:4.65)}>
      <media x={0} y={0} width={872} height={599} file={shot} fit="fill" animate={[{property:'scale',keyframes:[{at:0,value:1},{at:1,value:1},{at:3,value:1.13},{at:4.3,value:1.13}]}]}/>
    </frame>)}
    <path x={0} y={0} width={23} height={31} d="M 1 1 L 1 27 L 8 20 L 14 30 L 19 27 L 13 17 L 23 17 Z" fill="#ffffff" stroke={{color:'#0b1c33',width:2}} at={.9} duration={12.5}
     animate={[{property:'offsetX',keyframes:[{at:0,value:560},{at:1.3,value:690},{at:2.2,value:690},{at:2.8,value:66},{at:3.5,value:66},{at:4.6,value:420},{at:6.2,value:530},{at:7,value:66},{at:7.8,value:66},{at:8.8,value:590},{at:11.2,value:645},{at:12.5,value:700}]},{property:'offsetY',keyframes:[{at:0,value:320},{at:1.3,value:120},{at:2.2,value:120},{at:2.8,value:295},{at:3.5,value:295},{at:4.6,value:310},{at:6.2,value:320},{at:7,value:147},{at:7.8,value:147},{at:8.8,value:180},{at:11.2,value:280},{at:12.5,value:300}]}]}/>
    {[{at:3.7,x:57,y:286},{at:7.9,x:57,y:138}].map(c=><rect x={c.x} y={c.y} width={30} height={30} radius={15} fill="#c9af710d" strokeColor="#b38e3d" strokeWidth={2} at={c.at} duration={.5} animate={[{property:'scale',from:.5,to:2.5,duration:.5},{property:'opacity',from:1,to:0,duration:.5}]}/>)}
   </frame>
   <rect x={391} y={489} width={120} height={2} fill="#4d5b6e"/>
  </frame>
  <path x={294} y={684} width={966} height={35} d="M 0 0 L 966 0 L 918 30 L 48 30 Z" fill={{kind:'linear',angle:90,stops:[{offset:0,color:'#b5bcc4'},{offset:1,color:'#485567'}]}}/>
  <rect x={681} y={684} width={193} height={9} radius={5} fill="#596778"/>
  {txt('Demonstração da interface',990,727,230,12,'#8b9aab',400)}
  <rect x={48} y={780} width={1184} height={2} fill={gold} animate={[{property:'scaleX',from:.01,to:1,duration:14.2,easing:'linear'}]}/>
 </frame>,{at:2.8,dur:14.2,name:'Computer demonstration'});
 const captions=[['01 / ASSISTENTE IA','Transforme\ninformação\nem estratégia.','Analise documentos.\nPrepare minutas.'],['02 / CONSULTA CNJ','Informação\nprocessual.\nAo seu alcance.','Consulte o CNJ\nno mesmo ambiente.'],['03 / AGENDA','Organize\nsua rotina.\nVisualize prazos.','Compromissos e equipe\nem um só lugar.']];
 for(let i=0;i<3;i++)p.compose(<frame x={48} y={232} width={278} height={425} layout="none" motion={rise(4.6)}>
  {txt(captions[i][0],0,0,278,15,gold,500)}
  <rect x={0} y={42} width={52} height={3} fill={gold} animate={[{property:'scaleX',from:0,to:1,duration:.6}]}/>
  {txt(captions[i][1],0,72,278,34)}
  {txt(captions[i][2],0,281,270,18,'#bac8d8',400)}
 </frame>,{at:3.2+i*4.3,dur:4.6,name:'Benefit '+i});
 p.compose(<frame x={0} y={0} width={1280} height={800} layout="none" background="#f4f1e9" animate={fade(3.4)}>
  <media x={440} y={70} width={400} height={202} fit="contain" file={logo}/>
  <frame x={140} y={354} width={1000} height={230} layout="none" motion={rise(3.4)}>
    {txt('Mais organização.\nMais tempo para advogar.',0,0,1000,51,'#0c1f3d')}
    <rect x={0} y={155} width={120} height={3} fill="#b49758"/>
    {txt('Tecnologia para apoiar cada etapa do seu trabalho.',0,184,1000,21,'#496078',400)}
  </frame>
  {txt('DAVINO NEVES ADVOCACIA',140,691,1000,16,'#8b7340',500)}
 </frame>,{at:16.6,dur:3.4,name:'Brand promise'});
 await p.frame(5.3,file('.video-build/login-v2/cover.png'));
 await p.frame(1.8,file('.video-build/login-v2/intro.png'));
 await p.frame(9.3,file('.video-build/login-v2/cnj.png'));
 await p.frame(13.4,file('.video-build/login-v2/agenda.png'));
 await p.frame(18.2,file('.video-build/login-v2/closing.png'));
 await p.render(file('.video-build/login-v2/presentation.mp4'),{bitrate:1800000,accel:'cpu',concurrency:2});
};
