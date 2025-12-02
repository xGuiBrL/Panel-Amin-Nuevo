import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardChart({ labels = [], datasets = [] }) {
  const data = {
    labels,
    datasets: datasets.map((d, i) => ({
      label: d.label,
      data: d.data,
      backgroundColor: d.backgroundColor || ['rgba(242,73,40,0.9)'],
      borderRadius: 8,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: false,
      },
      tooltip: { enabled: true }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(22,13,78,0.06)' } }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border p-4 h-72 md:h-96">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[color:var(--color-secondary)]">Resumen</h3>
        <div className="text-xs text-gray-500">Últimos datos</div>
      </div>
      <div className="w-full h-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
