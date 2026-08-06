"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "./icons";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

/**
 * Newsletter subscribe form — POSTs to /api/newsletter and surfaces the three
 * distinct responses the API returns: 201 (subscribed), 409 (already on the
 * list), 400/other (error). Used by both the desktop and mobile Newsletter
 * layouts; styling is passed in so each variant keeps its own look.
 */
export default function SubscribeForm({
  id,
  wrapperClass = "",
  formClass,
  inputClass,
  buttonClass,
  buttonLabel = "Subscribe",
  placeholder = "Enter your email",
  messageClass = "mt-2 text-[13px]",
}: {
  id: string;
  wrapperClass?: string;
  formClass: string;
  inputClass: string;
  buttonClass: string;
  buttonLabel?: string;
  placeholder?: string;
  messageClass?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.status === 201) {
        setStatus("success");
        setMsg("You're subscribed — thanks!");
        setEmail("");
      } else if (res.status === 409) {
        setStatus("duplicate");
        setMsg("You're already on the list.");
      } else {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setStatus("error");
        setMsg(data?.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Try again.");
    }
  }

  const statusColor =
    status === "success"
      ? "text-leaf"
      : status === "duplicate"
        ? "text-bronze"
        : status === "error"
          ? "text-red-600"
          : "";

  return (
    <div className={wrapperClass}>
      <form className={formClass} onSubmit={onSubmit}>
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          disabled={status === "loading"}
        />
        <button
          type="submit"
          className={buttonClass}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Subscribing…" : buttonLabel}
          {status !== "loading" && <ArrowRight size={14} />}
        </button>
      </form>
      {msg && (
        <p role="status" className={`${messageClass} ${statusColor}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
