import type { INodeProperties } from 'n8n-workflow';

export const transactionalOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['transactional'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a transactional notification',
				description: 'Create a new transactional notification configuration',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a transactional notification',
				description: 'Soft-delete a transactional notification',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a transactional notification',
				description: 'Get a transactional notification by ID',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List transactional notifications',
				description: 'List transactional notifications',
			},
			{
				name: 'Send',
				value: 'send',
				action: 'Send a transactional notification',
				description: 'Send a transactional notification email to a contact',
			},
			{
				name: 'Test Template',
				value: 'testTemplate',
				action: 'Test a template',
				description: 'Send a test email using a template',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a transactional notification',
				description: 'Update an existing transactional notification',
			},
		],
		default: 'send',
	},
];

export const transactionalFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//         transactional: send
	// ------------------------------------------------------------------
	{
		displayName: 'Notification ID',
		name: 'notificationId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the transactional notification to send',
		displayOptions: { show: { resource: ['transactional'], operation: ['send'] } },
	},
	{
		displayName: 'Contact Email',
		name: 'contactEmail',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		description: 'The email address of the contact to send to',
		displayOptions: { show: { resource: ['transactional'], operation: ['send'] } },
	},
	{
		displayName: 'Channels',
		name: 'channels',
		type: 'multiOptions',
		options: [{ name: 'Email', value: 'email' }],
		default: ['email'],
		description: 'Which channels to send through',
		displayOptions: { show: { resource: ['transactional'], operation: ['send'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['transactional'], operation: ['send'] } },
		options: [
			{
				displayName: 'External ID',
				name: 'external_id',
				type: 'string',
				default: '',
				description: 'External ID for idempotency/deduplication',
			},
			{
				displayName: 'Contact First Name',
				name: 'contact_first_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Contact Last Name',
				name: 'contact_last_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Contact External ID',
				name: 'contact_external_id',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Template Data (JSON)',
				name: 'data',
				type: 'json',
				default: '{}',
				description: 'Template variables as JSON object',
			},
			{
				displayName: 'Metadata (JSON)',
				name: 'metadata',
				type: 'json',
				default: '{}',
				description: 'Additional tracking metadata as JSON',
			},
			{
				displayName: 'Reply To',
				name: 'reply_to',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Reply-to email address',
			},
			{
				displayName: 'CC',
				name: 'cc',
				type: 'string',
				default: '',
				description: 'Comma-separated CC email addresses',
			},
			{
				displayName: 'BCC',
				name: 'bcc',
				type: 'string',
				default: '',
				description: 'Comma-separated BCC email addresses',
			},
		],
	},

	// ------------------------------------------------------------------
	//         transactional: list
	// ------------------------------------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['transactional'], operation: ['list'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 20,
		typeOptions: { minValue: 1, maxValue: 100 },
		description: 'Max number of results to return',
		displayOptions: {
			show: { resource: ['transactional'], operation: ['list'], returnAll: [false] },
		},
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		description: 'Search term to filter notifications',
		displayOptions: { show: { resource: ['transactional'], operation: ['list'] } },
	},

	// ------------------------------------------------------------------
	//         transactional: get / delete
	// ------------------------------------------------------------------
	{
		displayName: 'Notification ID',
		name: 'notificationId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the transactional notification',
		displayOptions: {
			show: { resource: ['transactional'], operation: ['get', 'delete'] },
		},
	},

	// ------------------------------------------------------------------
	//         transactional: create
	// ------------------------------------------------------------------
	{
		displayName: 'Notification ID',
		name: 'notificationId',
		type: 'string',
		required: true,
		default: '',
		description: 'Unique identifier for the notification (used for API triggering)',
		displayOptions: { show: { resource: ['transactional'], operation: ['create'] } },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Display name of the notification',
		displayOptions: { show: { resource: ['transactional'], operation: ['create'] } },
	},
	{
		displayName: 'Channels (JSON)',
		name: 'channelsConfig',
		type: 'json',
		required: true,
		default: '{\n  "email": {\n    "template_id": "my-template"\n  }\n}',
		description: 'Channel-to-template mapping as JSON',
		displayOptions: { show: { resource: ['transactional'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['transactional'], operation: ['create'] } },
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Metadata (JSON)',
				name: 'metadata',
				type: 'json',
				default: '{}',
			},
		],
	},

	// ------------------------------------------------------------------
	//         transactional: update
	// ------------------------------------------------------------------
	{
		displayName: 'Notification ID',
		name: 'notificationId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the notification to update',
		displayOptions: { show: { resource: ['transactional'], operation: ['update'] } },
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['transactional'], operation: ['update'] } },
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Channels (JSON)',
				name: 'channels',
				type: 'json',
				default: '',
				description: 'Updated channel-to-template mapping',
			},
			{
				displayName: 'Metadata (JSON)',
				name: 'metadata',
				type: 'json',
				default: '',
			},
		],
	},

	// ------------------------------------------------------------------
	//         transactional: testTemplate
	// ------------------------------------------------------------------
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['transactional'], operation: ['testTemplate'] } },
	},
	{
		displayName: 'Integration ID',
		name: 'integrationId',
		type: 'string',
		required: true,
		default: '',
		description: 'The email provider integration ID',
		displayOptions: { show: { resource: ['transactional'], operation: ['testTemplate'] } },
	},
	{
		displayName: 'Sender ID',
		name: 'senderId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['transactional'], operation: ['testTemplate'] } },
	},
	{
		displayName: 'Recipient Email',
		name: 'recipientEmail',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['transactional'], operation: ['testTemplate'] } },
	},
];
