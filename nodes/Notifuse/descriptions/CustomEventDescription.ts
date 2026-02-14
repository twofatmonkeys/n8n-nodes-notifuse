import type { INodeProperties } from 'n8n-workflow';

export const customEventOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['customEvent'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a custom event',
				description: 'Get a custom event by name and external ID',
			},
			{
				name: 'Import',
				value: 'import',
				action: 'Import custom events',
				description: 'Batch import custom events',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List custom events',
				description: 'List custom events for a contact or event name',
			},
			{
				name: 'Upsert',
				value: 'upsert',
				action: 'Upsert a custom event',
				description: 'Create or update a custom event',
			},
		],
		default: 'list',
	},
];

export const customEventFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//         customEvent: get
	// ------------------------------------------------------------------
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the custom event',
		displayOptions: { show: { resource: ['customEvent'], operation: ['get'] } },
	},
	{
		displayName: 'External ID',
		name: 'externalId',
		type: 'string',
		required: true,
		default: '',
		description: 'The external ID of the custom event',
		displayOptions: { show: { resource: ['customEvent'], operation: ['get'] } },
	},

	// ------------------------------------------------------------------
	//         customEvent: list
	// ------------------------------------------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		description: 'Filter by contact email (required if event name is not provided)',
		displayOptions: { show: { resource: ['customEvent'], operation: ['list'] } },
	},
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		default: '',
		description: 'Filter by event name (required if email is not provided)',
		displayOptions: { show: { resource: ['customEvent'], operation: ['list'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['customEvent'], operation: ['list'] } },
	},

	// ------------------------------------------------------------------
	//         customEvent: upsert
	// ------------------------------------------------------------------
	{
		displayName: 'Event Data (JSON)',
		name: 'eventData',
		type: 'json',
		required: true,
		default:
			'{\n  "event_name": "purchase",\n  "external_id": "order-123",\n  "email": "user@example.com"\n}',
		description: 'Custom event data as JSON',
		displayOptions: { show: { resource: ['customEvent'], operation: ['upsert'] } },
	},

	// ------------------------------------------------------------------
	//         customEvent: import
	// ------------------------------------------------------------------
	{
		displayName: 'Events (JSON)',
		name: 'events',
		type: 'json',
		required: true,
		default: '{\n  "events": [\n    {\n      "event_name": "purchase",\n      "external_id": "order-123",\n      "email": "user@example.com"\n    }\n  ]\n}',
		description: 'Batch import payload with events array',
		displayOptions: { show: { resource: ['customEvent'], operation: ['import'] } },
	},
];
