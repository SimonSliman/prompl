# API Reference for Prompl

This document serves as the definitive guide for developers to interact with Prompl's APIs, detailing the functionalities and how to effectively leverage them for integrating Prompl within various applications.

## Overview

The Prompl API is the backbone of our platform, enabling developers to programmatically interact with the core functionalities of Prompl. Designed to provide a flexible, powerful interface to Prompl’s language processing capabilities, it facilitates the integration with a variety of AI and LLM services. Through the Prompl API, you can send prompts, receive responses, and harness the full power of Prompl’s language-agnostic framework for building custom applications, integrating with existing systems, or automating workflows. Key aspects include scalability, flexibility, simplicity, and security.

## Authentication

The Prompl API requires authentication to ensure secure access to its features. Below are the methods available for obtaining and managing your API tokens.

### Temporary Authentication Method

Until the Prompl dashboard is fully operational, API tokens can be obtained through a manual request process:
1. **Request a Token**: Send an email to `simon@yamnalabs.com` with the subject line "Prompl API Token Request".
2. **Verification**: Our team will verify your account details and eligibility for API access.
3. **Token Delivery**: Once verified, a unique API token will be securely generated and sent to your email address, along with instructions on how to use it.

### Web Dashboard (Coming Soon)

We are developing a dedicated web dashboard for an enhanced user experience, including features like dashboard registration, token generation, and token management. Detailed instructions and support will be provided upon its release.

### Using Your API Token

Authenticate your API requests by including the token in the header:

Authorization: Bearer YOUR_API_TOKEN

Replace `YOUR_API_TOKEN` with the token you received. This header must be included in every API call.

## Endpoints

The Prompl API offers a variety of endpoints to interact with different functionalities of the platform. 

### Example Endpoint: Summarize Text

- **Purpose**: Summarizes a given text into key points or a concise form.
- **URL**: `/api/summarize`
- **Method**: `POST`
- **Data Parameters**:

{
"text": "The long text you want to summarize...",
"summary_length": "short" // Options: short, medium, long
}

- **Success Response**:

{
"status": "success",
"summary": "The summarized text..."
}

- **Sample Call**:

curl -X POST https://prompl.com/api/summarize
-H "Authorization: Bearer YOUR_API_TOKEN"
-H "Content-Type: application/json"
-d '{"text":"The long text you want to summarize...", "summary_length":"short"}'


## Error Codes

Prompl API uses standard HTTP status codes to indicate the success or failure of an API request, including `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, and `500 Internal Server Error`.

## Rate Limits

To ensure fair usage, the Prompl API enforces rate limits: 1000 requests per hour per API token. Exceeding this rate results in a `429 Too Many Requests` status code.

## Changelog

The Prompl API is continually evolving. This section will track changes to the API, including new endpoints, deprecated features, and updates to existing endpoints. Stay tuned for regular updates to ensure your applications remain compatible and take advantage of the latest features.

Updates to this API reference will be made as new features are developed and existing features are refined. Your feedback is invaluable for improving this resource.

## Code Examples

To assist you in making API calls, here are some code examples in different programming languages.

### Python Example

```python
import requests

api_url = "https://prompl.org/api/summarize"
headers = {"Authorization": "Bearer YOUR_API_TOKEN"}
data = {"text": "The long text you want to summarize...", "summary_length": "short"}

response = requests.post(api_url, headers=headers, json=data)
print(response.json())





