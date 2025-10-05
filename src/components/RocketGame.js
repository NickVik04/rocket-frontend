import React, { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function RocketGame() {
  const [bet, setBet] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState("Idle");
  const [message, setMessage] = useState("");

  const intervalRef = useRef(null);

  const startGame = async () => {
    try {
      await axios.post("https://rocket-backend-62wj.onrender.com/game/start?bet=" + bet);
      setStatus("Running");
      setMultiplier(1.0);
      setMessage("");

      intervalRef.current = setInterval(() => tickGame(), 200); // faster updates
    } catch (err) {
      console.error(err);
    }
  };

  const tickGame = async () => {
    try {
      const res = await axios.post("https://rocket-backend-62wj.onrender.com/game/tick");
      setMultiplier(res.data.multiplier);

      if (!res.data.running) {
        clearInterval(intervalRef.current);
        setStatus("Crashed");
        setMessage("💥 Rocket crashed at " + res.data.crashPoint.toFixed(2) + "x");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cashOut = async () => {
    try {
      const res = await axios.post("https://rocket-backend-62wj.onrender.com/game/cashout");
      setMessage(res.data);
      setStatus("Cashed Out");
      clearInterval(intervalRef.current);
    } catch (err) {
      console.error(err);
    }
  };

  // Status colors
  const statusColor = {
    Idle: "#333",
    Running: "#4caf50",
    Crashed: "#f44336",
    "Cashed Out": "#ff9800"
  }[status];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#121212", color: "#fff", fontFamily: "Arial, sans-serif", flexDirection: "column" }}>
      <div style={{ background: "#1e1e1e", padding: "30px", borderRadius: "15px", textAlign: "center", width: "350px", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }}>
        <h1>🚀 Rocket Crash Game</h1>
        <p style={{ margin: "15px 0" }}>
          Bet Amount: 
          <input 
            type="number" 
            value={bet} 
            onChange={(e) => setBet(Number(e.target.value))} 
            style={{ marginLeft: "10px", padding: "5px", width: "80px", borderRadius: "5px", border: "none" }} 
          />
        </p>
        <div style={{ margin: "15px 0" }}>
          <button onClick={startGame} disabled={status === "Running"} style={{ padding: "10px 20px", marginRight: "10px", borderRadius: "8px", border: "none", background: "#4caf50", color: "#fff", cursor: "pointer", opacity: status === "Running" ? 0.6 : 1 }}>
            Start
          </button>
          <button onClick={cashOut} disabled={status !== "Running"} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#f44336", color: "#fff", cursor: "pointer", opacity: status !== "Running" ? 0.6 : 1 }}>
            Cash Out
          </button>
        </div>

        <h2 style={{ fontSize: "2em", color: "#ffd700" }}>Multiplier: {multiplier.toFixed(2)}x</h2>
        <h3 style={{ color: statusColor }}>Status: {status}</h3>
        <p style={{ fontSize: "1em", color: "#bbb" }}>{message}</p>

        <motion.div
          animate={{ y: status === "Running" ? -multiplier * 25 : 0 }}
          transition={{ type: "spring", stiffness: 50 }}
          style={{
            fontSize: "50px",
            marginTop: "40px",
            display: "inline-block"
          }}
        >
          🚀
        </motion.div>
      </div>
    </div>
  );
}

export default RocketGame;
