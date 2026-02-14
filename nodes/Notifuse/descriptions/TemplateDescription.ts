import type { INodeProperties } from 'n8n-workflow';

export const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['template'] } },
		options: [
			{
				name: 'Compile',
				value: 'compile',
				action: 'Compile a template',
				description: 'Compile/render a template with test data',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a template',
				description: 'Create a new template',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a template',
				description: 'Delete a template',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a template',
				description: 'Get a single template',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List templates',
				description: 'List templates',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a template',
				description: 'Update a template',
			},
		],
		default: 'list',
	},
];

export const templateFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//         template: list
	// ------------------------------------------------------------------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['list'] } },
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
				description: 'Filter by template category',
			},
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'string',
				default: '',
				description: 'Filter by channel (e.g., email)',
			},
		],
	},

	// ------------------------------------------------------------------
	//         template: get
	// ------------------------------------------------------------------
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the template',
		displayOptions: {
			show: { resource: ['template'], operation: ['get', 'delete'] },
		},
	},
	{
		displayName: 'Version',
		name: 'version',
		type: 'number',
		default: 1,
		description: 'Template version to retrieve',
		displayOptions: { show: { resource: ['template'], operation: ['get'] } },
	},

	// ------------------------------------------------------------------
	//         template: create
	// ------------------------------------------------------------------
	{
		displayName: 'Template Data (JSON)',
		name: 'templateData',
		type: 'json',
		required: true,
		default:
			'{\n  "id": "my-template",\n  "name": "My Template",\n  "channel": "email",\n  "category": "transactional"\n}',
		description: 'Full template configuration as JSON',
		displayOptions: { show: { resource: ['template'], operation: ['create'] } },
	},

	// ------------------------------------------------------------------
	//         template: update
	// ------------------------------------------------------------------
	{
		displayName: 'Template Data (JSON)',
		name: 'templateData',
		type: 'json',
		required: true,
		default: '{}',
		description: 'Template fields to update as JSON',
		displayOptions: { show: { resource: ['template'], operation: ['update'] } },
	},

	// ------------------------------------------------------------------
	//         template: compile
	// ------------------------------------------------------------------
	{
		displayName: 'Compile Data (JSON)',
		name: 'compileData',
		type: 'json',
		required: true,
		default: '{\n  "template_id": "my-template",\n  "data": {}\n}',
		description: 'Template ID and test data for compilation',
		displayOptions: { show: { resource: ['template'], operation: ['compile'] } },
	},
];
