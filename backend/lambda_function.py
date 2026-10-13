import json
import os
import uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body, default=str)
    }


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    path = event.get("rawPath", "/")
    path_parameters = event.get("pathParameters") or {}

    try:
        if method == "POST" and path == "/tickets":
            body = json.loads(event.get("body") or "{}")
            title = str(body.get("title", "")).strip()
            description = str(body.get("description", "")).strip()

            if not title or len(title) > 120:
                return response(
                    400,
                    {"error": "Title is required and must be under 120 characters"}
                )
            if len(description) > 2000:
                return response(400, {"error": "Description is too long"})

            ticket = {
                "ticketId": str(uuid.uuid4()),
                "title": title,
                "description": description,
                "status": "OPEN",
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            table.put_item(Item=ticket)
            return response(201, ticket)

        if method == "GET" and path == "/tickets":
            result = table.scan(Limit=100)
            return response(200, {"tickets": result.get("Items", [])})

        if method == "PATCH" and path.startswith("/tickets/"):
            ticket_id = path_parameters.get("ticketId")
            if not ticket_id:
                ticket_id = path.rsplit("/", 1)[-1]

            body = json.loads(event.get("body") or "{}")
            status = body.get("status")
            if status not in ["OPEN", "IN_PROGRESS", "CLOSED"]:
                return response(
                    400,
                    {"error": "Status must be OPEN, IN_PROGRESS, or CLOSED"}
                )

            result = table.update_item(
                Key={"ticketId": ticket_id},
                UpdateExpression="SET #s = :s",
                ExpressionAttributeNames={"#s": "status"},
                ExpressionAttributeValues={":s": status},
                ConditionExpression="attribute_exists(ticketId)",
                ReturnValues="ALL_NEW"
            )
            return response(200, result["Attributes"])

        return response(404, {"error": "Route not found"})

    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "")
        if code == "ConditionalCheckFailedException":
            return response(404, {"error": "Ticket not found"})
        print("AWS service error:", code)
        return response(500, {"error": "Internal server error"})
    except (ValueError, TypeError):
        return response(400, {"error": "Invalid request"})
