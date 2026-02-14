import type { INodeProperties } from 'n8n-workflow';

export const broadcastOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['broadcast'] } },
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				action: 'Cancel a broadcast',
				description: 'Cancel a broadcast',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a broadcast',
				description: 'Create a new broadcast',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a broadcast',
				description: 'Delete a broadcast',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a broadcast',
				description: 'Get a single broadcast',
			},
			{
				name: 'Get Test Results',
				value: 'getTestResults',
				action: 'Get A/B test results',
				description: 'Get A/B test results for a broadcast',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List broadcasts',
				description: 'List broadcasts',
			},
			{
				name: 'Pause',
				value: 'pause',
				action: 'Pause a broadcast',
				description: 'Pause a running broadcast',
			},
			{
				name: 'Resume',
				value: 'resume',
				action: 'Resume a broadcast',
				description: 'Resume a paused broadcast',
			},
			{
				name: 'Schedule',
				value: 'schedule',
				action: 'Schedule a broadcast',
				description: 'Schedule a broadcast for sending',
			},
			{
				name: 'Select Winner',
				value: 'selectWinner',
				action: 'Select A/B test winner',
				description: 'Select the winning A/B test variation',
			},
			{
				name: 'Send to Individual',
				value: 'sendToIndividual',
				action: 'Send broadcast to individual',
				description: 'Send a broadcast to a single contact',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a broadcast',
				description: 'Update a broadcast',
			},
		],
		default: 'list',
	},
];

export const broadcastFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//         broadcast: list
	// ------------------------------------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['broadcast'], operation: ['list'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 20,
		typeOptions: { minValue: 1, maxValue: 100 },
		description: 'Max number of results to return',
		displayOptions: {
			show: { resource: ['broadcast'], operation: ['list'], returnAll: [false] },
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['broadcast'], operation: ['list'] } },
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Scheduled', value: 'scheduled' },
					{ name: 'Processing', value: 'processing' },
					{ name: 'Paused', value: 'paused' },
					{ name: 'Processed', value: 'processed' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Testing', value: 'testing' },
					{ name: 'Test Completed', value: 'test_completed' },
					{ name: 'Winner Selected', value: 'winner_selected' },
				],
			},
			{
				displayName: 'With Templates',
				name: 'with_templates',
				type: 'boolean',
				default: false,
				description: 'Whether to include template details for each variation',
			},
		],
	},

	// ------------------------------------------------------------------
	//  broadcast: get / delete / pause / resume / cancel / getTestResults
	// ------------------------------------------------------------------
	{
		displayName: 'Broadcast ID',
		name: 'broadcastId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the broadcast',
		displayOptions: {
			show: {
				resource: ['broadcast'],
				operation: [
					'get',
					'delete',
					'pause',
					'resume',
					'cancel',
					'getTestResults',
					'schedule',
				],
			},
		},
	},

	// ------------------------------------------------------------------
	//         broadcast: get - extra options
	// ------------------------------------------------------------------
	{
		displayName: 'With Templates',
		name: 'withTemplates',
		type: 'boolean',
		default: false,
		description: 'Whether to include template details for each variation',
		displayOptions: { show: { resource: ['broadcast'], operation: ['get'] } },
	},

	// ------------------------------------------------------------------
	//         broadcast: create
	// ------------------------------------------------------------------
	{
		displayName: 'Broadcast Data (JSON)',
		name: 'broadcastData',
		type: 'json',
		required: true,
		default:
			'{\n  "name": "My Broadcast",\n  "channel": "email",\n  "integration_id": "",\n  "sender_id": ""\n}',
		description: 'Full broadcast configuration as JSON',
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
	},

	// ------------------------------------------------------------------
	//         broadcast: update
	// ------------------------------------------------------------------
	{
		displayName: 'Broadcast ID',
		name: 'broadcastId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['broadcast'], operation: ['update'] } },
	},
	{
		displayName: 'Update Data (JSON)',
		name: 'updateData',
		type: 'json',
		required: true,
		default: '{}',
		description: 'Fields to update as JSON',
		displayOptions: { show: { resource: ['broadcast'], operation: ['update'] } },
	},

	// ------------------------------------------------------------------
	//         broadcast: schedule - additional fields
	// ------------------------------------------------------------------
	{
		displayName: 'Schedule Options (JSON)',
		name: 'scheduleOptions',
		type: 'json',
		default: '{}',
		description:
			'Optional schedule settings (scheduled_date, scheduled_time, timezone). If empty, sends immediately.',
		displayOptions: { show: { resource: ['broadcast'], operation: ['schedule'] } },
	},

	// ------------------------------------------------------------------
	//         broadcast: selectWinner
	// ------------------------------------------------------------------
	{
		displayName: 'Broadcast ID',
		name: 'broadcastId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['broadcast'], operation: ['selectWinner'] } },
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		description: 'The template ID of the winning variation',
		displayOptions: { show: { resource: ['broadcast'], operation: ['selectWinner'] } },
	},

	// ------------------------------------------------------------------
	//         broadcast: sendToIndividual
	// ------------------------------------------------------------------
	{
		displayName: 'Broadcast ID',
		name: 'broadcastId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['broadcast'], operation: ['sendToIndividual'] } },
	},
	{
		displayName: 'Send Data (JSON)',
		name: 'sendData',
		type: 'json',
		required: true,
		default: '{\n  "email": "user@example.com"\n}',
		description: 'Individual send parameters as JSON',
		displayOptions: { show: { resource: ['broadcast'], operation: ['sendToIndividual'] } },
	},
];
