import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { notifuseApiRequest, notifuseApiRequestAllItems } from './GenericFunctions';

import { contactOperations, contactFields } from './descriptions/ContactDescription';
import {
	transactionalOperations,
	transactionalFields,
} from './descriptions/TransactionalDescription';
import { broadcastOperations, broadcastFields } from './descriptions/BroadcastDescription';
import { templateOperations, templateFields } from './descriptions/TemplateDescription';
import { listOperations, listFields } from './descriptions/ListDescription';
import {
	contactListOperations,
	contactListFields,
} from './descriptions/ContactListDescription';
import {
	webhookSubscriptionOperations,
	webhookSubscriptionFields,
} from './descriptions/WebhookSubscriptionDescription';
import {
	customEventOperations,
	customEventFields,
} from './descriptions/CustomEventDescription';

export class Notifuse implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Notifuse',
		name: 'notifuse',
		icon: 'file:notifuse.png',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Interact with the Notifuse self-hosted emailing platform API',
		defaults: {
			name: 'Notifuse',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'notifuseApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Broadcast', value: 'broadcast' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Contact List', value: 'contactList' },
					{ name: 'Custom Event', value: 'customEvent' },
					{ name: 'List', value: 'list' },
					{ name: 'Template', value: 'template' },
					{ name: 'Transactional', value: 'transactional' },
					{ name: 'Webhook Subscription', value: 'webhookSubscription' },
				],
				default: 'contact',
			},
			...contactOperations,
			...contactFields,
			...transactionalOperations,
			...transactionalFields,
			...broadcastOperations,
			...broadcastFields,
			...templateOperations,
			...templateFields,
			...listOperations,
			...listFields,
			...contactListOperations,
			...contactListFields,
			...webhookSubscriptionOperations,
			...webhookSubscriptionFields,
			...customEventOperations,
			...customEventFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				if (resource === 'contact') {
					responseData = await executeContact.call(this, operation, i);
				} else if (resource === 'transactional') {
					responseData = await executeTransactional.call(this, operation, i);
				} else if (resource === 'broadcast') {
					responseData = await executeBroadcast.call(this, operation, i);
				} else if (resource === 'template') {
					responseData = await executeTemplate.call(this, operation, i);
				} else if (resource === 'list') {
					responseData = await executeList.call(this, operation, i);
				} else if (resource === 'contactList') {
					responseData = await executeContactList.call(this, operation, i);
				} else if (resource === 'webhookSubscription') {
					responseData = await executeWebhookSubscription.call(this, operation, i);
				} else if (resource === 'customEvent') {
					responseData = await executeCustomEvent.call(this, operation, i);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource: ${resource}`,
						{ itemIndex: i },
					);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// =====================================================================
//                         CONTACT
// =====================================================================

async function executeContact(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const withContactLists = this.getNodeParameter('withContactLists', i, false) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
		const query: IDataObject = { ...filters };
		if (withContactLists) {
			query.with_contact_lists = true;
		}

		if (returnAll) {
			return await notifuseApiRequestAllItems.call(
				this,
				'GET',
				'contacts.list',
				'contacts',
				{},
				query,
			);
		}

		query.limit = this.getNodeParameter('limit', i) as number;
		const response = await notifuseApiRequest.call(this, 'GET', 'contacts.list', {}, query);
		return (response.contacts as IDataObject[]) || [];
	}

	if (operation === 'count') {
		return await notifuseApiRequest.call(this, 'GET', 'contacts.count');
	}

	if (operation === 'getByEmail') {
		const email = this.getNodeParameter('email', i) as string;
		return await notifuseApiRequest.call(this, 'GET', 'contacts.getByEmail', {}, { email });
	}

	if (operation === 'getByExternalId') {
		const externalId = this.getNodeParameter('externalId', i) as string;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'contacts.getByExternalID',
			{},
			{ external_id: externalId },
		);
	}

	if (operation === 'delete') {
		const email = this.getNodeParameter('email', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'contacts.delete', { email });
	}

	if (operation === 'upsert') {
		const inputMode = this.getNodeParameter('inputMode', i, 'fields') as string;
		let contact: IDataObject;

		if (inputMode === 'json') {
			const contactJson = this.getNodeParameter('contactJson', i) as string;
			contact = typeof contactJson === 'string' ? JSON.parse(contactJson) : contactJson;
		} else {
			const email = this.getNodeParameter('email', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
			contact = { email, ...additionalFields };
		}

		return await notifuseApiRequest.call(this, 'POST', 'contacts.upsert', { contact });
	}

	if (operation === 'import') {
		const contactsJson = this.getNodeParameter('contacts', i) as string;
		const subscribeToListsStr = this.getNodeParameter('subscribeToLists', i, '') as string;
		const contacts = JSON.parse(contactsJson);
		const body: IDataObject = { contacts };
		if (subscribeToListsStr) {
			body.subscribe_to_lists = subscribeToListsStr.split(',').map((s: string) => s.trim());
		}
		return await notifuseApiRequest.call(this, 'POST', 'contacts.import', body);
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
		itemIndex: i,
	});
}

// =====================================================================
//                       TRANSACTIONAL
// =====================================================================

async function executeTransactional(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'send') {
		const notificationId = this.getNodeParameter('notificationId', i) as string;
		const contactEmail = this.getNodeParameter('contactEmail', i) as string;
		const channels = this.getNodeParameter('channels', i) as string[];
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const contact: IDataObject = { email: contactEmail };
		if (additionalFields.contact_first_name) {
			contact.first_name = additionalFields.contact_first_name;
		}
		if (additionalFields.contact_last_name) {
			contact.last_name = additionalFields.contact_last_name;
		}
		if (additionalFields.contact_external_id) {
			contact.external_id = additionalFields.contact_external_id;
		}

		const notification: IDataObject = {
			id: notificationId,
			contact,
			channels,
		};

		if (additionalFields.external_id) {
			notification.external_id = additionalFields.external_id;
		}
		if (additionalFields.data) {
			notification.data = JSON.parse(additionalFields.data as string);
		}
		if (additionalFields.metadata) {
			notification.metadata = JSON.parse(additionalFields.metadata as string);
		}

		const emailOptions: IDataObject = {};
		if (additionalFields.reply_to) emailOptions.reply_to = additionalFields.reply_to;
		if (additionalFields.cc)
			emailOptions.cc = (additionalFields.cc as string).split(',').map((s: string) => s.trim());
		if (additionalFields.bcc)
			emailOptions.bcc = (additionalFields.bcc as string).split(',').map((s: string) => s.trim());

		if (Object.keys(emailOptions).length > 0) {
			notification.email_options = emailOptions;
		}

		return await notifuseApiRequest.call(this, 'POST', 'transactional.send', { notification });
	}

	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const search = this.getNodeParameter('search', i, '') as string;
		const query: IDataObject = {};
		if (search) query.search = search;

		if (returnAll) {
			return await notifuseApiRequestAllItems.call(
				this,
				'GET',
				'transactional.list',
				'notifications',
				{},
				query,
			);
		}

		query.limit = this.getNodeParameter('limit', i) as number;
		const response = await notifuseApiRequest.call(
			this,
			'GET',
			'transactional.list',
			{},
			query,
		);
		return (response.notifications as IDataObject[]) || [];
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('notificationId', i) as string;
		return await notifuseApiRequest.call(this, 'GET', 'transactional.get', {}, { id });
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('notificationId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'transactional.delete', { id });
	}

	if (operation === 'create') {
		const id = this.getNodeParameter('notificationId', i) as string;
		const name = this.getNodeParameter('name', i) as string;
		const channelsConfig = JSON.parse(
			this.getNodeParameter('channelsConfig', i) as string,
		);
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const notification: IDataObject = { id, name, channels: channelsConfig };
		if (additionalFields.description) notification.description = additionalFields.description;
		if (additionalFields.metadata) {
			notification.metadata = JSON.parse(additionalFields.metadata as string);
		}

		return await notifuseApiRequest.call(this, 'POST', 'transactional.create', {
			notification,
		});
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('notificationId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		const updates: IDataObject = {};

		if (updateFields.name) updates.name = updateFields.name;
		if (updateFields.description) updates.description = updateFields.description;
		if (updateFields.channels) updates.channels = JSON.parse(updateFields.channels as string);
		if (updateFields.metadata) updates.metadata = JSON.parse(updateFields.metadata as string);

		return await notifuseApiRequest.call(this, 'POST', 'transactional.update', {
			id,
			updates,
		});
	}

	if (operation === 'testTemplate') {
		const templateId = this.getNodeParameter('templateId', i) as string;
		const integrationId = this.getNodeParameter('integrationId', i) as string;
		const senderId = this.getNodeParameter('senderId', i) as string;
		const recipientEmail = this.getNodeParameter('recipientEmail', i) as string;

		return await notifuseApiRequest.call(this, 'POST', 'transactional.testTemplate', {
			template_id: templateId,
			integration_id: integrationId,
			sender_id: senderId,
			recipient_email: recipientEmail,
		});
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
		itemIndex: i,
	});
}

// =====================================================================
//                         BROADCAST
// =====================================================================

async function executeBroadcast(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
		const query: IDataObject = { ...filters };

		if (returnAll) {
			return await notifuseApiRequestAllItems.call(
				this,
				'GET',
				'broadcasts.list',
				'broadcasts',
				{},
				query,
			);
		}

		query.limit = this.getNodeParameter('limit', i) as number;
		const response = await notifuseApiRequest.call(this, 'GET', 'broadcasts.list', {}, query);
		return (response.broadcasts as IDataObject[]) || [];
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		const withTemplates = this.getNodeParameter('withTemplates', i, false) as boolean;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'broadcasts.get',
			{},
			{ id, with_templates: withTemplates },
		);
	}

	if (operation === 'create') {
		const broadcastData = JSON.parse(
			this.getNodeParameter('broadcastData', i) as string,
		) as IDataObject;
		return await notifuseApiRequest.call(this, 'POST', 'broadcasts.create', broadcastData);
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		const updateData = JSON.parse(
			this.getNodeParameter('updateData', i) as string,
		) as IDataObject;
		updateData.id = id;
		return await notifuseApiRequest.call(this, 'POST', 'broadcasts.update', updateData);
	}

	if (operation === 'schedule') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		const scheduleOptions = this.getNodeParameter('scheduleOptions', i, '{}') as string;
		const body: IDataObject = { id, ...JSON.parse(scheduleOptions) };
		return await notifuseApiRequest.call(this, 'POST', 'broadcasts.schedule', body);
	}

	if (operation === 'pause') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'broadcasts.pause', { id });
	}

	if (operation === 'resume') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'broadcasts.resume', { id });
	}

	if (operation === 'cancel') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'broadcasts.cancel', { id });
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'broadcasts.delete', { id });
	}

	if (operation === 'sendToIndividual') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		const sendData = JSON.parse(
			this.getNodeParameter('sendData', i) as string,
		) as IDataObject;
		sendData.id = id;
		return await notifuseApiRequest.call(this, 'POST', 'broadcasts.sendToIndividual', sendData);
	}

	if (operation === 'getTestResults') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'broadcasts.getTestResults',
			{},
			{ id },
		);
	}

	if (operation === 'selectWinner') {
		const id = this.getNodeParameter('broadcastId', i) as string;
		const templateId = this.getNodeParameter('templateId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'broadcasts.selectWinner', {
			id,
			template_id: templateId,
		});
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
		itemIndex: i,
	});
}

// =====================================================================
//                         TEMPLATE
// =====================================================================

async function executeTemplate(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'list') {
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
		const response = await notifuseApiRequest.call(
			this,
			'GET',
			'templates.list',
			{},
			filters,
		);
		return (response.templates as IDataObject[]) || [];
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('templateId', i) as string;
		const version = this.getNodeParameter('version', i, 1) as number;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'templates.get',
			{},
			{ id, version },
		);
	}

	if (operation === 'create') {
		const templateData = JSON.parse(
			this.getNodeParameter('templateData', i) as string,
		) as IDataObject;
		return await notifuseApiRequest.call(this, 'POST', 'templates.create', templateData);
	}

	if (operation === 'update') {
		const templateData = JSON.parse(
			this.getNodeParameter('templateData', i) as string,
		) as IDataObject;
		return await notifuseApiRequest.call(this, 'POST', 'templates.update', templateData);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('templateId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'templates.delete', { id });
	}

	if (operation === 'compile') {
		const compileData = JSON.parse(
			this.getNodeParameter('compileData', i) as string,
		) as IDataObject;
		return await notifuseApiRequest.call(this, 'POST', 'templates.compile', compileData);
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
		itemIndex: i,
	});
}

// =====================================================================
//                           LIST
// =====================================================================

async function executeList(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'list') {
		const response = await notifuseApiRequest.call(this, 'GET', 'lists.list');
		return (response.lists as IDataObject[]) || [];
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('listId', i) as string;
		return await notifuseApiRequest.call(this, 'GET', 'lists.get', {}, { id });
	}

	if (operation === 'create') {
		const listData = JSON.parse(
			this.getNodeParameter('listData', i) as string,
		) as IDataObject;
		return await notifuseApiRequest.call(this, 'POST', 'lists.create', listData);
	}

	if (operation === 'update') {
		const listData = JSON.parse(
			this.getNodeParameter('listData', i) as string,
		) as IDataObject;
		return await notifuseApiRequest.call(this, 'POST', 'lists.update', listData);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('listId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'lists.delete', { id });
	}

	if (operation === 'stats') {
		const listId = this.getNodeParameter('listId', i) as string;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'lists.stats',
			{},
			{ list_id: listId },
		);
	}

	if (operation === 'subscribe') {
		const contactEmail = this.getNodeParameter('contactEmail', i) as string;
		const listIdsStr = this.getNodeParameter('listIds', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const contact: IDataObject = { email: contactEmail };
		if (additionalFields.first_name) contact.first_name = additionalFields.first_name;
		if (additionalFields.last_name) contact.last_name = additionalFields.last_name;

		const listIds = listIdsStr.split(',').map((s: string) => s.trim());

		return await notifuseApiRequest.call(this, 'POST', 'lists.subscribe', {
			contact,
			list_ids: listIds,
		});
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
		itemIndex: i,
	});
}

// =====================================================================
//                       CONTACT LIST
// =====================================================================

async function executeContactList(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getByIds') {
		const email = this.getNodeParameter('email', i) as string;
		const listId = this.getNodeParameter('listId', i) as string;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'contactLists.getByIDs',
			{},
			{ email, list_id: listId },
		);
	}

	if (operation === 'getContactsByList') {
		const listId = this.getNodeParameter('listId', i) as string;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'contactLists.getContactsByList',
			{},
			{ list_id: listId },
		);
	}

	if (operation === 'getListsByContact') {
		const email = this.getNodeParameter('email', i) as string;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'contactLists.getListsByContact',
			{},
			{ email },
		);
	}

	if (operation === 'updateStatus') {
		const email = this.getNodeParameter('email', i) as string;
		const listId = this.getNodeParameter('listId', i) as string;
		const status = this.getNodeParameter('status', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'contactLists.updateStatus', {
			contact_list: { email, list_id: listId, status },
		});
	}

	if (operation === 'removeContact') {
		const email = this.getNodeParameter('email', i) as string;
		const listId = this.getNodeParameter('listId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'contactLists.removeContact', {
			email,
			list_id: listId,
		});
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
		itemIndex: i,
	});
}

// =====================================================================
//                   WEBHOOK SUBSCRIPTION
// =====================================================================

async function executeWebhookSubscription(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'list') {
		return await notifuseApiRequest.call(this, 'GET', 'webhookSubscriptions.list');
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('subscriptionId', i) as string;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'webhookSubscriptions.get',
			{},
			{ id },
		);
	}

	if (operation === 'create') {
		const name = this.getNodeParameter('name', i) as string;
		const url = this.getNodeParameter('url', i) as string;
		const eventTypes = this.getNodeParameter('eventTypes', i) as string[];
		return await notifuseApiRequest.call(this, 'POST', 'webhookSubscriptions.create', {
			name,
			url,
			event_types: eventTypes,
		});
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('subscriptionId', i) as string;
		const name = this.getNodeParameter('name', i, '') as string;
		const url = this.getNodeParameter('url', i, '') as string;
		const eventTypes = this.getNodeParameter('eventTypes', i, []) as string[];
		const enabled = this.getNodeParameter('enabled', i, true) as boolean;
		return await notifuseApiRequest.call(this, 'POST', 'webhookSubscriptions.update', {
			id,
			name,
			url,
			event_types: eventTypes,
			enabled,
		});
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('subscriptionId', i) as string;
		return await notifuseApiRequest.call(this, 'POST', 'webhookSubscriptions.delete', {
			id,
		});
	}

	if (operation === 'toggle') {
		const id = this.getNodeParameter('subscriptionId', i) as string;
		const enabled = this.getNodeParameter('enabled', i) as boolean;
		return await notifuseApiRequest.call(this, 'POST', 'webhookSubscriptions.toggle', {
			id,
			enabled,
		});
	}

	if (operation === 'regenerateSecret') {
		const id = this.getNodeParameter('subscriptionId', i) as string;
		return await notifuseApiRequest.call(
			this,
			'POST',
			'webhookSubscriptions.regenerateSecret',
			{ id },
		);
	}

	if (operation === 'getDeliveries') {
		const subscriptionId = this.getNodeParameter('subscriptionId', i, '') as string;
		const limit = this.getNodeParameter('limit', i, 20) as number;
		const offset = this.getNodeParameter('offset', i, 0) as number;
		const query: IDataObject = { limit, offset };
		if (subscriptionId) query.subscription_id = subscriptionId;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'webhookSubscriptions.deliveries',
			{},
			query,
		);
	}

	if (operation === 'sendTest') {
		const id = this.getNodeParameter('subscriptionId', i) as string;
		const eventType = this.getNodeParameter('eventType', i, '') as string;
		return await notifuseApiRequest.call(this, 'POST', 'webhookSubscriptions.test', {
			id,
			event_type: eventType,
		});
	}

	if (operation === 'getEventTypes') {
		return await notifuseApiRequest.call(this, 'GET', 'webhookSubscriptions.eventTypes');
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
		itemIndex: i,
	});
}

// =====================================================================
//                       CUSTOM EVENT
// =====================================================================

async function executeCustomEvent(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const eventName = this.getNodeParameter('eventName', i) as string;
		const externalId = this.getNodeParameter('externalId', i) as string;
		return await notifuseApiRequest.call(
			this,
			'GET',
			'customEvents.get',
			{},
			{ event_name: eventName, external_id: externalId },
		);
	}

	if (operation === 'list') {
		const email = this.getNodeParameter('email', i, '') as string;
		const eventName = this.getNodeParameter('eventName', i, '') as string;
		const limit = this.getNodeParameter('limit', i, 50) as number;
		const query: IDataObject = { limit };
		if (email) query.email = email;
		if (eventName) query.event_name = eventName;
		return await notifuseApiRequest.call(this, 'GET', 'customEvents.list', {}, query);
	}

	if (operation === 'upsert') {
		const eventData = JSON.parse(
			this.getNodeParameter('eventData', i) as string,
		) as IDataObject;
		return await notifuseApiRequest.call(this, 'POST', 'customEvents.upsert', eventData);
	}

	if (operation === 'import') {
		const events = JSON.parse(
			this.getNodeParameter('events', i) as string,
		) as IDataObject;
		return await notifuseApiRequest.call(this, 'POST', 'customEvents.import', events);
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
		itemIndex: i,
	});
}
