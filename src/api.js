
const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://j6hxz2wpt8.execute-api.ap-south-1.amazonaws.com"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  let res;

  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Could not reach the API. Check your connection and API Gateway CORS settings."
    );
  }

  const raw = await res.text();
  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw };
  }

  if (!res.ok) {
    throw new Error(
      data.error || data.message || `Request failed (${res.status})`
    );
  }

  return data;
}

export const getTickets = () => request("/tickets");

export const createTicket = (ticket) =>
  request("/tickets", {
    method: "POST",
    body: JSON.stringify(ticket),
  });

export const updateTicketStatus = (ticketId, status) =>
  request(`/tickets/${encodeURIComponent(ticketId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
