import React, { useEffect, useState } from "react";
import { Chart } from "react-chartjs-2";
import { supabase } from "../../lib/supabase";
import { Notification } from "../../types/notification";

const NotificationsMonitor: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<{ sender?: string; recipient?: string; type?: string }>({});

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  async function fetchNotifications() {
    let q = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter.sender) q = q.eq("sender_id", filter.sender);
    if (filter.recipient) q = q.eq("recipient_id", filter.recipient);
    if (filter.type) q = q.eq("type", filter.type);
    const { data, error } = await q;
    if (!error && data) setNotifications(data);
  }

  // Metrics: total sent per week, avg unread, most active users
  const weeklyCounts = {} as Record<string, number>;
  const unreadCount = notifications.filter(n=>!n.read).length;
  const senderFrequency = {} as Record<string, number>;
  notifications.forEach(n=>{
    const week = n.created_at ? new Date(n.created_at).toISOString().slice(0,7) : '';
    weeklyCounts[week] = (weeklyCounts[week]||0) + 1;
    senderFrequency[n.sender_id] = (senderFrequency[n.sender_id]||0) + 1;
  });
  const topSenders = Object.entries(senderFrequency).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return (
    <div className="space-y-10">
      <h2 className="text-xl font-bold">Notifications Monitor</h2>
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow text-center dark:bg-gray-800">
          <div className="text-lg">Total Sent</div>
          <div className="text-2xl font-bold">{notifications.length}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow text-center dark:bg-gray-800">
          <div className="text-lg">Unread Avg</div>
          <div className="text-2xl font-bold">{unreadCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow text-center dark:bg-gray-800">
          <div className="text-lg">Top Senders</div>
          <div className="text-base">{topSenders.map(([s,v])=> <div key={s}>{s}: {v}</div>)}</div>
        </div>
      </div>
      {/* Weekly Chart */}
      <div className="bg-white rounded-xl shadow dark:bg-gray-800 p-4">
        <Chart
          type="bar"
          data={{
            labels: Object.keys(weeklyCounts),
            datasets: [{
              label: "Notifications/wk",
              data: Object.values(weeklyCounts),
              backgroundColor: "#22C55E"
            }]
          }}
        />
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Sender</th>
              <th className="text-left p-2">Recipient</th>
              <th className="text-left p-2">Message</th>
              <th className="text-left p-2">Read</th>
              <th className="text-left p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n=>(
              <tr key={n.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-2">{n.type}</td>
                <td className="p-2">{n.sender_id}</td>
                <td className="p-2">{n.recipient_id}</td>
                <td className="p-2 truncate max-w-xs">{n.message}</td>
                <td className="p-2">{n.read ? "Yes" : "No"}</td>
                <td className="p-2">{new Date(n.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationsMonitor;
