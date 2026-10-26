"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/admin-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="card flex flex-col gap-4 p-5">
      <h1 className="m-0 font-heading text-[22px] font-bold">Operator login</h1>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" autoFocus autoComplete="current-password" />
      </div>
      {state?.error && <p className="m-0 text-sm text-[#B42318]">{state.error}</p>}
      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Checking" : "Log in"}
      </button>
    </form>
  );
}
