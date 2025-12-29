import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';

interface AgeGroupData {
  ageGroup: string;
  male: number;
  female: number;
}

interface PositiveNegativeBarChartProps {
  data: AgeGroupData[];
}

const PositiveNegativeBarChart = ({ data }: PositiveNegativeBarChartProps) => {
  // 데이터를 Recharts 형식으로 변환
  const chartData = data.map(item => ({
    name: item.ageGroup,
    male: -item.male, // 남성은 음수로 표시 (왼쪽)
    female: item.female, // 여성은 양수로 표시 (오른쪽)
    maleOriginal: item.male,
    femaleOriginal: item.female,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
            axisLine={{ stroke: '#666' }}
          />
          <Tooltip 
            formatter={(value: number | undefined, name: string | undefined) => {
              const val = value || 0
              const originalValue = name === 'male' ? Math.abs(val) : val
              return [`${originalValue}명`, name === 'male' ? '남성' : '여성']
            }}
            labelFormatter={(label) => `연령대: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          <Legend 
            formatter={(value) => value === 'male' ? '남성' : '여성'}
            wrapperStyle={{ fontSize: '12px' }}
          />
          <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
          <Bar 
            dataKey="male" 
            fill="#3b82f6" 
            name="male"
            radius={[0, 0, 4, 4]}
          />
          <Bar 
            dataKey="female" 
            fill="#ec4899" 
            name="female"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PositiveNegativeBarChart;
