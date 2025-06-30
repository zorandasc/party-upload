"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        toast.error(error || "Login failed");
        return;
      }
      toast.success("Dobro došli!");
      //This ensures the whole app (including NavbarBottom) 
      // remounts and re-fetches /api/me.
      window.location.href = "/";
      //router.push("/");
    } catch (err) {
      console.log("Something went wrong", err);
      setError("Something went wrong");
      toast.error(error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.ribbon}>
        <span className={styles.ribbonInside}>Dobro došli</span>
      </div>
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          ></input>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          ></input>
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
