import "./admin.css";
import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  AlertCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { getTickets, updateTicketStatus } from "./api";

const STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED"];

function Admin() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");
  const [selected, setSelected] = useState(null);

  async function loadTickets() {
    setLoading(true);
    setError("");

    try {
      const result = await getTickets();
      setTickets(
        Array.isArray(result) ? result : result.tickets || []
      );
    } catch (err) {
      setError(err.message || "Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const counts = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      progress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length,
    }),
    [tickets]
  );

  const filtered = tickets.filter((t) => {
    const term = search.toLowerCase();

    const matchesSearch =
      String(t.title || "").toLowerCase().includes(term) ||
      String(t.description || "").toLowerCase().includes(term) ||
      String(t.ticketId || "").toLowerCase().includes(term);

    return (
      matchesSearch &&
      (filter === "ALL" || t.status === filter)
    );
  });

  async function changeStatus(ticketId, status) {
    setUpdating(ticketId);
    setError("");

    try {
      await updateTicketStatus(ticketId, status);

      setTickets((current) =>
        current.map((ticket) =>
          ticket.ticketId === ticketId
            ? { ...ticket, status }
            : ticket
        )
      );

      setSelected((current) =>
        current?.ticketId === ticketId
          ? { ...current, status }
          : current
      );
    } catch (err) {
      setError(err.message || "Could not update ticket status.");
      await loadTickets();
    } finally {
      setUpdating("");
    }
  }

  const metrics = [
    {
      label: "Total Tickets",
      value: counts.total,
      icon: Ticket,
      color: "bg-slate-100 text-slate-700",
    },
    {
      label: "Open Tickets",
      value: counts.open,
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "In Progress",
      value: counts.progress,
      icon: Activity,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Resolved",
      value: counts.closed,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-700 p-2.5 text-white shadow-sm">
              <ShieldCheck size={25} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                CloudOps <span className="text-blue-700">Admin</span>
              </h1>
              <p className="text-xs text-slate-500">
                Helpdesk Management Console
              </p>
            </div>
          </div>

          <button
            onClick={loadTickets}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-7">
          <p className="mb-1 text-xs font-bold tracking-[0.18em] text-blue-700">
            OPERATIONS OVERVIEW
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Support Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Monitor requests, review issues, and manage ticket progress.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {label}
                </span>

                <span className={`rounded-xl p-2.5 ${color}`}>
                  <Icon size={20} />
                </span>
              </div>

              <p className="text-3xl font-bold tracking-tight">
                {value}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold">All Support Tickets</h3>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} ticket(s) displayed
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Search size={17} className="text-slate-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full py-2.5 text-sm outline-none sm:w-48"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="ALL">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-14 text-center">
              <RefreshCw
                size={26}
                className="mx-auto mb-3 animate-spin text-blue-700"
              />
              <p className="text-sm text-slate-500">
                Loading support tickets...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center">
              <Ticket
                size={34}
                className="mx-auto mb-3 text-slate-300"
              />
              <p className="font-semibold">No tickets found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Ticket</th>
                    <th className="px-5 py-4 font-semibold">Description</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Change Status</th>
                    <th className="px-5 py-4 font-semibold">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((ticket) => (
                    <tr
                      key={ticket.ticketId}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="min-w-36 font-semibold text-slate-900">
                          {ticket.title || "Untitled ticket"}
                        </p>
                        <p className="mt-1 font-mono text-xs text-slate-400">
                          {String(ticket.ticketId || "").slice(0, 8)}
                        </p>
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <p className="line-clamp-2">
                          {ticket.description || "No description"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ticket.status === "CLOSED"
                              ? "bg-emerald-50 text-emerald-700"
                              : ticket.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {(ticket.status || "OPEN").replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="relative min-w-36">
                          <select
                            value={ticket.status || "OPEN"}
                            disabled={updating === ticket.ticketId}
                            onChange={(e) =>
                              changeStatus(ticket.ticketId, e.target.value)
                            }
                            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs font-medium outline-none focus:border-blue-500 disabled:opacity-50"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.replace("_", " ")}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>

                        {updating === ticket.ticketId && (
                          <p className="mt-1 text-xs text-blue-600">
                            Saving...
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelected(ticket)}
                          className="rounded-lg px-2 py-1 font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>
            <strong>Security notice:</strong> This dashboard does not yet
            enforce administrator authentication. Protect the API with
            authentication and backend authorization before production use.
          </p>
        </div>

        <footer className="py-7 text-center text-xs text-slate-400">
          CloudOps Helpdesk · Admin Console
        </footer>
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Ticket Details
                </p>
                <h3 className="mt-1 text-xl font-bold">
                  {selected.title || "Untitled ticket"}
                </h3>
              </div>

              <button
                onClick={() => setSelected(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mb-2 text-sm font-semibold">Description</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {selected.description || "No description provided."}
            </p>

            <div className="mt-5 rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Ticket ID</p>
              <p className="mt-1 break-all font-mono text-xs">
                {selected.ticketId}
              </p>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Current status:{" "}
              <strong className="text-slate-900">
                {(selected.status || "OPEN").replace("_", " ")}
              </strong>
            </p>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Admin />
  </StrictMode>
);
