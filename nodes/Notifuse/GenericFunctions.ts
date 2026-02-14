import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import * as crypto from 'crypto';

/**
 * Make an authenticated request to the Notifuse API.
 *
 * - POST endpoints: workspace_id is injected into the request body.
 * - GET endpoints: workspace_id is injected as a query parameter.
 * - Retries up to 3 times for 5xx errors and network timeouts with exponential backoff.
 * - Handles 429 rate limiting with retry-after.
 */
export async function notifuseApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('notifuseApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');
	const workspaceId = credentials.workspaceId as string;

	const url = `${baseUrl}/api/${endpoint}`;

	if (method === 'POST') {
		if (!body.workspace_id) {
			body.workspace_id = workspaceId;
		}
	} else {
		if (!query.workspace_id) {
			query.workspace_id = workspaceId;
		}
	}

	const maxRetries = 3;
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'notifuseApi',
				{
					method,
					url,
					body: method === 'POST' ? body : undefined,
					qs: query,
					json: true,
					timeout: 30000,
				},
			);
			return response as IDataObject;
		} catch (error: unknown) {
			lastError = error as Error;
			const statusCode = (error as JsonObject)?.statusCode as number | undefined;

			// Rate limiting - respect retry-after header
			if (statusCode === 429) {
				const retryAfter = ((error as JsonObject)?.headers as IDataObject)?.['retry-after'];
				const waitMs = retryAfter ? Number(retryAfter) * 1000 : 5000;
				if (attempt < maxRetries) {
					await sleep(waitMs);
					continue;
				}
			}

			// Retry on 5xx errors
			if (statusCode && statusCode >= 500 && attempt < maxRetries) {
				await sleep(Math.pow(2, attempt) * 1000);
				continue;
			}

			// Don't retry 4xx errors (except 429 above)
			if (statusCode && statusCode >= 400 && statusCode < 500) {
				throw new NodeApiError(this.getNode(), error as JsonObject, {
					message: extractErrorMessage(error),
				});
			}

			// Retry network errors
			if (!statusCode && attempt < maxRetries) {
				await sleep(Math.pow(2, attempt) * 1000);
				continue;
			}

			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: extractErrorMessage(error),
			});
		}
	}

	throw new NodeApiError(this.getNode(), lastError as unknown as JsonObject, {
		message: `Request failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
	});
}

/**
 * Fetch all items from a paginated Notifuse endpoint.
 *
 * Handles both cursor-based (contacts) and offset/limit pagination.
 */
export async function notifuseApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	dataKey: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let hasMore = true;

	// Determine pagination style based on endpoint
	const usesCursor = endpoint === 'contacts.list';

	if (usesCursor) {
		// Cursor-based pagination
		while (hasMore) {
			const response = await notifuseApiRequest.call(this, method, endpoint, body, query);
			const items = (response[dataKey] as IDataObject[]) || [];
			returnData.push(...items);

			const nextCursor = response.next_cursor as string | undefined;
			if (nextCursor && items.length > 0) {
				query.cursor = nextCursor;
			} else {
				hasMore = false;
			}
		}
	} else {
		// Offset/limit pagination
		query.limit = query.limit || 100;
		query.offset = query.offset || 0;

		while (hasMore) {
			const response = await notifuseApiRequest.call(this, method, endpoint, body, query);
			const items = (response[dataKey] as IDataObject[]) || [];
			returnData.push(...items);

			if (items.length < (query.limit as number)) {
				hasMore = false;
			} else {
				query.offset = (query.offset as number) + items.length;
			}
		}
	}

	return returnData;
}

/**
 * Verify a Notifuse webhook signature using the Standard Webhooks spec.
 *
 * The signature format is: v1,{base64-encoded-hmac-sha256}
 * The signed content is: {msgID}.{timestamp}.{payload}
 *
 * Headers used:
 * - webhook-id: The message ID
 * - webhook-timestamp: Unix timestamp
 * - webhook-signature: v1,{base64-signature}
 */
export function verifyWebhookSignature(
	payload: string,
	webhookId: string,
	webhookTimestamp: string,
	webhookSignature: string,
	secret: string,
): boolean {
	const signedContent = `${webhookId}.${webhookTimestamp}.${payload}`;
	const hmacDigest = crypto
		.createHmac('sha256', secret)
		.update(signedContent)
		.digest('base64');
	const expectedSignature = `v1,${hmacDigest}`;

	// Constant-time comparison to prevent timing attacks
	const expected = Buffer.from(expectedSignature);
	const actual = Buffer.from(webhookSignature);
	if (expected.length !== actual.length) {
		return false;
	}
	try {
		return crypto.timingSafeEqual(new Uint8Array(expected), new Uint8Array(actual));
	} catch {
		return false;
	}
}

function extractErrorMessage(error: unknown): string {
	const err = error as IDataObject;
	if (err.message) return err.message as string;
	if (err.description) return err.description as string;
	const body = err.body as IDataObject | undefined;
	if (body?.error) return body.error as string;
	if (body?.message) return body.message as string;
	return 'An unknown error occurred';
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
