// import { Chart } from "react-google-charts";

// function LineGraph() {
//   const data = [
//     ["Year", "Sales", "Expenses"],
//     ["2004", 1000, 400],
//     ["2005", 1170, 460],
//     ["2006", 660, 1120],
//     ["2007", 1030, 540],
//   ];
//   const options = {
//     title: "Company Performance",
//     curveType: "function",
//     legend: { position: "bottom" },
//     backgroundColor: "var(--secondary-accent-color)",
//   };
//   return (
//     <Chart
//       chartType="LineChart"
//       width="100%"
//       height="100%"
//       data={data}
//       options={options}
//     />
//   );
// }
// export default LineGraph;
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Week 1',
    sales: 125000,
    trainers: 45000,
    expenses: 35000,
  },
  {
    name: 'Week 2',
    sales: 145000,
    trainers: 52000,
    expenses: 38000,
  },
  {
    name: 'Week 3',
    sales: 165000,
    trainers: 48000,
    expenses: 42000,
  },
  {
    name: 'Week 4',
    sales: 185000,
    trainers: 55000,
    expenses: 45000,
  },
  {
    name: 'Week 5',
    sales: 195000,
    trainers: 58000,
    expenses: 47000,
  },
  {
    name: 'Week 6',
    sales: 210000,
    trainers: 62000,
    expenses: 49000,
  },
  {
    name: 'Week 7',
    sales: 225000,
    trainers: 68000,
    expenses: 52000,
  },
];

function LineGraph() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="sales" stroke="#10b981" activeDot={{ r: 8 }} strokeWidth={3} />
        <Line type="monotone" dataKey="trainers" stroke="#3b82f6" activeDot={{ r: 6 }} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineGraph;
