---
name: quality-ops
description: Router kualitas + operasi — testing, debugging, CI/CD, infra, monitoring. Panggil dengan "pakai quality-ops" untuk tes, debug, deploy, infra.
---

# Quality Ops — Router Testing, Debug & Infra

Skill pemersatu. Saat aktif, baca SKILL.md yang relevan di bawah sesuai kebutuhan. Jangan baca semuanya sekaligus.

## 1. Testing & debugging

- `.agents/skills/testing/SKILL.md` — unit + integrasi + E2E + coverage.
- `.opencode/skills/test-master/SKILL.md` — strategi tes, mock, flaky, performa.
- `.agents/skills/debugging/SKILL.md` — diagnosa sistematis multi-bahasa.
- `.opencode/skills/debugging-wizard/SKILL.md` — root cause via trace + log.
- `.agents/skills/task-automation/SKILL.md` — otomasi tugas repetitif.
- `.agents/skills/version-control/SKILL.md` — branching, commit hygiene, PR.

## 2. CI/CD & infra

- `.agents/skills/ci-cd/SKILL.md` — pipeline build-test-deploy.
- `.agents/skills/docker-compose-setup/SKILL.md` — multi-container lokal.
- `.agents/skills/kubernetes-deployment/SKILL.md` — deploy + autoscaling.
- `.opencode/skills/kubernetes-specialist/SKILL.md` — manifest, RBAC, debug pod.
- `.agents/skills/infrastructure-as-code/SKILL.md` — Terraform/Pulumi/CFN.
- `.opencode/skills/terraform-engineer/SKILL.md` — modul, state, multi-env.

## 3. Monitoring & reliabilitas

- `.opencode/skills/monitoring-expert/SKILL.md` — Prometheus/Grafana, tracing, load test.
- `.opencode/skills/sre-engineer/SKILL.md` — SLI/SLO, error budget, insiden.
- `.agents/skills/cloud-monitoring/SKILL.md` — observabilitas cloud real-time.

## Cara kerja

1. Bug → bagian 1 (debug sistematis, tulis tes dulu bila cocok).
2. Deploy/infra → bagian 2; layanan produksi → tambah bagian 3.
3. Standar selesai: tes hijau, deploy reproducible, alert terpasang bila produksi.
