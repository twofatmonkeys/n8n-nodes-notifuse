import type { INodeProperties } from 'n8n-workflow';

export const contactListOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contactList'] } },
		options: [
			{
				name: 'Get by IDs',
				value: 'getByIds',
				action: 'Get contact-list relationship',
				description: 'Get a contact-list relationship by email and list ID',
			},
			{
				name: 'Get Contacts by List',
				value: 'getContactsByList',
				action: 'Get contacts by list',
				description: 'Get all contacts subscribed to a list',
			},
			{
				name: 'Get Lists by Contact',
				value: 'getListsByContact',
				action: 'Get lists by contact',
				description: 'Get all lists a contact is subscribed to',
			},
			{
				name: 'Remove Contact',
				value: 'removeContact',
				action: 'Remove contact from list',
				description: 'Remove a contact from a list',
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				action: 'Update subscription status',
				description: "Update a contact's subscription status on a list",
			},
		],
		default: 'getContactsByList',
	},
];

export const contactListFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//         contactList: getByIds
	// ------------------------------------------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contactList'],
				operation: ['getByIds', 'getListsByContact', 'updateStatus', 'removeContact'],
			},
		},
	},
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contactList'],
				operation: ['getByIds', 'getContactsByList', 'updateStatus', 'removeContact'],
			},
		},
	},

	// ------------------------------------------------------------------
	//         contactList: updateStatus
	// ------------------------------------------------------------------
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		default: 'active',
		options: [
			{ name: 'Active', value: 'active' },
			{ name: 'Unsubscribed', value: 'unsubscribed' },
			{ name: 'Bounced', value: 'bounced' },
			{ name: 'Complained', value: 'complained' },
			{ name: 'Pending', value: 'pending' },
		],
		displayOptions: { show: { resource: ['contactList'], operation: ['updateStatus'] } },
	},
];
