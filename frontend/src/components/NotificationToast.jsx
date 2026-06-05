import { useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

export default function NotificationToast() {
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
  if (!token) return;

  //Force explicit websocket transports to bypass server proxy locks
  const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log(' Frontend WebSocket tunnel successfully opened!');
  });

  socket.on('notification', (data) => {
    console.log('Live notification packet received:', data); // Log to catch data layout
    const uniqueAlert = {
      id: Date.now(),
      title: data.title,
      message: data.message
    };
    setAlerts((prev) => [uniqueAlert, ...prev]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((item) => item.id !== uniqueAlert.id));
    }, 5000);
  });

  return () => {
    socket.disconnect();
  };
}, [token]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col space-y-1 transform animate-slide-in transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-emerald-400">
              {alert.title}
            </span>
            <button 
              onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
              className="text-slate-400 hover:text-white text-[10px] font-bold px-1"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {alert.message}
          </p>
        </div>
      ))}
    </div>
  );
}