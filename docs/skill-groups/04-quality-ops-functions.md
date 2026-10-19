# Kualitas + Operasi — Sub-grup Fungsi Spesifik

> Pointer saja. Router: `quality-ops`. Load 1 skill per prompt.

## tulis-tes
- `testing` — generate + eksekusi unit/integrasi/e2e + coverage
- `playwright-expert` — skrip E2E Playwright, page object, fixture, mock API (.opencode)
- `e2e-testing-patterns` — suite E2E andal, debug flaky, standar testing
- `javascript-testing-patterns` — Jest/Vitest/Testing Library + TDD/BDD
- `python-testing-patterns` — pytest + fixture + mock + TDD
- `temporal-python-testing` — tes workflow Temporal + time-skipping
- `bats-testing-patterns` — tes skrip shell via Bats

## debug-perbaiki
- `debugging-workflow` — alur sistematis error build/runtime/RLS/Vercel (.opencode)
- `debugging` — diagnosa bug multi-bahasa via stack trace/log
- `debugging-strategies` — profiling + root cause analysis
- `n8n-debugging-official` — debug workflow n8n yang error/tak sesuai

## review-rapikan
- `code-review` — review file/PR: bug, vuln, perf, style
- `code-review-excellence` — standar review + mentoring tim
- `tidy` — review diff + gate tes + simplifikasi scoping diff
- `refactoring` — code smell + pola refactor aman
- `test-audit` — pangkas tes low-value se-suite tanpa turun coverage
- `pr-babysitter` — jaga PR: CI merah, konflik, review thread
- `pr-creator` — buat/update PR: judul, body, link issue, draft

## ci-cd-cepat
- `ci-speedup` — pangkas pipeline lambat via critical path + sharding
- `ci-cd` — setup pipeline build/test/deploy multi-env
- `github-actions-templates` — workflow Actions production-ready
- `gitlab-ci-patterns` — pipeline multi-stage + cache + runner
- `deployment-pipeline-design` — approval gate + security check + GitOps
- `gitops-workflow` — ArgoCD/Flux + rekonsiliasi deklaratif
- `scaffold-cli` — scaffold CLI TS + publish npm

## git-versi
- `git-advanced-workflows` — rebase, cherry-pick, bisect, worktree, reflog
- `version-control` — branching, commit hygiene, konflik, PR, hooks

## container-orkestrasi
- `docker-compose-setup` — multi-container: service, network, volume
- `kubernetes-deployment` — deploy/scale app di cluster
- `k8s-manifest-generator` — manifest Deployment/Service/ConfigMap/Secret
- `k8s-security-policies` — NetworkPolicy + RBAC + pod security
- `kubernetes-specialist` — manifest, debug crash, rightsize (.opencode)
- `helm-chart-scaffolding` — chart Helm reusable + templating

## infra-cloud
- `terraform-engineer` — module, state, multi-env (.opencode)
- `terraform-module-library` — module reusable AWS/Azure/GCP
- `infrastructure-as-code` — Terraform/Pulumi/CFN/CDK berversi
- `devops-engineer` — Dockerfile, CI/CD, K8s, runbook insiden (.opencode)
- `chaos-engineer` — eksperimen chaos + game day + rollback (.opencode)
- `cloud-architect` — arsitektur + migrasi + DR (.opencode)

## monitoring-observasi
- `monitoring-expert` — Prometheus/Grafana, log pipeline, tracing, load test (.opencode)
- `sre-engineer` — SLI/SLO, error budget, respons insiden (.opencode)
- `agent-observability` — trace/span/metric/cost dashboard agen
- `agent-evaluation` — evaluasi agen: rubrik, baseline, regression gate
- `cloud-monitoring` — observability metric/log/trace cloud
- `distributed-tracing` — Jaeger/Tempo lintas microservice
- `grafana-dashboards` — dashboard realtime metric sistem
- `prometheus-configuration` — koleksi metric + alerting
- `slo-implementation` — SLI/SLO + error budget + alert

## verifikasi-app
- `app-verification` — harness verifikasi milik produk + doctor CLI
- `browser-devtools-mcp` — screenshot/DOM/Lighthouse/audit browser live

## kualitas-kode-bahasa
- `shellcheck-configuration` — lint shell + portabilitas
- `bash-defensive-patterns` — skrip bash fault-tolerant produksi
- `error-handling-patterns` — exception/Result/graceful degradation
- `python-performance-optimization` — cProfile + memory profiler
- `python-packaging` — struktur paket + publish PyPI
- `monorepo-management` — Turborepo/Nx/pnpm workspace
- `modern-javascript-patterns` — ES6+ async/FP pattern
- `typescript-advanced-types` — generics/conditional/mapped types
- `dependency-upgrade` — upgrade mayor + rollout bertahap + tes
- `database-backup` — backup full/incremental/PITR + verifikasi
- `database-migration` — migrasi zero-downtime + rollback
- `deploy-to-vercel` — deploy + preview link

## tambahan-2026-10-13 (baru diinstall)
- tulis-tes: `k6`, `k6-perf-test-website`, `k6-test-maintenance`, `k6-cloud-investigate-test`, `k6-trend-analysis`, `k6-docs`, `k6-manage` (resmi Grafana) + `pactflow` (contract testing Pact/BDCT + drift OpenAPI)
