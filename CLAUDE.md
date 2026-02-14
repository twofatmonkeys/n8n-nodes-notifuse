# CLAUDE.md — n8n-nodes-notifuse

## Architecture Decisions

### Authentication: Workspace API Keys (JWT Bearer Tokens)
The Notifuse API authenticates via JWT Bearer tokens passed as `Authorization: Bearer {token}`. The `POST /api/user.rootSignin` endpoint uses HMAC-SHA256 signature auth with the server's SECRET_KEY for programmatic root access (CI/CD, IaC). **This is NOT implemented** in the n8n node — workspace API keys are the correct auth method for integration use cases.

### Endpoint Paths: Source Code Is Authoritative
The API documentation at docs.notifuse.com uses different endpoint paths than the actual source code. We follow the source code exclusively:
- **Webhook subscriptions** use `webhookSubscriptions.*` (NOT `webhooks.*`)
- **A/B test results** use `broadcasts.getTestResults` (NOT `broadcasts.getABTestResults`)
- **A/B winner selection** uses `broadcasts.selectWinner` (NOT `broadcasts.selectABTestWinner`)
- **Delivery history** uses `webhookSubscriptions.deliveries` (NOT `webhookSubscriptions.deliveryHistory`)
- **Test webhook** uses `webhookSubscriptions.test` (NOT `webhookSubscriptions.sendTest`)

### Transactional Resource: Full CRUD + Send
The source code reveals that transactional notifications have full CRUD operations (list, get, create, update, delete) plus the `send` operation and `testTemplate`. The API docs only document `send`, but we implement all operations found in the source.

---

## Module Interfaces

### Credentials: `NotifuseApi.credentials.ts`
- **baseUrl**: Self-hosted Notifuse instance URL (no trailing slash)
- **apiKey**: JWT workspace API key (Bearer token)
- **workspaceId**: Workspace ID injected into every request

### GenericFunctions.ts
- `notifuseApiRequest()`: Core HTTP helper. Injects workspace_id into POST body or GET query. Retries 3× for 5xx with exponential backoff. Handles 429 rate limiting.
- `notifuseApiRequestAllItems()`: Pagination helper. Supports cursor-based (contacts) and offset/limit pagination.
- `verifyWebhookSignature()`: Standard Webhooks spec signature verification.

### Main Node: `Notifuse.node.ts`
8 resources × multiple operations each (~50 total operations).

### Trigger Node: `NotifuseTrigger.node.ts`
- **Activation**: Creates a webhook subscription via `webhookSubscriptions.create`
- **Deactivation**: Deletes the webhook subscription via `webhookSubscriptions.delete`
- **On event**: Verifies Standard Webhooks signature, returns event data to workflow

---

## API Endpoint Mapping

### Contact Endpoints
| Source Path | HTTP | n8n Operation |
|---|---|---|
| `contacts.list` | GET | contact → list |
| `contacts.count` | GET | contact → count |
| `contacts.getByEmail` | GET | contact → getByEmail |
| `contacts.getByExternalID` | GET | contact → getByExternalId |
| `contacts.upsert` | POST | contact → upsert |
| `contacts.import` | POST | contact → import |
| `contacts.delete` | POST | contact → delete |

### Transactional Endpoints
| Source Path | HTTP | n8n Operation |
|---|---|---|
| `transactional.list` | GET | transactional → list |
| `transactional.get` | GET | transactional → get |
| `transactional.create` | POST | transactional → create |
| `transactional.update` | POST | transactional → update |
| `transactional.delete` | POST | transactional → delete |
| `transactional.send` | POST | transactional → send |
| `transactional.testTemplate` | POST | transactional → testTemplate |

### Broadcast Endpoints
| Source Path | HTTP | n8n Operation |
|---|---|---|
| `broadcasts.list` | GET | broadcast → list |
| `broadcasts.get` | GET | broadcast → get |
| `broadcasts.create` | POST | broadcast → create |
| `broadcasts.update` | POST | broadcast → update |
| `broadcasts.schedule` | POST | broadcast → schedule |
| `broadcasts.pause` | POST | broadcast → pause |
| `broadcasts.resume` | POST | broadcast → resume |
| `broadcasts.cancel` | POST | broadcast → cancel |
| `broadcasts.sendToIndividual` | POST | broadcast → sendToIndividual |
| `broadcasts.delete` | POST | broadcast → delete |
| `broadcasts.getTestResults` | GET | broadcast → getTestResults |
| `broadcasts.selectWinner` | POST | broadcast → selectWinner |

### Template Endpoints
| Source Path | HTTP | n8n Operation |
|---|---|---|
| `templates.list` | GET | template → list |
| `templates.get` | GET | template → get |
| `templates.create` | POST | template → create |
| `templates.update` | POST | template → update |
| `templates.delete` | POST | template → delete |
| `templates.compile` | POST | template → compile |

### List Endpoints
| Source Path | HTTP | n8n Operation |
|---|---|---|
| `lists.list` | GET | list → list |
| `lists.get` | GET | list → get |
| `lists.create` | POST | list → create |
| `lists.update` | POST | list → update |
| `lists.delete` | POST | list → delete |
| `lists.stats` | GET | list → stats |
| `lists.subscribe` | POST | list → subscribe |

### Contact List Endpoints
| Source Path | HTTP | n8n Operation |
|---|---|---|
| `contactLists.getByIDs` | GET | contactList → getByIds |
| `contactLists.getContactsByList` | GET | contactList → getContactsByList |
| `contactLists.getListsByContact` | GET | contactList → getListsByContact |
| `contactLists.updateStatus` | POST | contactList → updateStatus |
| `contactLists.removeContact` | POST | contactList → removeContact |

### Webhook Subscription Endpoints
| Source Path | HTTP | n8n Operation |
|---|---|---|
| `webhookSubscriptions.list` | GET | webhookSubscription → list |
| `webhookSubscriptions.get` | GET | webhookSubscription → get |
| `webhookSubscriptions.create` | POST | webhookSubscription → create |
| `webhookSubscriptions.update` | POST | webhookSubscription → update |
| `webhookSubscriptions.delete` | POST | webhookSubscription → delete |
| `webhookSubscriptions.toggle` | POST | webhookSubscription → toggle |
| `webhookSubscriptions.regenerateSecret` | POST | webhookSubscription → regenerateSecret |
| `webhookSubscriptions.deliveries` | GET | webhookSubscription → getDeliveries |
| `webhookSubscriptions.test` | POST | webhookSubscription → sendTest |
| `webhookSubscriptions.eventTypes` | GET | webhookSubscription → getEventTypes |

### Custom Event Endpoints
| Source Path | HTTP | n8n Operation |
|---|---|---|
| `customEvents.get` | GET | customEvent → get |
| `customEvents.list` | GET | customEvent → list |
| `customEvents.upsert` | POST | customEvent → upsert |
| `customEvents.import` | POST | customEvent → import |

---

## Webhook Signature Verification

Notifuse uses the **Standard Webhooks** specification for webhook signatures:

- **Algorithm**: HMAC-SHA256
- **Headers**:
  - `webhook-id`: Unique delivery/message ID
  - `webhook-timestamp`: Unix timestamp (seconds)
  - `webhook-signature`: `v1,{base64-encoded-hmac}`
- **Signed content**: `{webhook-id}.{webhook-timestamp}.{raw-body}`
- **Secret**: Per-subscription secret returned by `webhookSubscriptions.create`

The trigger node verifies signatures by default and validates timestamps within a 5-minute window to prevent replay attacks.

---

## Endpoints NOT Implemented (by design)

These endpoints are internal/admin and not suitable for n8n integration:
- `user.rootSignin` — Uses server SECRET_KEY, not workspace API keys
- `broadcasts.refreshGlobalFeed` — Internal feed management
- `broadcasts.testRecipientFeed` — Internal feed testing
- All workspace/user/setup/demo management endpoints
- Blog, blog theme, LLM, analytics, segment, automation, message history, task endpoints (internal console features)

---

## Webhook Event Types (from source code)

```
contact.created, contact.updated, contact.deleted
list.subscribed, list.unsubscribed, list.confirmed, list.resubscribed
list.bounced, list.complained, list.pending, list.removed
segment.joined, segment.left
email.sent, email.delivered, email.opened, email.clicked
email.bounced, email.complained, email.unsubscribed
custom_event.created, custom_event.updated, custom_event.deleted
```
