import type { INodeProperties } from 'n8n-workflow';

export const webhookSubscriptionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['webhookSubscription'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a webhook subscription',
				description: 'Create a new webhook subscription',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a webhook subscription',
				description: 'Delete a webhook subscription',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a webhook subscription',
				description: 'Get a webhook subscription',
			},
			{
				name: 'Get Deliveries',
				value: 'getDeliveries',
				action: 'Get delivery history',
				description: 'Get webhook delivery history',
			},
			{
				name: 'Get Event Types',
				value: 'getEventTypes',
				action: 'Get event types',
				description: 'List all available webhook event types',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List webhook subscriptions',
				description: 'List webhook subscriptions',
			},
			{
				name: 'Regenerate Secret',
				value: 'regenerateSecret',
				action: 'Regenerate webhook secret',
				description: 'Regenerate the webhook signing secret',
			},
			{
				name: 'Send Test',
				value: 'sendTest',
				action: 'Send a test webhook',
				description: 'Send a test webhook event',
			},
			{
				name: 'Toggle',
				value: 'toggle',
				action: 'Toggle webhook subscription',
				description: 'Enable or disable a webhook subscription',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a webhook subscription',
				description: 'Update a webhook subscription',
			},
		],
		default: 'list',
	},
];

export const webhookSubscriptionFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//         webhookSubscription: create
	// ------------------------------------------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the webhook subscription',
		displayOptions: { show: { resource: ['webhookSubscription'], operation: ['create'] } },
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/webhook',
		description: 'URL to receive webhook events',
		displayOptions: { show: { resource: ['webhookSubscription'], operation: ['create'] } },
	},
	{
		displayName: 'Event Types',
		name: 'eventTypes',
		type: 'multiOptions',
		required: true,
		default: [],
		options: [
			{ name: 'Contact Created', value: 'contact.created' },
			{ name: 'Contact Updated', value: 'contact.updated' },
			{ name: 'Contact Deleted', value: 'contact.deleted' },
			{ name: 'List Subscribed', value: 'list.subscribed' },
			{ name: 'List Unsubscribed', value: 'list.unsubscribed' },
			{ name: 'List Confirmed', value: 'list.confirmed' },
			{ name: 'List Resubscribed', value: 'list.resubscribed' },
			{ name: 'List Bounced', value: 'list.bounced' },
			{ name: 'List Complained', value: 'list.complained' },
			{ name: 'List Pending', value: 'list.pending' },
			{ name: 'List Removed', value: 'list.removed' },
			{ name: 'Segment Joined', value: 'segment.joined' },
			{ name: 'Segment Left', value: 'segment.left' },
			{ name: 'Email Sent', value: 'email.sent' },
			{ name: 'Email Delivered', value: 'email.delivered' },
			{ name: 'Email Opened', value: 'email.opened' },
			{ name: 'Email Clicked', value: 'email.clicked' },
			{ name: 'Email Bounced', value: 'email.bounced' },
			{ name: 'Email Complained', value: 'email.complained' },
			{ name: 'Email Unsubscribed', value: 'email.unsubscribed' },
			{ name: 'Custom Event Created', value: 'custom_event.created' },
			{ name: 'Custom Event Updated', value: 'custom_event.updated' },
			{ name: 'Custom Event Deleted', value: 'custom_event.deleted' },
		],
		displayOptions: {
			show: { resource: ['webhookSubscription'], operation: ['create', 'update'] },
		},
	},

	// ------------------------------------------------------------------
	//    webhookSubscription: get / delete / toggle / regenerateSecret / sendTest
	// ------------------------------------------------------------------
	{
		displayName: 'Subscription ID',
		name: 'subscriptionId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the webhook subscription',
		displayOptions: {
			show: {
				resource: ['webhookSubscription'],
				operation: [
					'get',
					'delete',
					'toggle',
					'regenerateSecret',
					'sendTest',
					'update',
				],
			},
		},
	},

	// ------------------------------------------------------------------
	//         webhookSubscription: toggle
	// ------------------------------------------------------------------
	{
		displayName: 'Enabled',
		name: 'enabled',
		type: 'boolean',
		required: true,
		default: true,
		description: 'Whether the webhook subscription should be enabled',
		displayOptions: { show: { resource: ['webhookSubscription'], operation: ['toggle'] } },
	},

	// ------------------------------------------------------------------
	//         webhookSubscription: update
	// ------------------------------------------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Updated name',
		displayOptions: { show: { resource: ['webhookSubscription'], operation: ['update'] } },
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		description: 'Updated URL',
		displayOptions: { show: { resource: ['webhookSubscription'], operation: ['update'] } },
	},
	{
		displayName: 'Enabled',
		name: 'enabled',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['webhookSubscription'], operation: ['update'] } },
	},

	// ------------------------------------------------------------------
	//         webhookSubscription: sendTest
	// ------------------------------------------------------------------
	{
		displayName: 'Event Type',
		name: 'eventType',
		type: 'string',
		default: '',
		description: 'Event type for the test webhook (e.g., "contact.created")',
		displayOptions: { show: { resource: ['webhookSubscription'], operation: ['sendTest'] } },
	},

	// ------------------------------------------------------------------
	//         webhookSubscription: getDeliveries
	// ------------------------------------------------------------------
	{
		displayName: 'Subscription ID',
		name: 'subscriptionId',
		type: 'string',
		default: '',
		description: 'Filter by subscription ID (optional)',
		displayOptions: {
			show: { resource: ['webhookSubscription'], operation: ['getDeliveries'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 20,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: { resource: ['webhookSubscription'], operation: ['getDeliveries'] },
		},
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		default: 0,
		displayOptions: {
			show: { resource: ['webhookSubscription'], operation: ['getDeliveries'] },
		},
	},
];
