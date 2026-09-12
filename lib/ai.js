import { createClient } from "@/lib/supabase/server";
function clean(t){
  let s=(t??"").replace(/<\|[^|]*\|>/g,"");
  // buang blok thinking Qwen yang tertutup; kalau tidak tertutup, buang dari <think> sampai baris meta terakhir
  if(/<\/think>/i.test(s)) s=s.replace(/<think>[\s\S]*?<\/think>/gi,"");
  else if(/<think>/i.test(s)){const i=s.search(/<think>/i);const tail=s.slice(i);const m=tail.match(/(\n\s*\n|^)(Halo|Hai|Terima kasih|Baik|Sore|Pagi|Siang|Malam|Saya|Hmm)/);s=(m?s.slice(i+m.index):s.slice(0,i)).trim()||s.slice(0,i).trim();}
  s=s.split("\n").map(l=>l.replace(/^\s*(\*\*|__)?(role|facts?|riwayat|aturan|transcript|system|output)\b.*$/i,"").trimEnd()).join("\n");
  // ambil paragraf terakhir yang terlihat seperti balasan chat (bukan list/header/meta)
  const paras=s.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
  const looksDraft=p=>p.length>=3 && p.length<=400 && !/^(here'?s|analyze|langkah|\d+\.|[-*#>|-]|\*\*|role\b|facts?\b|output only|no prefixes|write one)/i.test(p) && !p.includes("ESCALATE") && /[a-zA-Z\u00C0-\u024F]{2,}/.test(p);
  const drafts=paras.filter(looksDraft);
  if(drafts.length) s=drafts[drafts.length-1];
  return s.replace(/^\s*["“']|["”']\s*$/g,"").trim().slice(0,500);
}
const PROVIDERS=[
 {name:"groq",url:"https://api.groq.com/openai/v1/chat/completions",key:"GROQ_API_KEY",model:process.env.GROQ_MODEL||"llama-3.3-70b-versatile",header:"Bearer",field:"max_tokens"},
 {name:"cerebras",url:"https://api.cerebras.ai/v1/chat/completions",key:"CEREBRAS_API_KEY",model:process.env.CEREBRAS_MODEL||"qwen-3-235b",header:"Bearer",field:"max_tokens"},
 {name:"nvidia",url:"https://integrate.api.nvidia.com/v1/chat/completions",key:"NVIDIA_API_KEY",model:process.env.NVIDIA_MODEL||"nvidia/nemotron-3-nano-30b-a3b",header:"Bearer",field:"max_tokens"},
 {name:"bytez",url:"https://api.bytez.com/models/v2/openai/v1/chat/completions",key:"BYTEZ_API_KEY",model:process.env.BYTEZ_MODEL||"Qwen/Qwen3-4B",header:"Key",field:"max_completion_tokens"},
];
const GEMINI_URL="https://generativelanguage.googleapis.com/v1beta/models/"+(process.env.GEMINI_MODEL||"gemini-flash-lite-latest")+":generateContent";
export function aiProvider(){for(const p of PROVIDERS)if(process.env[p.key])return p.name;if(process.env.GEMINI_API_KEY)return"gemini";return null;}
export function aiConfigured(){return !!aiProvider();}
async function callOpenAICompatible(p,sys,usr){
  const body={model:p.model,messages:[{role:"system",content:sys},{role:"user",content:usr}],[p.field]:400,temperature:0.4};
  // Qwen/reasoning model: sembunyikan chain-of-thought agar draf tidak kepotong (field sesuai provider)
  if(p.name==="groq"){body.reasoning_format="hidden";body.reasoning_effort="none";}
  if(p.name==="cerebras"){body.reasoning_effort="none";}
  const res=await fetch(p.url,{method:"POST",headers:{Authorization:`${p.header} ${process.env[p.key]}`,"Content-Type":"application/json"},body:JSON.stringify(body)});
 const j=await res.json().catch(()=>({})); if(!res.ok) throw new Error(`${p.name} ${res.status}: ${j?.error?.message||j?.error||j?.detail||"unknown"}`); return clean(j?.choices?.[0]?.message?.content);
}
async function callGemini(sys,usr){
 const res=await fetch(GEMINI_URL,{method:"POST",headers:{"Content-Type":"application/json","X-goog-api-key":process.env.GEMINI_API_KEY},body:JSON.stringify({contents:[{parts:[{text:usr}]}],systemInstruction:{parts:[{text:sys}]},generationConfig:{temperature:0.4,maxOutputTokens:220}})});
 const j=await res.json().catch(()=>({})); if(!res.ok) throw new Error(`Gemini ${res.status}`); return clean((j?.candidates?.[0]?.content?.parts||[]).map(p=>p.text).filter(Boolean).join("\n"));
}
export async function callLLM(sys,usr){
 let last; for(const p of PROVIDERS){ if(!process.env[p.key])continue; try{return await callOpenAICompatible(p,sys,usr);}catch(e){last=e;}}
 if(process.env.GEMINI_API_KEY){try{return await callGemini(sys,usr);}catch(e){last=e;}}
 throw last??new Error("No AI provider configured");
}
export async function loadConversationContext(conversationId, callerId) {
  const supabase = await createClient();
  const { data: conv } = await supabase.from("conversations").select(`id, owner_id, barista_id, job_post_id, owners ( business_name ), barista_profiles ( full_name, years_of_experience, skills ), job_posts ( title, location, employment_type, description )`).eq("id", conversationId).maybeSingle();
  if (!conv || ![conv.owner_id, conv.barista_id].includes(callerId)) return null;
  const { data: msgs } = await supabase.from("messages").select("sender_id, body, is_ai, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(12);
  const transcript = (msgs ?? []).reverse().map((m) => `${m.sender_id === conv.owner_id ? "PEMILIK" : "BARISTA"}${m.is_ai ? "(via asisten AI)" : ""}: ${m.body}`).join("\n");
  return { supabase, conv, callerId, ownerId: conv.owner_id, baristaId: conv.barista_id, facts: [`Lowongan: "${conv.job_posts?.title ?? "-"}"`,`Tipe kerja: ${conv.job_posts?.employment_type ?? "-"}`,`Lokasi: ${conv.job_posts?.location ?? "-"}`,`Deskripsi lowongan: ${conv.job_posts?.description || "(kosong)"}`,`Usaha: ${conv.owners?.business_name ?? "-"}`,`Barista pelamar: ${conv.barista_profiles?.full_name ?? "-"} (${conv.barista_profiles?.years_of_experience ?? 0} th pengalaman, skill: ${(conv.barista_profiles?.skills ?? []).join(", ") || "-"})`].join("\n"), transcript: transcript || "(belum ada pesan)" };
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
