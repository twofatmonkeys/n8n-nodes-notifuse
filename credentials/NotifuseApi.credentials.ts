import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NotifuseApi implements ICredentialType {
	name = 'notifuseApi';

	displayName = 'Notifuse API';

	documentationUrl = 'https://docs.notifuse.com/api-reference';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://notifuse.example.com',
			description:
				'The URL of your Notifuse instance. No trailing slash. Notifuse is self-hosted, so this must point to your deployment.',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Workspace API key (JWT Bearer token). Found in Workspace Settings → Team → Create API Key.',
			required: true,
		},
		{
			displayName: 'Workspace ID',
			name: 'workspaceId',
			type: 'string',
			default: '',
			description: 'The workspace ID to operate against. Sent as workspace_id in API requests.',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/contacts.list',
			method: 'GET',
			qs: {
				workspace_id: '={{$credentials.workspaceId}}',
				limit: '1',
			},
			timeout: 10000,
		},
	};
}
