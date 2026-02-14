# n8n-nodes-notifuse

This is an n8n community node. It lets you use [Notifuse](https://notifuse.com) in your n8n workflows.

Notifuse is an open-source, self-hosted emailing platform for transactional emails, newsletters, and email marketing with built-in contact management, template editing, and broadcast scheduling.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Contact
- **List** — List contacts with filtering and pagination
- **Count** — Count contacts in a workspace
- **Get by Email** — Get a contact by email address
- **Get by External ID** — Get a contact by external ID
- **Upsert** — Create or update a contact by email
- **Import** — Batch import contacts
- **Delete** — Delete a contact by email

### Transactional Notification
- **Send** — Send a transactional notification email
- **List** — List transactional notification configurations
- **Get** — Get a transactional notification by ID
- **Create** — Create a new transactional notification configuration
- **Update** — Update an existing configuration
- **Delete** — Soft-delete a notification
- **Test Template** — Send a test email using a template

### Broadcast
- **List** — List broadcasts
- **Get** — Get a single broadcast
- **Create** — Create a broadcast
- **Update** — Update a broadcast
- **Schedule** — Schedule a broadcast for sending
- **Pause** — Pause a running broadcast
- **Resume** — Resume a paused broadcast
- **Cancel** — Cancel a broadcast
- **Send to Individual** — Send broadcast to a single contact
- **Delete** — Delete a broadcast
- **Get Test Results** — Get A/B test results
- **Select Winner** — Select the winning A/B test variation

### Template
- **List** — List templates
- **Get** — Get a single template
- **Create** — Create a template
- **Update** — Update a template
- **Delete** — Delete a template
- **Compile** — Compile/render a template with test data

### List (Subscription Management)
- **List** — List all subscription lists
- **Get** — Get a subscription list
- **Create** — Create a subscription list
- **Update** — Update a subscription list
- **Delete** — Delete a subscription list
- **Get Stats** — Get subscription statistics
- **Subscribe** — Subscribe a contact to lists (authenticated)

### Contact List
- **Get by IDs** — Get a contact-list relationship
- **Get Contacts by List** — Get all contacts on a list
- **Get Lists by Contact** — Get all lists for a contact
- **Update Status** — Update subscription status
- **Remove Contact** — Remove a contact from a list

### Webhook Subscription
- **List** — List webhook subscriptions
- **Get** — Get a webhook subscription
- **Create** — Create a webhook subscription
- **Update** — Update a webhook subscription
- **Delete** — Delete a webhook subscription
- **Toggle** — Enable/disable a webhook subscription
- **Regenerate Secret** — Regenerate the signing secret
- **Get Deliveries** — Get delivery history
- **Send Test** — Send a test webhook event
- **Get Event Types** — List available event types

### Custom Event
- **Get** — Get a custom event
- **List** — List custom events
- **Upsert** — Create or update a custom event
- **Import** — Batch import custom events

### Notifuse Trigger (Webhook)
Receives real-time events from Notifuse via webhooks with automatic registration and signature verification using the Standard Webhooks spec.

Supported event types include: contact events, list subscription events, segment events, email delivery events, and custom events.

## Credentials

1. Deploy a [Notifuse](https://github.com/Notifuse/notifuse) instance (self-hosted)
2. In Notifuse, go to **Workspace Settings > Team > Create API Key**
3. In n8n, create a new **Notifuse API** credential with:
   - **Base URL**: Your Notifuse instance URL (e.g., `https://notifuse.example.com`)
   - **API Key**: The workspace API key (JWT Bearer token)
   - **Workspace ID**: Your workspace ID

## Compatibility

- Minimum n8n version: **1.0.0**
- Requires Node.js **v22** or higher
- Tested against the Notifuse source code from the [official repository](https://github.com/Notifuse/notifuse)

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Notifuse documentation](https://docs.notifuse.com)
- [Notifuse API reference](https://docs.notifuse.com/api-reference)
- [Notifuse source code](https://github.com/Notifuse/notifuse)
