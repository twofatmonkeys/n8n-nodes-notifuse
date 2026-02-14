import type { INodeProperties } from 'n8n-workflow';

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contact'] } },
		options: [
			{
				name: 'Count',
				value: 'count',
				action: 'Count contacts',
				description: 'Count contacts in a workspace',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a contact',
				description: 'Delete a contact by email',
			},
			{
				name: 'Get by Email',
				value: 'getByEmail',
				action: 'Get a contact by email',
				description: 'Get a contact by email address',
			},
			{
				name: 'Get by External ID',
				value: 'getByExternalId',
				action: 'Get a contact by external ID',
				description: 'Get a contact by external ID',
			},
			{
				name: 'Import',
				value: 'import',
				action: 'Import contacts',
				description: 'Batch import contacts',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List contacts',
				description: 'List contacts with filtering and pagination',
			},
			{
				name: 'Upsert',
				value: 'upsert',
				action: 'Upsert a contact',
				description: 'Create or update a contact by email',
			},
		],
		default: 'list',
	},
];

export const contactFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//         contact: list
	// ------------------------------------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['contact'], operation: ['list'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 20,
		typeOptions: { minValue: 1, maxValue: 100 },
		description: 'Max number of results to return',
		displayOptions: {
			show: { resource: ['contact'], operation: ['list'], returnAll: [false] },
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['list'] } },
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Filter by email address',
			},
			{
				displayName: 'External ID',
				name: 'external_id',
				type: 'string',
				default: '',
				description: 'Filter by external ID',
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				description: 'Filter by first name',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'Filter by last name',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'Filter by country',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				description: 'Filter by language',
			},
			{
				displayName: 'List ID',
				name: 'list_id',
				type: 'string',
				default: '',
				description: 'Filter by subscription list ID',
			},
			{
				displayName: 'Contact List Status',
				name: 'contact_list_status',
				type: 'string',
				default: '',
				description: 'Filter by contact list subscription status',
			},
			{
				displayName: 'With Contact Lists',
				name: 'with_contact_lists',
				type: 'boolean',
				default: false,
				description: 'Whether to include contact list subscriptions in the response',
			},
		],
	},

	// ------------------------------------------------------------------
	//         contact: getByEmail
	// ------------------------------------------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		description: 'The email address of the contact',
		displayOptions: {
			show: { resource: ['contact'], operation: ['getByEmail', 'delete'] },
		},
	},

	// ------------------------------------------------------------------
	//         contact: getByExternalId
	// ------------------------------------------------------------------
	{
		displayName: 'External ID',
		name: 'externalId',
		type: 'string',
		required: true,
		default: '',
		description: 'The external ID of the contact',
		displayOptions: { show: { resource: ['contact'], operation: ['getByExternalId'] } },
	},

	// ------------------------------------------------------------------
	//         contact: upsert
	// ------------------------------------------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		description: 'The email address of the contact to create or update',
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
		options: [
			{
				displayName: 'External ID',
				name: 'external_id',
				type: 'string',
				default: '',
				description: 'External identifier for the contact',
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Full Name',
				name: 'full_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: '',
				placeholder: 'America/New_York',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				placeholder: 'en',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Address Line 1',
				name: 'address_line_1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Address Line 2',
				name: 'address_line_2',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Postcode',
				name: 'postcode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Job Title',
				name: 'job_title',
				type: 'string',
				default: '',
			},
		],
	},

	// ------------------------------------------------------------------
	//         contact: import
	// ------------------------------------------------------------------
	{
		displayName: 'Contacts (JSON)',
		name: 'contacts',
		type: 'json',
		required: true,
		default: '[\n  { "email": "user@example.com", "first_name": "John" }\n]',
		description: 'JSON array of contact objects to import. Each must have an "email" field.',
		displayOptions: { show: { resource: ['contact'], operation: ['import'] } },
	},
	{
		displayName: 'Subscribe to Lists',
		name: 'subscribeToLists',
		type: 'string',
		default: '',
		description:
			'Comma-separated list IDs to subscribe imported contacts to',
		displayOptions: { show: { resource: ['contact'], operation: ['import'] } },
	},
];
