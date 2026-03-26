import { useEffect, useRef, useState } from "react";
import "./App.css";

// ─── DATA ─────────────────────────────────────────────────
const PROJECTS = [
  { title:"EvalEngine",sub:"LLM Evaluation & Improvement Engine",stack:["Python","Streamlit","LLM APIs"],badge:"AI / ML",color:"#7ee8a2",db:false,desc:"An LLM-based evaluation system that analyzes and compares multiple model-generated responses for reliability. Features multi-response ranking using an LLM-as-a-judge, a scoring pipeline across key quality metrics, and a fallback refinement mechanism.",hl:["Multi-response ranking with reasoning","Scoring pipeline: relevance, correctness, completeness, bias","Fallback refinement for weak outputs","Interactive Streamlit dashboard","Hallucination detection & RAG in progress"],gh:"https://github.com/vahinichilukamarri"},
  { title:"AskBI",sub:"AI-Powered Business Intelligence Dashboard",stack:["React","FastAPI","Pandas","LLM APIs","SQL"],badge:"Full-Stack",color:"#5bc4e0",db:false,desc:"A natural language to SQL system enabling users to query structured datasets using plain English. Built an LLM-based query generation pipeline, a FastAPI backend with Pandas for data handling, and a React dashboard to visualize business insights in real time.",hl:["Natural language to SQL via LLM","FastAPI backend with Pandas","React dashboard for real-time insights","Automated queries for non-technical users"],gh:"https://github.com/vahinichilukamarri"},
  { title:"MoodAngels",sub:"AI-Based Psychiatric Diagnostic Support",stack:["Python","NLP","MERN Stack"],badge:"NLP",color:"#c4a7e7",db:false,desc:"A multi-agent system to analyze patient symptoms and assist in diagnostic reasoning. Built NLP-based modules to process behavioral and textual patient data, generated 500+ synthetic psychiatric case records, and developed a MERN dashboard.",hl:["Multi-agent diagnostic reasoning","NLP modules for behavioral data","500+ synthetic psychiatric case records","MERN dashboard for case visualization"],gh:"https://github.com/vahinichilukamarri"},
  { title:"SafeStreet",sub:"Road Damage Detection System",stack:["Vision Transformer (ViT)","React Native","React.js","Node.js","REST API"],badge:"Computer Vision",color:"#f0a070",db:false,desc:"Trained a Vision Transformer model to classify road damage types with high accuracy. Built a Node.js REST API for real-time predictions, a React Native mobile app for damage capture, and a React.js web dashboard with geolocation-based mapping.",hl:["ViT model for road damage classification","Node.js REST API for predictions","React Native mobile app","Geolocation-mapped web dashboard"],gh:"https://github.com/vahinichilukamarri"},
  { title:"NextRide",sub:"Smart School Bus Tracking & Route Optimization",stack:["Node.js","Leaflet.js","MongoDB","HTML","CSS"],badge:"IoT / Tracking",color:"#e0c457",db:true,desc:"A real-time GPS tracking system with dynamic route updates based on student attendance. Built with Node.js backend and MongoDB for data persistence, using HTML/CSS frontend via REST API. Optimized routes reduce unnecessary stops.",hl:["Real-time GPS tracking system","MongoDB for persistent data storage","Node.js + HTML/CSS architecture","Dynamic routing by attendance","Leaflet.js map interface"],gh:"https://github.com/vahinichilukamarri"},
];

const SKILLS = [
  {cat:"Languages",ico:"{ }",color:"#7ee8a2",items:["Python","JavaScript","Java","C/C++","SQL","HTML/CSS"]},
  {cat:"Full-Stack & Frameworks",ico:"⚡",color:"#5bc4e0",items:["ReactJS","Node.js","Express.js","FastAPI","REST API","MERN Stack","React Native","Streamlit"]},
  {cat:"AI / ML & Deep Learning",ico:"🧠",color:"#c4a7e7",items:["TensorFlow","Keras","PyTorch","Transformers","NLP","Vision Transformer (ViT)","LLM APIs","LLM Evaluation","RAG (in progress)","Prompt Engineering"]},
  {cat:"Databases & Tools",ico:"🛠",color:"#f0a070",items:["MySQL","MongoDB","Git","GitHub","Docker","Jupyter Notebook"]},
  {cat:"Core Concepts",ico:"📐",color:"#e0c457",items:["Data Structures & Algorithms","OOP","Machine Learning","CI/CD","SDLC"]},
];
const CERTS=[{title:"SQL (Intermediate)",org:"HackerRank",ico:"🏆",color:"#7ee8a2"},{title:"Generative AI for Beginners",org:"GreatLearning",ico:"🤖",color:"#5bc4e0"},{title:"Generative AI Workshop",org:"Skilligence Edtech × IIT Hyderabad",ico:"🎓",color:"#c4a7e7"}];
const ACHS=[{title:"DBMS Workshop Facilitator",desc:"Co-taught a peer workshop on Database Management Systems at KMIT",ico:"📚",color:"#f0a070"},{title:"PRAKALP Hackathon",desc:"Developed a Bluetooth Talking Vehicle prototype (6-member team)",ico:"⚡",color:"#e0c457"},{title:"GeeksforGeeks Hackathon",desc:"Built a working prototype demonstrating end-to-end system design",ico:"💡",color:"#7ee8a2"},{title:"Top 3% — Intermediate Statewide",desc:"Achieved 97.0% in MPC (2021–2023), placing in top 3% statewide",ico:"🌟",color:"#5bc4e0"},{title:"Perfect SSC Score",desc:"Completed Secondary School Certificate with a perfect GPA of 10/10",ico:"🎯",color:"#c4a7e7"}];

function GithubIcon(){return(<svg width="16"height="16"viewBox="0 0 24 24"fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>);}

function AnimatedSection({children,delay=0,className=""}){
  const ref=useRef(null);const[visible,setVisible]=useState(false);
  useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVisible(true);o.disconnect();}},{threshold:.1});if(ref.current)o.observe(ref.current);return()=>o.disconnect();},[]);
  return(<div ref={ref}className={`ha ${visible?"rev":""} ${className}`}style={{transitionDelay:`${delay}s`}}>{children}</div>);
}

// ══════════════════════════════════════════════════════════
//  NEBULA BACKGROUND — deep space with clouds, stars, shooters
// ══════════════════════════════════════════════════════════
function NebulaBackground(){
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current;
    const ctx=canvas.getContext("2d");
    let animId,t=0;
    const resize=()=>{canvas.width=window.innerWidth;canvas.height=Math.max(document.body.scrollHeight,window.innerHeight);};
    resize();
    window.addEventListener("resize",resize);

    // Nebula blobs
    const blobs=Array.from({length:9},(_,i)=>({
      x:Math.random()*window.innerWidth,
      y:Math.random()*Math.max(document.body.scrollHeight,window.innerHeight),
      rx:180+Math.random()*380,ry:120+Math.random()*280,
      hue:[152,195,265,28,175][i%5],
      alpha:0.028+Math.random()*0.038,
      driftX:(Math.random()-.5)*0.05,driftY:(Math.random()-.5)*0.03,
      phase:Math.random()*Math.PI*2,
    }));

    // Stars
    const stars=Array.from({length:280},()=>({
      x:Math.random()*window.innerWidth,
      y:Math.random()*Math.max(document.body.scrollHeight,window.innerHeight),
      r:Math.random()<0.8?Math.random()*0.85+0.15:Math.random()*1.8+0.8,
      speed:0.5+Math.random()*2,phase:Math.random()*Math.PI*2,
      col:Math.random()<0.25?"168,216,255":Math.random()<0.4?"255,230,200":"255,255,255",
    }));

    // Constellation groups
    const consts=[
      [[0.07,0.09],[0.13,0.05],[0.20,0.08],[0.17,0.14],[0.13,0.05]],
      [[0.76,0.04],[0.83,0.08],[0.89,0.05],[0.86,0.13],[0.83,0.08]],
      [[0.54,0.72],[0.59,0.67],[0.65,0.71],[0.63,0.78],[0.57,0.80],[0.54,0.72]],
      [[0.35,0.45],[0.40,0.40],[0.44,0.44],[0.40,0.50],[0.35,0.45]],
    ];

    // Shooting stars
    let shooters=[];
    const spawnShooter=()=>shooters.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height*0.45,
      len:90+Math.random()*140,speed:7+Math.random()*9,
      angle:Math.PI/6+Math.random()*0.28,life:1,
    });
    const si=setInterval(spawnShooter,2800);

    const draw=()=>{
      // Update canvas height in case DOM grew
      const pageH=Math.max(document.body.scrollHeight,window.innerHeight);
      if(Math.abs(canvas.height-pageH)>50){canvas.height=pageH;}
      ctx.clearRect(0,0,canvas.width,canvas.height);
      t+=0.004;

      // ── Base: very dark deep-space gradient
      const bg=ctx.createLinearGradient(0,0,canvas.width*.5,canvas.height);
      bg.addColorStop(0,"#01030d");
      bg.addColorStop(.3,"#020612");
      bg.addColorStop(.7,"#030916");
      bg.addColorStop(1,"#010410");
      ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);

      // ── Nebula blobs
      blobs.forEach(c=>{
        c.x+=c.driftX;c.y+=c.driftY;
        if(c.x<-c.rx)c.x=canvas.width+c.rx;if(c.x>canvas.width+c.rx)c.x=-c.rx;
        if(c.y<-c.ry)c.y=canvas.height+c.ry;if(c.y>canvas.height+c.ry)c.y=-c.ry;
        const pulse=1+Math.sin(t*0.3+c.phase)*0.12;
        const g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.rx*pulse);
        g.addColorStop(0,`hsla(${c.hue},75%,58%,${c.alpha*1.8})`);
        g.addColorStop(.45,`hsla(${c.hue},65%,42%,${c.alpha*0.9})`);
        g.addColorStop(1,`hsla(${c.hue},55%,28%,0)`);
        ctx.save();
        ctx.scale(1,c.ry/c.rx);
        ctx.beginPath();ctx.arc(c.x,c.y*(c.rx/c.ry),c.rx*pulse,0,Math.PI*2);
        ctx.fillStyle=g;ctx.fill();
        ctx.restore();
      });

      // ── Constellation lines
      consts.forEach(pts=>{
        ctx.beginPath();
        pts.forEach(([fx,fy],i)=>{
          const x=fx*canvas.width,y=fy*canvas.height;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        });
        ctx.strokeStyle="rgba(126,232,162,0.08)";ctx.lineWidth=0.7;ctx.stroke();
        pts.forEach(([fx,fy])=>{
          ctx.beginPath();ctx.arc(fx*canvas.width,fy*canvas.height,1.8,0,Math.PI*2);
          ctx.fillStyle="rgba(126,232,162,0.4)";ctx.fill();
        });
      });

      // ── Stars with twinkle
      stars.forEach(s=>{
        const tw=0.35+0.65*Math.abs(Math.sin(t*s.speed+s.phase));
        ctx.globalAlpha=tw*0.9;
        ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgb(${s.col})`;ctx.fill();
        // Glow on brighter stars
        if(s.r>1.2){
          const glow=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*4);
          glow.addColorStop(0,`rgba(${s.col},${tw*0.3})`);
          glow.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath();ctx.arc(s.x,s.y,s.r*4,0,Math.PI*2);
          ctx.fillStyle=glow;ctx.fill();
        }
        ctx.globalAlpha=1;
      });

      // ── Shooting stars
      shooters=shooters.filter(s=>s.life>0);
      shooters.forEach(s=>{
        s.x+=Math.cos(s.angle)*s.speed;s.y+=Math.sin(s.angle)*s.speed;s.life-=0.016;
        const tx=s.x-Math.cos(s.angle)*s.len,ty=s.y-Math.sin(s.angle)*s.len;
        const g=ctx.createLinearGradient(tx,ty,s.x,s.y);
        g.addColorStop(0,"rgba(126,232,162,0)");
        g.addColorStop(.7,`rgba(200,255,230,${s.life*0.5})`);
        g.addColorStop(1,`rgba(255,255,255,${s.life})`);
        ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(s.x,s.y);
        ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.stroke();
        // Sparkle tip
        ctx.beginPath();ctx.arc(s.x,s.y,2,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${s.life*0.9})`;ctx.fill();
      });

      animId=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(animId);clearInterval(si);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={canvasRef} id="nebula-bg"/>;
}

// ══════════════════════════════════════════════════════════
//  HERO CANVAS — mesh node network
// ══════════════════════════════════════════════════════════
function HeroCanvas(){
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas.getContext("2d");let animId;
    const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;};
    resize();window.addEventListener("resize",resize);
    const COLS=["126,232,162","91,196,224","196,167,231"];
    const nodes=Array.from({length:42},()=>({
      x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,
      r:Math.random()*1.6+0.4,
      dx:(Math.random()-.5)*0.25,dy:(Math.random()-.5)*0.25,
      a:Math.random()*0.55+0.12,
      col:COLS[Math.floor(Math.random()*3)],
    }));
    const LINK=150;
    const anim=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
          const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d<LINK){
            const a=(1-d/LINK)*0.13;
            ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);
            ctx.strokeStyle=`rgba(126,232,162,${a})`;ctx.lineWidth=0.6;ctx.stroke();
          }
        }
      }
      nodes.forEach(p=>{
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${p.col},${p.a})`;ctx.fill();
        p.x+=p.dx;p.y+=p.dy;
        if(p.x<0||p.x>canvas.width)p.dx*=-1;if(p.y<0||p.y>canvas.height)p.dy*=-1;
      });
      animId=requestAnimationFrame(anim);
    };anim();
    return()=>{cancelAnimationFrame(animId);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} id="heroCanvas"/>;
}

// ══════════════════════════════════════════════════════════
//  ADVANCED CURSOR — ring + comet trail + orbit dots + particles
// ══════════════════════════════════════════════════════════
function CursorFX(){
  const innerRef=useRef(null);
  const outerRef=useRef(null);
  const trailRef=useRef(null);
  const mouse=useRef({x:-300,y:-300});
  const smoothPos=useRef({x:-300,y:-300});
  const isLink=useRef(false);
  const trailPts=useRef([]);
  const sparks=useRef([]);

  useEffect(()=>{
    const mob=window.matchMedia("(max-width:768px)").matches;
    if(mob)return;
    const canvas=trailRef.current,ctx=canvas.getContext("2d");
    const inner=innerRef.current,outer=outerRef.current;
    const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;};
    resize();window.addEventListener("resize",resize);

    const onMove=e=>{
      mouse.current={x:e.clientX,y:e.clientY};
      inner.style.transform=`translate(${e.clientX-5}px,${e.clientY-5}px)`;
      trailPts.current.push({x:e.clientX,y:e.clientY,t:Date.now()});
      if(trailPts.current.length>40)trailPts.current.shift();
      // Spark burst on fast move
      if(Math.random()<0.3){
        sparks.current.push({
          x:e.clientX,y:e.clientY,
          vx:(Math.random()-.5)*2.5,vy:(Math.random()-.5)*2.5-0.8,
          life:1,r:Math.random()*2+0.5,
          hue:[155,195,270,40][Math.floor(Math.random()*4)],
        });
      }
    };
    const onOver=e=>{isLink.current=!!e.target.closest("a,button,[data-cursor]");};
    document.addEventListener("mousemove",onMove);
    document.addEventListener("mouseover",onOver);

    let animId;
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const now=Date.now(),m=mouse.current;

      // Smooth lag for outer ring
      smoothPos.current.x+=(m.x-smoothPos.current.x)*0.1;
      smoothPos.current.y+=(m.y-smoothPos.current.y)*0.1;
      const sp=smoothPos.current;

      // Outer ring
      const targetSize=isLink.current?44:38;
      outer.style.width=targetSize+"px";outer.style.height=targetSize+"px";
      outer.style.transform=`translate(${sp.x-targetSize/2}px,${sp.y-targetSize/2}px)`;
      outer.style.borderColor=isLink.current?"rgba(255,255,255,0.85)":"rgba(126,232,162,0.6)";
      outer.style.boxShadow=isLink.current?"0 0 16px rgba(255,255,255,0.25)":"0 0 12px rgba(126,232,162,0.2)";
      inner.style.background=isLink.current?"#ffffff":"#7ee8a2";
      inner.style.boxShadow=isLink.current?"0 0 8px rgba(255,255,255,0.6)":"0 0 8px rgba(126,232,162,0.8)";

      // ── Comet trail
      const tp=trailPts.current;
      if(tp.length>2){
        ctx.save();
        for(let i=2;i<tp.length;i++){
          const p0=tp[i-1],p1=tp[i];
          const age=(now-p1.t)/160;
          const alpha=Math.max(0,1-age)*(i/tp.length)*0.6;
          ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);
          ctx.strokeStyle=`rgba(126,232,162,${alpha})`;
          ctx.lineWidth=(i/tp.length)*4;ctx.lineCap="round";ctx.stroke();
        }
        ctx.restore();
        // Halo at tip
        const last=tp[tp.length-1];
        const gr=ctx.createRadialGradient(last.x,last.y,0,last.x,last.y,36);
        gr.addColorStop(0,"rgba(126,232,162,0.16)");
        gr.addColorStop(.5,"rgba(91,196,224,0.06)");
        gr.addColorStop(1,"rgba(0,0,0,0)");
        ctx.beginPath();ctx.arc(last.x,last.y,36,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();
      }

      // ── Expanding ripple rings
      for(let i=0;i<5;i++){
        const phase=((now/1000)+i*0.6)%1;
        const r=phase*56;
        const a=(1-phase)*0.07;
        ctx.beginPath();ctx.arc(m.x,m.y,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(126,232,162,${a})`;ctx.lineWidth=0.8;ctx.stroke();
      }

      // ── Orbiting dots
      const orbitCount=isLink.current?6:4;
      for(let i=0;i<orbitCount;i++){
        const angle=(now*0.0012)+i*(Math.PI*2/orbitCount);
        const orbitR=isLink.current?26:22;
        const ox=m.x+Math.cos(angle)*orbitR;
        const oy=m.y+Math.sin(angle)*orbitR;
        ctx.beginPath();ctx.arc(ox,oy,1.4,0,Math.PI*2);
        ctx.fillStyle=`rgba(126,232,162,${0.55+Math.sin(angle*2)*0.2})`;ctx.fill();
      }

      // ── Spark particles
      sparks.current=sparks.current.filter(s=>s.life>0);
      sparks.current.forEach(s=>{
        s.x+=s.vx;s.y+=s.vy;s.vy-=0.06;s.life-=0.04;s.r*=0.96;
        ctx.beginPath();ctx.arc(s.x,s.y,Math.max(0.1,s.r),0,Math.PI*2);
        ctx.fillStyle=`hsla(${s.hue},85%,68%,${s.life*0.7})`;ctx.fill();
      });

      animId=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(animId);document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseover",onOver);window.removeEventListener("resize",resize);};
  },[]);

  return(
    <>
      <div ref={innerRef} id="cur-inner"/>
      <div ref={outerRef} id="cur-outer"/>
      <canvas ref={trailRef} id="cur-trail-canvas"/>
    </>
  );
}

// ─── NAV ──────────────────────────────────────────────────
function Nav(){
  const[scrolled,setScrolled]=useState(false);
  const[menuOpen,setMenuOpen]=useState(false);
  useEffect(()=>{const s=()=>setScrolled(window.scrollY>40);window.addEventListener("scroll",s);return()=>window.removeEventListener("scroll",s);},[]);
  const goTo=id=>{document.getElementById(id)?.scrollIntoView({behavior:"smooth"});setMenuOpen(false);};
  const items=["about","featured","projects","skills","achievements","contact"];
  return(
    <>
      <nav id="navbar"className={scrolled?"scrolled":""}>
        <span className="nav-logo">VC.</span>
        <div className="nav-links">{items.map(id=><button key={id}onClick={()=>goTo(id)}>{id[0].toUpperCase()+id.slice(1)}</button>)}</div>
        <button className="hamburger"onClick={()=>setMenuOpen(o=>!o)}>
          <span style={{transform:menuOpen?"rotate(45deg) translateY(6.5px)":"none"}}/>
          <span style={{opacity:menuOpen?0:1}}/>
          <span style={{transform:menuOpen?"rotate(-45deg) translateY(-6.5px)":"none"}}/>
        </button>
      </nav>
      {menuOpen&&<div className="mob-menu open">{items.map(id=><button key={id}onClick={()=>goTo(id)}>{id[0].toUpperCase()+id.slice(1)}</button>)}</div>}
    </>
  );
}

// ─── HERO ─────────────────────────────────────────────────
function Hero(){
  const goTo=id=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  return(
    <section id="hero">
      <HeroCanvas/>
      <div className="hero-content">
        <div className="hero-badge vis"style={{animationDelay:".1s"}}><span/>Available for internships<span/></div>
        <h1 className="hero-name vis"style={{animationDelay:".22s"}}>Venkata Vahini<br/><span className="grad">Chilukamarri</span></h1>
        <p className="hero-sub vis"style={{animationDelay:".36s"}}>CS Student · AI/ML Engineer · Full-Stack Developer<br/>Building intelligent systems that solve real problems</p>
        <div className="hero-btns vis"style={{animationDelay:".5s"}}>
          <button className="btn-p"onClick={()=>goTo("projects")}>View Projects</button>
          <button className="btn-g"onClick={()=>goTo("contact")}>Contact Me</button>
        </div>
        <div className="hero-stats vis"style={{animationDelay:".65s"}}>
          {[["9.12","CGPA"],["5","Projects"],["500+","Dataset Records"],["40+","Volunteer Hrs"]].map(([n,l])=>(
            <div key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="scroll-hint"><span>Scroll</span><div className="sh-line"/></div>
    </section>
  );
}

function About(){
  return(
    <section className="sec-sep"><div className="sec"id="about">
      <div className="about-grid">
        <AnimatedSection>
          <div className="sec-lbl">About Me</div>
          <h2 className="sec-title">Turning Ideas<br/>into Intelligent<br/>Systems</h2>
          <p style={{color:"var(--t2)",lineHeight:1.85,fontSize:".97rem",marginBottom:16}}>I'm a 3rd-year Computer Science student at KMIT, Hyderabad (CGPA: 9.12), focused on building AI-based systems and full-stack applications that solve real-world problems.</p>
          <p style={{color:"var(--t2)",lineHeight:1.85,fontSize:".97rem",marginBottom:16}}>I developed an LLM evaluation engine to analyze, compare, and improve model-generated responses for reliability. My work spans NLP, computer vision, and data-driven systems.</p>
          <p style={{color:"var(--t2)",lineHeight:1.85,fontSize:".97rem",marginBottom:28}}>Skilled in Python, deep learning frameworks, and backend development — seeking a Software Engineering or AI/ML internship.</p>
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
            {["KMIT · CGPA 9.12","Hyderabad, India","Expected June 2027"].map(t=>(<span key={t}className="chip">{t}</span>))}
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.14}className="info-cards">
          {[{ico:"🤖",lbl:"AI / ML",dsc:"LLMs, NLP, Vision Transformers"},{ico:"⚡",lbl:"Full-Stack",dsc:"MERN, FastAPI, REST"},{ico:"🔬",lbl:"Research",dsc:"LLM Eval, RAG, Hallucination Detection"},{ico:"🎨",lbl:"Design",dsc:"Graphic Design, Visual Branding"}].map(c=>(
            <div key={c.lbl}className="icard"><div className="ico">{c.ico}</div><div className="lbl">{c.lbl}</div><div className="dsc">{c.dsc}</div></div>
          ))}
        </AnimatedSection>
      </div>
    </div></section>
  );
}

function Featured(){
  const[readmeOpen,setReadmeOpen]=useState(false);
  const openResume=()=>window.open("https://drive.google.com/file/d/YOUR_RESUME_ID/view","_blank");
  return(
    <section className="sec-sep"id="featured">
      <div className="sec">
        <AnimatedSection><div className="sec-lbl">Featured</div><h2 className="sec-title">Connect & Explore</h2></AnimatedSection>
        <div className="featured-grid">
          <AnimatedSection delay={0.08}>
            <a href="https://linkedin.com/in/vahini"target="_blank"rel="noreferrer"className="feat-card feat-li"style={{display:"block"}}>
              <div className="feat-bg"/><div className="feat-card-inner">
                <span className="feat-badge">LinkedIn</span>
                <div className="feat-title">Let's Connect<br/>Professionally</div>
                <div className="feat-desc">Find my work experience, endorsements, and professional network on LinkedIn. Always open to opportunities and collaborations.</div>
                <div className="feat-arrow"><svg width="14"height="14"viewBox="0 0 24 24"fill="currentColor"><path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zm-11 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"/></svg>View Profile →</div>
              </div>
            </a>
          </AnimatedSection>
          <AnimatedSection delay={0.16}>
            <div className="feat-card feat-resume"onClick={openResume}style={{cursor:"pointer"}}>
              <div className="feat-bg"/><div className="feat-card-inner">
                <span className="feat-badge">Resume</span>
                <div className="feat-title">Download My<br/>Full Resume</div>
                <div className="feat-desc">View my complete resume including education, experience, projects, and skills. Updated with the latest achievements.</div>
                <div className="feat-arrow"style={{color:"var(--accent)"}}><svg width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Open Resume →</div>
                <div className="resume-pill"><div style={{fontFamily:"var(--df)",fontSize:".72rem",color:"var(--accent)",fontWeight:600,marginBottom:4}}>📄 VENKATA_VAHINI_RESUME.pdf</div><div style={{fontSize:".7rem",color:"var(--t3)"}}>CS Student · AI/ML · Full-Stack</div></div>
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.24}>
            <div className="feat-card feat-gh"onClick={()=>setReadmeOpen(o=>!o)}style={{cursor:"pointer"}}>
              <div className="feat-bg"/><div className="feat-card-inner">
                <span className="feat-badge">GitHub README</span>
                <div className="feat-title">vahinichilukamarri<wbr/>/vahinichilukamarri</div>
                <div className="feat-desc">A collection of development projects demonstrating practical skills. Actively practicing DSA to improve problem-solving and coding efficiency.</div>
                <div className="feat-arrow"><svg width="13"height="13"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"><polyline points={readmeOpen?"18 15 12 9 6 15":"6 9 12 15 18 9"}/></svg>{readmeOpen?"Collapse ↑":"Read More →"}</div>
              </div>
              <div className={`readme-panel ${readmeOpen?"open":""}`}>
                <div className="readme-content">
                  <h3>👋 Hi, I'm Vahini Chilukamarri</h3>
                  <p>A passionate Computer Science student building intelligent, practical applications at the intersection of AI and full-stack engineering.</p>
                  <h3 style={{marginTop:14}}>🚀 What I Work On</h3>
                  <ul><li>AI/ML systems — LLM evaluation, NLP, computer vision</li><li>Full-stack applications — MERN, FastAPI, React, Node.js</li><li>Data-driven tools — business intelligence, diagnostic support</li></ul>
                  <a href="https://github.com/vahinichilukamarri"target="_blank"rel="noreferrer"style={{display:"inline-flex",alignItems:"center",gap:6,color:"#c4a7e7",fontSize:".82rem",fontFamily:"var(--df)",fontWeight:600,marginTop:8}}onClick={e=>e.stopPropagation()}>Visit GitHub Profile →</a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Projects(){
  return(
    <section className="sec-sep"><div className="sec"id="projects">
      <AnimatedSection><div className="sec-lbl">Work</div><h2 className="sec-title">Selected Projects</h2></AnimatedSection>
      <div className="proj-grid">
        {PROJECTS.map((p,i)=>(
          <AnimatedSection key={p.title}delay={i*.07}>
            <div className="pcard"
              onMouseEnter={e=>{const el=e.currentTarget;el.style.borderColor=p.color+"55";el.style.background="rgba(255,255,255,.05)";el.style.transform="translateY(-4px)";el.style.boxShadow=`0 14px 52px ${p.color}16`;el.querySelector(".gh-ico").style.color=p.color;}}
              onMouseLeave={e=>{const el=e.currentTarget;el.style.borderColor="var(--border)";el.style.background="var(--card)";el.style.transform="none";el.style.boxShadow="none";el.querySelector(".gh-ico").style.color="var(--t3)";}}>
              <div className="pcard-top"style={{background:`linear-gradient(90deg,transparent,${p.color}70,transparent)`}}/>
              <div className="pcard-head">
                <span className="pbadge"style={{color:p.color,background:p.color+"18",border:`1px solid ${p.color}30`}}>{p.badge}</span>
                <a className="gh-ico"href={p.gh}target="_blank"rel="noreferrer"><GithubIcon/></a>
              </div>
              {p.db&&<div className="db-badge"><div className="db-dot"/>MongoDB Connected</div>}
              <div className="ptitle">{p.title}</div><div className="psub">{p.sub}</div>
              <div className="pdesc">{p.desc}</div>
              <ul className="phl">{p.hl.map(h=><li key={h}><span style={{color:p.color,flexShrink:0,marginTop:2}}>›</span>{h}</li>)}</ul>
              <div className="pstack">{p.stack.map(s=><span key={s}className="tag">{s}</span>)}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div></section>
  );
}

function Skills(){
  return(
    <section className="sec-sep"><div className="sec"id="skills">
      <AnimatedSection><div className="sec-lbl">Expertise</div><h2 className="sec-title">Technical Skills</h2></AnimatedSection>
      <div className="skill-grid">
        {SKILLS.map((s,i)=>(
          <AnimatedSection key={s.cat}delay={i*.06}>
            <div className="scard"
              onMouseEnter={e=>{e.currentTarget.style.borderColor=s.color+"55";e.currentTarget.style.background="var(--card-h)";e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="var(--card)";e.currentTarget.style.transform="none";}}>
              <div className="scard-top"style={{background:`linear-gradient(90deg,transparent,${s.color}60,transparent)`}}/>
              <div className="scard-head"><span className="sico"style={{color:s.color}}>{s.ico}</span><span className="sname">{s.cat}</span></div>
              <div className="pills">{s.items.map(it=><span key={it}className="pill"style={{color:s.color,background:s.color+"12",border:`1px solid ${s.color}2e`}}>{it}</span>)}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div></section>
  );
}

function Achievements(){
  return(
    <section className="sec-sep"><div className="sec"id="achievements">
      <AnimatedSection><div className="sec-lbl">Recognition</div><h2 className="sec-title">Certifications &<br/>Achievements</h2></AnimatedSection>
      <AnimatedSection delay={0.1}className="ach-grid">
        <div>
          <div className="ach-st">Certifications</div>
          <div className="ach-list">{CERTS.map(c=>(
            <div key={c.title}className="aitem"onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color+"60";e.currentTarget.style.transform="translateX(4px)";}}onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none";}}>
              <div className="aico"style={{background:c.color+"18"}}>{c.ico}</div>
              <div><div className="atitle">{c.title}</div><div className="adesc">{c.org}</div></div>
            </div>
          ))}</div>
        </div>
        <div>
          <div className="ach-st">Achievements</div>
          <div className="ach-list">{ACHS.map(a=>(
            <div key={a.title}className="aitem"onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color+"60";e.currentTarget.style.transform="translateX(4px)";}}onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none";}}>
              <div className="aico"style={{background:a.color+"18"}}>{a.ico}</div>
              <div><div className="atitle">{a.title}</div><div className="adesc">{a.desc}</div></div>
            </div>
          ))}</div>
        </div>
      </AnimatedSection>
    </div></section>
  );
}

function Contact(){
  const[msg,setMsg]=useState({text:"",type:""});
  const handleForm=e=>{
    e.preventDefault();
    const n=e.target.fn.value.trim(),em=e.target.fe.value.trim(),m=e.target.fm.value.trim();
    if(!n||!em||!m){setMsg({text:"Please fill in all fields.",type:"err"});return;}
    setMsg({text:"✓ Message received! I'll get back to you soon.",type:"ok"});
    e.target.reset();setTimeout(()=>setMsg({text:"",type:""}),4500);
  };
  return(
    <section className="sec-sep"><div className="sec"id="contact">
      <AnimatedSection><div className="sec-lbl">Let's Talk</div><h2 className="sec-title">Get In Touch</h2></AnimatedSection>
      <div className="contact-grid">
        <AnimatedSection delay={0.1}className="cinfo">
          <p>I'm currently looking for Software Engineering or AI/ML internship opportunities. If you'd like to work together or just say hi, reach out.</p>
          <div className="clist">
            {[{ico:"✉",lbl:"Email",val:"vahinivenkatac@gmail.com",href:"mailto:vahinivenkatac@gmail.com"},{ico:"⌥",lbl:"GitHub",val:"github.com/vahinichilukamarri",href:"https://github.com/vahinichilukamarri"},{ico:"◈",lbl:"LinkedIn",val:"linkedin.com/in/vahini",href:"https://linkedin.com/in/vahini"},{ico:"◎",lbl:"Location",val:"Hyderabad, India",href:null},{ico:"📞",lbl:"Phone",val:"+91 8790261823",href:null}].map(c=>(
              <div key={c.lbl}className="citem"onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border-h)";e.currentTarget.style.transform="translateX(4px)";}}onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none";}}>
                <span className="c-ico">{c.ico}</span>
                <div><div className="c-lbl">{c.lbl}</div>{c.href?<a className="c-val"href={c.href}target={c.href.startsWith("http")?"_blank":undefined}rel="noreferrer">{c.val}</a>:<span className="c-val">{c.val}</span>}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.2}className="cform-wrap">
          <form onSubmit={handleForm}>
            <div className="frow">
              <div className="fg"style={{marginBottom:0}}><label>Name</label><input name="fn"placeholder="Your name"/></div>
              <div className="fg"style={{marginBottom:0}}><label>Email</label><input name="fe"type="email"placeholder="your@email.com"/></div>
            </div>
            <div className="fg"><label>Message</label><textarea name="fm"rows="5"placeholder="Tell me about your project or opportunity..."/></div>
            {msg.text&&<div className={`fmsg ${msg.type}`}>{msg.text}</div>}
            <button type="submit"className="btn-p"style={{marginTop:10,width:"100%"}}>Send Message →</button>
          </form>
        </AnimatedSection>
      </div>
    </div></section>
  );
}

function Footer(){
  return(
    <footer>
      <span className="nav-logo">VC.</span>
      <p className="fcopy">© 2025 Venkata Vahini Chilukamarri · Built with ♥</p>
      <div className="flinks">
        <a href="https://github.com/vahinichilukamarri"target="_blank"rel="noreferrer">GitHub</a>
        <a href="https://linkedin.com/in/vahini"target="_blank"rel="noreferrer">LinkedIn</a>
        <a href="mailto:vahinivenkatac@gmail.com">Email</a>
      </div>
    </footer>
  );
}

export default function App(){
  return(
    <>
      <NebulaBackground/>
      <CursorFX/>
      <Nav/>
      <Hero/>
      <About/>
      <Featured/>
      <Projects/>
      <Skills/>
      <Achievements/>
      <Contact/>
      <Footer/>
    </>
  );
}