# ADR 0001 — Python + FastAPI, vanilla frontend, katmanlı monolit

- Status: Accepted
- Date: 2026-11-09

## Context
Leave Manager, Polsan Teknoloji çalışanları için şirket içi bir izin yönetim sistemidir
(onlarca–birkaç yüz kullanıcı). İlk sürüm dar: talep → tek kademeli yönetici onayı → bakiye.
Bootstrap görüşmesinde ekip stack olarak Python + FastAPI ve sade HTML/CSS/JS istedi. Makinede
Python 3.14, uv ve Node 24 kurulu.

## Decision
Backend Python 3.14 + FastAPI (Pydantic 2, Uvicorn), bağımlılıklar uv ile; frontend framework ve
bundler olmadan statik HTML/CSS/vanilla JS, aynı FastAPI uygulamasından sunulur. Mimari tek
süreçli katmanlı monolit: `domain` (saf) ← `services` (yetki, kilit) ← `api` (HTTP);
`main` composition root. Katman sınırları import-linter ile `scripts/check` içinde zorlanır.

## Consequences
- Kazanılan: tek dil ağırlıklı, build adımı olmayan küçük bir toolchain; iş kuralları saf
  Python'da hızlı unit testlerle kanıtlanır; testler sunucu açmadan process içinde çalışır
  (Resource hygiene kolay).
- Ödenen: frontend için bileşen kütüphanesi ve tip kontrolü yok — DOM kodu elle yazılır, XSS
  sink'leri check adımıyla yasaklanır; UI durum testleri için yine de Node + jsdom gerekir
  (yalnızca test bağımlılığı). Ekipte .NET/SQL Server kurulumu olmasına rağmen kullanılmıyor.

## Alternatives considered
- **ASP.NET Core (.NET 10) + React + SQL Server** — makinede kurulu, olgun; ekip Python'u tercih etti.
- **ASP.NET Core + Blazor** — tek toolchain; aynı nedenle seçilmedi.
- **Jinja2 ile sunucu tarafı render** — Node'suz test; ekip JS ile çalışan arayüz istedi.

## Revisit triggers
- Ekranlar ve etkileşim, vanilla JS'in bakımını zorlaştıracak kadar büyürse (framework kararı).
- Dışa açık API veya ikinci bir istemci (mobil) gerekirse.
