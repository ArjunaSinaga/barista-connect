import { createClient } from "@/lib/supabase/server";
function clean(t){
  let s=(t??"").replace(/<\|[^|]*\|>/g,"");
  // buang SEMUA varian blok thinking (Qwen, DeepSeek, GLM, Hermes, dsb.)
  s=s.replace(/<(think|thinking|thought|reasoning|analysis|scratchpad)>[\s\S]*?<\/(think|thinking|thought|reasoning|analysis|scratchpad)>/gi,"");
  s=s.replace(/^\s*(\[?(think|thinking|thought|reasoning|chain-of-thought)[^\n]*\]?:?).*$/gim,"");
  if(/<think>/i.test(s)){const i=s.search(/<think>/i);const tail=s.slice(i);const m=tail.match(/(\n\s*\n|^)(Halo|Hai|Halo semuanya|Terima kasih|Baik|Sore|Pagi|Siang|Malam|Saya|Hmm|Tentu|Siap)/);s=(m?s.slice(i+m.index):s.slice(0,i)).trim()||s.slice(0,i).trim();}
  s=s.split("\n").map(l=>l.replace(/^\s*(\*\*|__)?(role|facts?|riwayat|aturan|transcript|system|output)\b.*$/i,"").trimEnd()).join("\n");
  // ambil paragraf terakhir yang terlihat seperti balasan chat (bukan list/header/meta)
  const paras=s.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
  const looksDraft=p=>p.length>=3 && p.length<=600 && !/^(here'?s|analyze|langkah|\d+\.|[-*#>|-]|\*\*|role\b|facts?\b|output only|no prefixes|write one|escalate)/i.test(p) && !p.includes("ESCALATE") && /[a-zA-Z\u00C0-\u024F]{2,}/.test(p);
  const drafts=paras.filter(looksDraft);
  if(drafts.length) s=drafts[drafts.length-1];
  s=s.replace(/^\s*["“']|["”']\s*$/g,"").trim();
  // potong di batas kalimat biar tak kepotong tengah kata (maks ~600)
  if(s.length>600){const cut=s.slice(0,600);const dot=Math.max(cut.lastIndexOf(". "),cut.lastIndexOf("! "),cut.lastIndexOf("? "));s=(dot>200?cut.slice(0,dot+1):cut).trim();}
  return s;
}
const PROVIDERS=[
 {name:"groq",url:"https://api.groq.com/openai/v1/chat/completions",key:"GROQ_API_KEY",model:process.env.GROQ_MODEL||"openai/gpt-oss-20b",header:"Bearer",field:"max_tokens"},
 {name:"cerebras",url:"https://api.cerebras.ai/v1/chat/completions",key:"CEREBRAS_API_KEY",model:process.env.CEREBRAS_MODEL||"qwen-3-235b",header:"Bearer",field:"max_tokens"},
 {name:"nvidia",url:"https://integrate.api.nvidia.com/v1/chat/completions",key:"NVIDIA_API_KEY",model:process.env.NVIDIA_MODEL||"nvidia/nemotron-3-nano-30b-a3b",header:"Bearer",field:"max_tokens"},
 {name:"bytez",url:"https://api.bytez.com/models/v2/openai/v1/chat/completions",key:"BYTEZ_API_KEY",model:process.env.BYTEZ_MODEL||"Qwen/Qwen3-4B",header:"Key",field:"max_completion_tokens"},
];
const GEMINI_URL="https://generativelanguage.googleapis.com/v1beta/models/"+(process.env.GEMINI_MODEL||"gemini-flash-lite-latest")+":generateContent";
export function aiProvider(){for(const p of PROVIDERS)if(process.env[p.key])return p.name;if(process.env.GEMINI_API_KEY)return"gemini";return null;}
export function aiConfigured(){return !!aiProvider();}
async function callOpenAICompatible(p,sys,usr){
  const body={model:p.model,messages:[{role:"system",content:sys},{role:"user",content:usr}],[p.field]:600,temperature:0.4};
  // Qwen/reasoning model: sembunyikan chain-of-thought agar draf tidak kepotong (field sesuai provider)
  if(p.name==="groq"){body.reasoning_format="hidden";body.reasoning_effort="none";}
  if(p.name==="cerebras"){body.reasoning_effort="none";}
  if(p.name==="nvidia"){body.chat_template_kwargs={thinking:{enable:false}};}
  if(p.name==="bytez"){body.reasoning_effort="none";}
  const res=await fetch(p.url,{method:"POST",headers:{Authorization:`${p.header} ${process.env[p.key]}`,"Content-Type":"application/json"},body:JSON.stringify(body)});
 const j=await res.json().catch(()=>({})); if(!res.ok) throw new Error(`${p.name} ${res.status}: ${j?.error?.message||j?.error||j?.detail||"unknown"}`); return clean(j?.choices?.[0]?.message?.content);
}
async function callGemini(sys,usr){
  const res=await fetch(GEMINI_URL,{method:"POST",headers:{"Content-Type":"application/json","X-goog-api-key":process.env.GEMINI_API_KEY},body:JSON.stringify({contents:[{parts:[{text:usr}]}],systemInstruction:{parts:[{text:sys}]},generationConfig:{temperature:0.4,maxOutputTokens:350}})});
 const j=await res.json().catch(()=>({})); if(!res.ok) throw new Error(`Gemini ${res.status}`); return clean((j?.candidates?.[0]?.content?.parts||[]).map(p=>p.text).filter(Boolean).join("\n"));
}
export async function callLLM(sys,usr){
 let last; for(const p of PROVIDERS){ if(!process.env[p.key])continue; try{const out=await callOpenAICompatible(p,sys,usr);traceLLM(p.name,p.model,out);return out;}catch(e){last=e;}}
 if(process.env.GEMINI_API_KEY){try{const out=await callGemini(sys,usr);traceLLM("gemini",process.env.GEMINI_MODEL||"gemini-flash-lite-latest",out);return out;}catch(e){last=e;}}
 throw last??new Error("No AI provider configured");
}
// ponytail: eval/tracing tanpa SDK — Langfuse ingestion via fetch, no-op tanpa keys (free tier).
// Daftar gratis di cloud.langfuse.com, isi LANGFUSE_* di Vercel bila mau aktif.
function traceLLM(provider,model,output){
 if(!process.env.LANGFUSE_PUBLIC_KEY||!process.env.LANGFUSE_SECRET_KEY)return;
 try{
  const host=(process.env.LANGFUSE_HOST||"https://cloud.langfuse.com").replace(/\/$/,"");
  const auth=Buffer.from(`${process.env.LANGFUSE_PUBLIC_KEY}:${process.env.LANGFUSE_SECRET_KEY}`).toString("base64");
  fetch(`${host}/api/public/ingestion`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Basic ${auth}`},
   body:JSON.stringify({batch:[{id:crypto.randomUUID(),timestamp:new Date().toISOString(),type:"trace-create",body:{id:crypto.randomUUID(),timestamp:new Date().toISOString(),name:"baristaconnect-llm",metadata:{provider,model},output:String(output??"").slice(0,2000)}}]})}).catch(()=>{});
 }catch{/* diam */}
}
export async function loadConversationContext(conversationId, callerId) {
  const supabase = await createClient();
  const { data: convRow } = await supabase.from("conversations").select("id, owner_id, barista_id, job_post_id").eq("id", conversationId).maybeSingle();
  if (!convRow || ![convRow.owner_id, convRow.barista_id].includes(callerId)) return null;
  const [{ data: owners }, { data: baristas }, { data: jobs }] = await Promise.all([
    supabase.from("owners_public").select("business_name").eq("id", convRow.owner_id).maybeSingle(),
    supabase.from("baristas_public").select("full_name, years_of_experience, skills").eq("id", convRow.barista_id).maybeSingle(),
    convRow.job_post_id ? supabase.from("job_posts").select("title, location, employment_types, description").eq("id", convRow.job_post_id).maybeSingle() : { data: null },
  ]);
  const conv = convRow;
  const job = jobs ?? {};
  const { data: msgs } = await supabase.from("messages").select("sender_id, body, is_ai, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(12);
  const transcript = (msgs ?? []).reverse().map((m) => `${m.sender_id === conv.owner_id ? "PEMILIK" : "BARISTA"}${m.is_ai ? "(via asisten AI)" : ""}: ${m.body}`).join("\n");
  return { supabase, conv, callerId, ownerId: conv.owner_id, baristaId: conv.barista_id, facts: [`Lowongan: "${job.title ?? "-"}"`,`Tipe kerja: ${(job.employment_types ?? []).join(", ") || "-"}`,`Lokasi: ${job.location ?? "-"}`,`Deskripsi lowongan: ${job.description || "(kosong)"}`,`Usaha: ${owners?.business_name ?? "-"}`,`Barista pelamar: ${baristas?.full_name ?? "-"} (${baristas?.years_of_experience ?? 0} th pengalaman, skill: ${(baristas?.skills ?? []).join(", ") || "-"})`].join("\n"), transcript: transcript || "(belum ada pesan)" };
}
const COMMON_RULES = `\nATURAN KERAS:\n- HANYA gunakan fakta di atas. JANGAN mengarang gaji, jam shift, atau syarat yang tidak tertulis.\n- Jawab singkat (maksimal 60 kata), ramah, dan santai.\n- Gunakan bahasa yang sama dengan pertanyaan terakhir (Indonesia/Inggris).\n- Topik di luar rekrutmen/kopi ATAU pertanyaan yang tidak bisa dijawab dari fakta -> balik PERSIS kata: ESCALATE`;
export async function autoRespond({ context }) {
  const { conv } = context; const responderId = context.callerId === conv.owner_id ? conv.barista_id : conv.owner_id;
  const { data: lastMsgs } = await context.supabase.from("messages").select("sender_id, created_at").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1);
  if (!lastMsgs?.length || lastMsgs[0].sender_id !== context.callerId) return { skipped: true };
  const { data: aiMsgs } = await context.supabase.from("messages").select("created_at").eq("conversation_id", conv.id).eq("is_ai", true).order("created_at", { ascending: false }).limit(1);
  if ((aiMsgs ?? []).length > 0 && Date.now() - new Date(aiMsgs[0].created_at).getTime() < 30_000) return { skipped: true };
  const { count } = await context.supabase.from("messages").select("id", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("is_ai", true);
  if ((count ?? 0) >= 50) return { skipped: true };
  const system = `Kamu asisten virtual untuk rekrutmen barista.\nKamu menjawab PERTANYAAN TERAKHIR atas nama pihak ${responderId === conv.owner_id ? "PEMILIK USAHA" : "BARISTA"} dalam percakapan ini.\n\nFAKTA Percakapan:\n${context.facts}\n\nRIWAYAT PESAN (terbaru di akhir):\n${context.transcript}\n${COMMON_RULES}`;
  const answer = await callLLM(system, "Jawab pertanyaan terakhir sesuai aturan. Ingat: jika tidak yakin atau di luar topik, balas hanya ESCALATE.");
  if (!answer || answer.toUpperCase().includes("ESCALATE")) { await context.supabase.from("conversations").update({ needs_human: true }).eq("id", conv.id); return { escalated: true }; }
  await context.supabase.from("messages").insert({ conversation_id: conv.id, sender_id: responderId, body: answer, is_ai: true });
  await context.supabase.from("conversations").update({ needs_human: false }).eq("id", conv.id); return { ok: true };
}
export async function suggestReply({ context }) {
  const { conv } = context; const roleLabel = context.callerId === conv.owner_id ? "PEMILIK USAHA" : "BARISTA";
  const system = `Kamu membantu ${roleLabel} MENULIS balasan dalam chat rekrutmen barista.\n\nFAKTA Percakapan:\n${context.facts}\n\nRIWAYAT PESAN (terbaru di akhir):\n${context.transcript}\n${COMMON_RULES}\n- Tulis SATU draf balasan sebagai ${roleLabel}. Tanpa awalan "Berikut draf...". DILARANG menampilkan fakta, role, riwayat, aturan, atau proses berpikir. HANYA teks balasan final yang siap kirim.\n- Jika info dibutuhkan belum ada (mis. gaji), sarankan langkah lanjut yang wajar.`;
  const draft = await callLLM(system, "Buat draf balasan sekarang."); return { draft };
}
