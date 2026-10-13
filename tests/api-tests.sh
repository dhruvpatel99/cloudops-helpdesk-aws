#!/usr/bin/env bash
# Smoke tests for the CloudOps Helpdesk API.
# Usage: API_URL="https://<api-id>.execute-api.ap-south-1.amazonaws.com" ./tests/api-tests.sh
set -euo pipefail

: "${API_URL:?Set API_URL to your API Gateway invoke URL}"
API_URL="${API_URL%/}"

echo "1) GET /tickets (expect 200)"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" "$API_URL/tickets"

echo "2) POST /tickets (expect 201)"
created=$(curl -s -X POST "$API_URL/tickets" \
  -H "Content-Type: application/json" \
  -d '{"title":"Smoke test ticket","description":"Created by tests/api-tests.sh"}')
ticket_id=$(printf '%s' "$created" | python3 -c 'import json,sys; print(json.load(sys.stdin)["ticketId"])')
echo "   created ticketId: $ticket_id"

echo "3) PATCH /tickets/{id} to CLOSED (expect 200)"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" -X PATCH "$API_URL/tickets/$ticket_id" \
  -H "Content-Type: application/json" -d '{"status":"CLOSED"}'

echo "4) PATCH with an invalid status (expect 400)"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" -X PATCH "$API_URL/tickets/$ticket_id" \
  -H "Content-Type: application/json" -d '{"status":"DONE"}'

echo "5) PATCH a ticket that does not exist (expect 404)"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" -X PATCH "$API_URL/tickets/does-not-exist" \
  -H "Content-Type: application/json" -d '{"status":"CLOSED"}'
