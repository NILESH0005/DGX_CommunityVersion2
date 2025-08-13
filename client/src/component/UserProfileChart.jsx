import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
// Register necessary Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const UserProfileChart = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Views',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        backgroundColor: 'rgba(1, 61, 84, 0.4)', // DGXblue background color with opacity
        borderColor: '#013D54', // DGXblue border color
      },
      {
        label: 'Connections',
        data: [28, 48, 40, 19, 86, 27, 90],
        fill: false,
        backgroundColor: 'rgba(118, 185, 0, 0.4)', // DGXgreen background color with opacity
        borderColor: '#76B900', // DGXgreen border color
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Ensure the chart fills the container
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Profile Statistics',
      },
    },
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 lg:p-10 my-4 border border-DGXgreen w-full max-w-full md:max-w-4xl lg:max-w-3xl xl:max-w-2xl">
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default UserProfileChart;
