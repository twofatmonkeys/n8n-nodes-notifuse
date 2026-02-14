import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { notifuseApiRequest, verifyWebhookSignature } from './GenericFunctions';

export class NotifuseTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Notifuse Trigger',
		name: 'notifuseTrigger',
		icon: 'file:notifuse.png',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Receive Notifuse events via webhooks',
		defaults: {
			name: 'Notifuse Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'notifuseApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description: 'Which webhook event types to listen for',
				options: [
					{ name: 'Contact Created', value: 'contact.created' },
					{ name: 'Contact Deleted', value: 'contact.deleted' },
					{ name: 'Contact Updated', value: 'contact.updated' },
					{ name: 'Custom Event Created', value: 'custom_event.created' },
					{ name: 'Custom Event Deleted', value: 'custom_event.deleted' },
					{ name: 'Custom Event Updated', value: 'custom_event.updated' },
					{ name: 'Email Bounced', value: 'email.bounced' },
					{ name: 'Email Clicked', value: 'email.clicked' },
					{ name: 'Email Complained', value: 'email.complained' },
					{ name: 'Email Delivered', value: 'email.delivered' },
					{ name: 'Email Opened', value: 'email.opened' },
					{ name: 'Email Sent', value: 'email.sent' },
					{ name: 'Email Unsubscribed', value: 'email.unsubscribed' },
					{ name: 'List Bounced', value: 'list.bounced' },
					{ name: 'List Complained', value: 'list.complained' },
					{ name: 'List Confirmed', value: 'list.confirmed' },
					{ name: 'List Pending', value: 'list.pending' },
					{ name: 'List Removed', value: 'list.removed' },
					{ name: 'List Resubscribed', value: 'list.resubscribed' },
					{ name: 'List Subscribed', value: 'list.subscribed' },
					{ name: 'List Unsubscribed', value: 'list.unsubscribed' },
					{ name: 'Segment Joined', value: 'segment.joined' },
					{ name: 'Segment Left', value: 'segment.left' },
				],
			},
			{
				displayName: 'Verify Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: true,
				description:
					'Whether to verify the webhook signature using the Standard Webhooks spec (HMAC-SHA256). Recommended for production.',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId as string | undefined;

				if (!webhookId) {
					return false;
				}

				try {
					await notifuseApiRequest.call(
						this,
						'GET',
						'webhookSubscriptions.get',
						{},
						{ id: webhookId },
					);
					return true;
				} catch {
					// Webhook no longer exists on the Notifuse side
					delete webhookData.webhookId;
					delete webhookData.webhookSecret;
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];

				const response = await notifuseApiRequest.call(
					this,
					'POST',
					'webhookSubscriptions.create',
					{
						name: `n8n webhook - ${this.getWorkflow().name}`,
						url: webhookUrl,
						event_types: events,
					},
				);

				const subscription = response.subscription as IDataObject;
				if (!subscription?.id) {
					return false;
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = subscription.id;
				webhookData.webhookSecret = subscription.secret;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId as string | undefined;

				if (!webhookId) {
					return true;
				}

				try {
					await notifuseApiRequest.call(this, 'POST', 'webhookSubscriptions.delete', {
						id: webhookId,
					});
				} catch {
					// Ignore errors during cleanup - the webhook may already be deleted
				}

				delete webhookData.webhookId;
				delete webhookData.webhookSecret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = req.body as IDataObject;

		// Verify signature if enabled
		const verifySignature = this.getNodeParameter('verifySignature', true) as boolean;

		if (verifySignature) {
			const webhookData = this.getWorkflowStaticData('node');
			const secret = webhookData.webhookSecret as string | undefined;

			if (secret) {
				const webhookId = req.headers['webhook-id'] as string | undefined;
				const webhookTimestamp = req.headers['webhook-timestamp'] as string | undefined;
				const webhookSignature = req.headers['webhook-signature'] as string | undefined;

				if (!webhookId || !webhookTimestamp || !webhookSignature) {
					return {
						webhookResponse: 'Missing webhook signature headers',
						workflowData: [],
					};
				}

				// Validate timestamp to prevent replay attacks (5 minute window)
				const timestamp = parseInt(webhookTimestamp, 10);
				const now = Math.floor(Date.now() / 1000);
				if (Math.abs(now - timestamp) > 300) {
					return {
						webhookResponse: 'Webhook timestamp too old',
						workflowData: [],
					};
				}

				const rawBody =
					typeof req.rawBody === 'string'
						? req.rawBody
						: JSON.stringify(body);

				const isValid = verifyWebhookSignature(
					rawBody,
					webhookId,
					webhookTimestamp,
					webhookSignature,
					secret,
				);

				if (!isValid) {
					return {
						webhookResponse: 'Invalid webhook signature',
						workflowData: [],
					};
				}
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
