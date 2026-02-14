import type { INodeProperties } from 'n8n-workflow';

export const listOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['list'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a list',
				description: 'Create a new subscription list',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a list',
				description: 'Delete a subscription list',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a list',
				description: 'Get a single subscription list',
			},
			{
				name: 'Get Stats',
				value: 'stats',
				action: 'Get list stats',
				description: 'Get subscription statistics for a list',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List subscription lists',
				description: 'List all subscription lists',
			},
			{
				name: 'Subscribe',
				value: 'subscribe',
				action: 'Subscribe to lists',
				description: 'Subscribe a contact to one or more lists (authenticated)',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a list',
				description: 'Update a subscription list',
			},
		],
		default: 'list',
	},
];

export const listFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//         list: get / delete / stats
	// ------------------------------------------------------------------
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the list',
		displayOptions: {
			show: { resource: ['list'], operation: ['get', 'delete', 'stats'] },
		},
	},

	// ------------------------------------------------------------------
	//         list: create
	// ------------------------------------------------------------------
	{
		displayName: 'List Data (JSON)',
		name: 'listData',
		type: 'json',
		required: true,
		default: '{\n  "id": "my-list",\n  "name": "My Newsletter"\n}',
		description: 'Full list configuration as JSON',
		displayOptions: { show: { resource: ['list'], operation: ['create'] } },
	},

	// ------------------------------------------------------------------
	//         list: update
	// ------------------------------------------------------------------
	{
		displayName: 'List Data (JSON)',
		name: 'listData',
		type: 'json',
		required: true,
		default: '{}',
		description: 'List fields to update as JSON (must include "id")',
		displayOptions: { show: { resource: ['list'], operation: ['update'] } },
	},

	// ------------------------------------------------------------------
	//         list: subscribe
	// ------------------------------------------------------------------
	{
		displayName: 'Contact Email',
		name: 'contactEmail',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		description: 'Email of the contact to subscribe',
		displayOptions: { show: { resource: ['list'], operation: ['subscribe'] } },
	},
	{
		displayName: 'List IDs',
		name: 'listIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list IDs to subscribe to',
		displayOptions: { show: { resource: ['list'], operation: ['subscribe'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['list'], operation: ['subscribe'] } },
		options: [
			{
				displayName: 'Contact First Name',
				name: 'first_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Contact Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
			},
		],
	},
];
