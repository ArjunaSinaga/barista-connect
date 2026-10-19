# Keamanan — Sub-grup Fungsi Spesifik

> Pointer saja. Defensif = milik sendiri/otorisasi. Ofensif (offensive-*) HANYA bila user minta eksplisit + target sah. Ambigu → tanya dulu.

## strategi-awal (mulai sesi)
- `bb-methodology` — orkestrator 5-fase + kapan pindah fase
- `recon-scope-triage` — pilah aset asli vs noise sebelum testing
- `redteam-mindset` — disiplin operator red-team, koreksi mindset defensif
- `hunt-dispatch` — fingerprint target + pilih skill serangan yang pas
- `osint-methodology` — pipeline OSINT 5 tahap + 29 tipe aset

## recon-pengintaian
- `web2-recon` — subdomain enum, live host, crawl, fuzz direktori, JS
- `supply-chain-attack-recon` — squat kandidat, dependency-confusion, CI exposure (recon SAJA)
- `hunt-subdomain` — subdomain takeover (Azure, Zendesk, Vercel, Fastly, S3)
- `hunt-source-leak` — source map, Swagger JSON, .env/.git, build-info
- `hunt-tls-network` — HSTS, cipher lemah, DMARC spoofable, AXFR, CNAME gantung
- `hunt-ntlm-info` — disclosure NTLM Type-2 (domain, forest, hostname)
- `webhook-setup` — receiver webhook + verifikasi signature (defensif)

## bug-bounty-langsung
- `bug-bounty` — workflow lengkap + bypass table + grep per bahasa
- `bb-local-toolkit` — varian + path install tool lokal (ffuf, dalfox, ghauri)
- `bug-reaper` — finder + penulis laporan multi-platform
- `dast-nuclei` — scan template Nuclei: CVE, OWASP Top 10, misconfig
- `penetration-testing-with-strix` — pentest otonom + PoC tereksploitasi
- `dynamic-application-security-testing` — DAST probing + fuzzing app jalan
- `mid-engagement-ir-detection` — deteksi tambalan SOC/aktivitas penyerang saat sesi jalan

## injeksi-server
- `hunt-sqli` — SQLi modern (ORM raw-fragment, GraphQL blind, OIDC-proxy)
- `hunt-nosqli` — Mongo operator injection, Redis, auth bypass NoSQL
- `hunt-ssti` — SSTI Jinja2/Twig/Freemarker/ERB → RCE
- `hunt-xxe` — XXE SVG/Office/SOAP/SAML, blind OOB DTD
- `hunt-ldap` — LDAP/XPath injection + enumerasi AD
- `hunt-deserialization` — ysoserial/phpggc/pickle/ViewState/Ruby Marshal
- `hunt-rce` — RCE umum (67 laporan)
- `hunt-lfi` — LFI/RFI/traversal + PHP filter-chain RCE + log poisoning

## xss-client-side
- `hunt-xss` — XSS (174 laporan)
- `hunt-html-injection` — injeksi HTML tanpa eksekusi JS (naik ke xss bila eksekusi)
- `hunt-dom` — DOM clobbering, postMessage hijack, CSS exfil, dangerouslySetInnerHTML
- `hunt-clickjacking` — UI redressing + bukti framing browser nyata

## auth-session
- `hunt-auth-bypass` — SAML XSW, JWT alg-confusion, XMLRPC bypass SSO
- `hunt-jwt-crypto` — forging JWT: alg:none, key-confusion, kid/jku
- `hunt-session` — fixation, invalidasi, refresh-token rotation, cookie attr
- `hunt-ato` — 9 jalur ATO + chain (reset flaw, OAuth CSRF, JWT, SSO takeover)
- `hunt-forgot-password` — enumerasi user, token di body, replay token
- `hunt-mfa-bypass` — 7 pola (skip step, replay OTP, brute 6-digit, race)
- `hunt-brute-force` — rate limit lemah, stuffing, oracle enumerasi, ReDoS
- `hunt-captcha-bypass` — 6 pola (field dihapus, token replay, static value)
- `hunt-oauth` — OAuth (19 laporan)
- `hunt-saml` — XSW, comment injection NameID, stripping, replay
- `hunt-open-redirect` — redirect + chain ke OAuth theft/ATO

## api-web
- `hunt-api-misconfig` — mass assignment, prototype pollution, verb tampering
- `hunt-graphql` — IDOR node(), mutation IDOR, batching-DoS, cost-bypass
- `hunt-fintech-graphql` — mutasi gerak-duit, double-spend, KYC gap
- `hunt-grpc` — reflection, metadata-strip, transcoding injection, Rapid Reset DoS
- `hunt-websocket` — CSWSH, validasi Origin, namespace/room bypass
- `hunt-cors` — origin-reflection + bukti baca kredensial di browser
- `hunt-csrf` — CSRF modern (SameSite-Lax bypass, GraphQL-via-GET, CSWSH)
- `hunt-ssrf` — metadata SSRF AWS/GCP/Azure, rebinding, gopher→Redis, PDF chain
- `hunt-host-header` — reset poisoning, cache poisoning, routing SSRF, OAuth issuer
- `hunt-cache-poison` — WCD, X-Forwarded-Host, armor bypass, session deception
- `hunt-http-smuggling` — CL.TE/TE.CL/H2.CL + chain cache/credential
- `hunt-file-upload` — webshell, SVG XSS, XXE DOCX, ZIP slip, 10 bypass
- `hunt-race-condition` — coupon double-redeem, OTP race, single-packet attack
- `hunt-business-logic` — quantity negatif, decimal overflow, checkout trust
- `hunt-exceptional-conditions` — input malformed → fail-open/stack-trace leak
- `hunt-misc` — lain-lain (225 laporan)

## framework-spesifik
- `hunt-nextjs` — Server Actions RCE, middleware bypass, ISR poisoning, image SSRF
- `hunt-nodejs` — prototype pollution→RCE, trust proxy, SSTI EJS/Pug
- `hunt-laravel` — APP_DEBUG leak, Telescope, Ignition RCE, .env exposure
- `hunt-springboot` — Actuator heapdump/env, SpEL, H2 console, Spring4Shell
- `hunt-aspnet` — ViewState, machineKey, trace.axd/elmah, Webforms
- `hunt-sharepoint` — ToolShell chain, SOAP bypass, NTLM disclosure, farm EoL

## llm-ai-attack
- `hunt-llm-ai` — prompt injection, indirect injection, ASCII smuggling, exfil via tool
- `hunt-rag-vector` — poisoning korpus persisten, vector-DB IDOR, retrieval-hijack
- `prompt-injection-defense` — hardening agen/RAG: isolasi konten, batasi tool (defensif)

## cloud-identity
- `cloud-iam-deep` — STS chaining, IMDS via SSRF, Cognito unauth role, SA token
- `hunt-cloud-misconfig` — S3/GCS/Blob publik, Lambda URL, snapshot, secret di bundle
- `hunt-k8s` — kubelet exec, etcd unauth, docker.sock escape, SA abuse
- `m365-entra-attack` — spray, lockout math, CA bypass, ROPC, SAML flow
- `okta-attack` — enumerasi user, fatigue push, OIDC redirect tampering
- `enterprise-vpn-attack` — Cisco/Fortinet/Citrix/PaloAlto/Ivanti CVE + fingerprint
- `vmware-vcenter-attack` — vCenter CVE chain + SSO disclosure (internet-facing saja)

## infra-jaringan-nirkabel
- `offensive-network-attacks` — ARP spoof, LLMNR/mDNS poison, VLAN hop, DHCP, IPv6
- `offensive-wifi` — metodologi 802.11 umum
- `offensive-wifi-recon` — mapping airspace 2.4/5/6GHz + war-driving
- `offensive-wpa2-psk` — handshake capture, PMKID, hashcat hc22000
- `offensive-wpa3-sae` — downgrade transition-mode, Dragonblood
- `offensive-wpa-enterprise` — evil-twin RADIUS, MSCHAPv2 crack, cert theft
- `offensive-wps` — Pixie Dust + brute PIN
- `offensive-evil-twin` — KARMA/Mana AP + captive portal
- `offensive-deauth-disassoc` — deauth terarah + handshake capture
- `offensive-krack-fragattacks` — KRACK/FragAttacks (legacy/unpatched)
- `offensive-bluetooth-ble` — GATT enum, pairing downgrade, sniffing Sniffle
- `offensive-bluetooth-classic` — KNOB, BlueSnarfing, profile abuse
- `offensive-zigbee-thread-matter` — Touchlink abuse, replay, KillerBee
- `offensive-z-wave` — S0 key flaw, replay, hub pivot
- `offensive-lorawan-sub-ghz` — join attack, replay KeeLoq/TPMS, HackRF/Flipper

## post-eksploitasi (milik sendiri/otorisasi)
- `offensive-windows-privesc` — Potatoes, service misconfig, UAC bypass, PrintNightmare
- `offensive-linux-privesc` — SUID/GTFOBins, sudo, cron, DirtyPipe/PwnKit, Docker group
- `offensive-lateral-movement` — PtH/PtT, NTLM relay, WMI/WinRM, pivoting
- `offensive-active-directory` — Kerberoast, ASREP, delegation, DCSync, ADCS ESC1-15
- `offensive-netexec` — NetExec semua protokol AD (nxc)
- `offensive-persistence` — registry Run, scheduled task, WMI, Golden Ticket, cron/systemd
- `offensive-c2-frameworks` — Cobalt/Sliver/Mythic/Havoc/Metasploit + redirector
- `offensive-data-exfiltration` — DNS/HTTPS/ICMP tunnel, dead drop, stego
- `offensive-anti-forensics` — log clearing, timestomp, ADS, C2 terenkripsi
- `offensive-container-escape` — privileged breakout, socket abuse, Leaky Vessels
- `offensive-k8s-attacks` — SA theft, RBAC wildcard, etcd, DaemonSet node-shell
- `offensive-mobile` — Frida, pinning bypass, deep-link, exported component
- `apk-redteam-pipeline` — akuisisi APK → jadx → secret grep → Frida template
- `ios-redteam-pipeline` — IPA → class-dump → ATS/pinning bypass → scheme hijack
- `offensive-iot` — UART/JTAG, flash dump, U-Boot, MQTT/CoAP/Modbus
- `offensive-phishing` — GoPhish, EvilGinx2, QR phishing (izin tertulis wajib)
- `offensive-social-engineering` — pretexting, vishing, smishing, USB drop (izin tertulis)
- `offensive-fuzzing` — AFL++/libFuzzer/Honggfuzz + triage crash
- `offensive-shellcode` — PIC, PEB traversal, AV/EDR evasion
- `offensive-crypto-attacks` — padding oracle, ECB, length extension, RSA, PRNG
- `offensive-tls-attacks` — POODLE/DROWN/FREAK/BEAST/Heartbleed, pinning bypass
- `offensive-deserialization` — gadget chain ysoserial/phpggc, WAF bypass
- `offensive-graphql` — introspection abuse, batching brute, depth bomb, sub hijack
- `offensive-api-abuse` — logic bypass chaining, pagination exfil, JWT manip
- `offensive-api-security` — OWASP API Top 10 + gRPC + WebSocket
- `offensive-business-logic` — workflow bypass, coupon stack, refund abuse
- `offensive-cicd-pipeline` — Actions injection, Jenkins RCE, runner abuse
- `offensive-cicd-secrets` — env extraction, vault misconfig, OIDC abuse, log leak
- `offensive-cloud` — harvesting kredensial, pacu/ScoutSuite, persistensi cloud
- `offensive-dependency-confusion` — npm/PyPI/NuGet/Maven/Go confusion + PoC canary
- `offensive-supply-chain` — typosquat, maintainer takeover, artifact tamper
- `offensive-jwt` — alg confusion, kid injection, JWKS poisoning
- `offensive-ssti` — fingerprint engine + filter bypass + blind RCE
- `offensive-toctou` — symlink race, double-fetch, single-packet amplify
- `offensive-advanced-redteam` — scoping, C2 infra, OPSEC, EDR evasion, debrief

## defensif-audit (aman dipakai kapan saja)
- `secure-ship` — router pre-publish: audit, SAST/DAST, dependensi
- `security-audit` — audit posture luas (app, infra, identity, operasi)
- `security-reviewer` — review kode/infra + laporan severity
- `secure-code-guardian` — implementasi auth/validasi/OWASP Top 10
- `security-scan` — scan config agen via AgentShield
- `sast-configuration` — setup SAST + pipeline CI
- `static-application-security-testing` — analisis kode statis + custom rules
- `dependency-scanning` — SBOM + license compliance
- `threat-modeling` — identifikasi + mitigasi ancaman terstruktur
- `secrets-management` — Vault/Secrets Manager + rotasi CI/CD
- `auth-implementation-patterns` — JWT/OAuth2/session/RBAC
- `oauth-2-0-setup` — flow PKCE/client-credentials/device-code
- `pci-compliance` — PCI DSS data kartu
- `compliance-checklist-generation` — SOC2/HIPAA/GDPR readiness (bukan sertifikasi)
- `privacy-policy-drafting` — draf kebijakan privasi + checklist review
- `terms-of-service-generation` — draf ToS web/SaaS/marketplace
- `eu-ai-act-readiness` — triase kewajiban EU AI Act
- `contract-review` — review kontrak + laporan risiko
- `license-analysis` — kompatibilitas lisensi dependensi
- `skill-supply-chain-audit` — audit skill/plugin pihak ketiga sebelum install
- `human-in-the-loop` — approval gate + eskalasi workflow agen
- `security-arsenal` — payload + bypass table + always-rejected list

## validasi-laporan
- `triage-validation` — 7-Question Gate + 4 gate pra-submit (WAJIB sebelum lapor)
- `report-writing` — template H1/Bugcrowd, tone manusia, CVSS 3.1
- `bugcrowd-reporting` — taktik VRT + rebuttal OOS + override severity
- `offensive-reporting` — laporan red-team klien: exec summary + chain narasi
- `redteam-report-template` — format deliverable red-team eksternal
- `evidence-hygiene` — redaksi cookie/PII, sanitasi HAR, hygiene screenshot

## tambahan-2026-10-13 (baru diinstall)
- `usap-*` (usap-ciso, usap-devsecops, usap-incident-responder, usap-program-manager, usap-alex, usap-red-teamer) — SOC/IR/DevSecOps/blue-team (comot folder response/detection/appsec-devsecops, jangan bulat-bulat)
- `forensics-osquery` (dari SecOpsAgentKit) — forensik insiden via osquery
- `elasticsearch-*` (anomaly-detection, cluster-health, search-relevance) — deteksi anomali + kesehatan klaster untuk SOC
