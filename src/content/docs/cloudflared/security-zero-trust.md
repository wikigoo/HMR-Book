---
title: Cloudflare Zero Trust Setup
description: How to protect internal HMR documentation and staging environments using Cloudflare Access.
---

# Security & Access Control

To maintain confidentiality, internal HMR dashboards and employee documentation hubs must be shielded from public internet access using **Cloudflare Access (Zero Trust)**.

## Authentication Policy
1. **Protected Domain:** `docs.hmrbot.com` (and `srv.hmrbot.com`).
2. **Identity Provider (IdP):** Google Workspace / Approved Employee Email IDs.
3. **Session Duration:** 24 Hours.

## Local Development Tunnel
When configuring local services with Cloudflare Tunnel (`cloudflared`), ensure the daemon is run with standard restricted permissions:

```bash
cloudflared tunnel run --token <CLOUDFLARE_TUNNEL_TOKEN>