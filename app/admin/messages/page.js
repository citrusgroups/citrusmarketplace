"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState([]);

    const getMessages = async () => {
        const res = await fetch("/api/admin/messages");
        const data = await res.json();

        if (res.ok) setMessages(data.messages || []);
    };

    useEffect(() => {
        getMessages();
    }, []);

    const markRead = async (id) => {
        const res = await fetch("/api/admin/messages", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: "read" }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Update failed");
            return;
        }

        toast.success("Marked as read");
        getMessages();
    };

    const deleteMessage = async (id) => {
        if (!confirm("Delete this message?")) return;

        const res = await fetch("/api/admin/messages", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Delete failed");
            return;
        }

        toast.success("Message deleted");
        getMessages();
    };

    return (
        <section className="w-full">
            <h1 className="inter text-[28px] font-semibold sm:text-[32px]">
                Contact Messages
            </h1>

            <div className="mt-8 grid gap-4">
                {messages.length === 0 ? (
                    <div className="rounded bg-white p-6 shadow">
                        No messages found.
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="rounded bg-white p-5 shadow">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-semibold">{msg.name}</h3>
                                    <p className="text-sm text-black/50">{msg.email}</p>
                                    <p className="text-sm text-black/50">{msg.phone}</p>
                                </div>

                                <span
                                    className={`w-fit rounded px-3 py-1 text-xs text-white ${msg.status === "read" ? "bg-green-500" : "bg-red-500"
                                        }`}
                                >
                                    {msg.status}
                                </span>
                            </div>

                            <p className="mt-4 text-black/80">{msg.message}</p>

                            <p className="mt-3 text-sm text-black/40">
                                {msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleString()
                                    : "-"}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                {msg.status !== "read" && (
                                    <button
                                        onClick={() => markRead(msg.id)}
                                        className="rounded bg-black px-4 py-2 text-white"
                                    >
                                        Mark Read
                                    </button>
                                )}

                                <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="rounded bg-red-500 px-4 py-2 text-white"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}