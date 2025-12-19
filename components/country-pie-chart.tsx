import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList, Legend } from 'recharts';

interface CountryData {
  label: string;
  value: string | number;
  color?: string;
}

interface CountryPieChartProps {
  data: CountryData[];
  onCountryClick?: (country: string) => void;
  showLegend?: boolean;
}

const CountryPieChart = ({ data, onCountryClick, showLegend = false }: CountryPieChartProps) => {
  // 데이터를 Recharts 형식으로 변환하고 퍼센트 계산
  const numericData = data.map(item => ({
    name: item.label,
    value: parseInt(item.value.toString().replace(/[^\d]/g, '')), // 숫자만 추출
    color: item.color || '#8884d8'
  }));
  
  const total = numericData.reduce((sum, item) => sum + item.value, 0);
  
  const chartData = numericData
    .map(item => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value); // 점유율 높은 순으로 정렬

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="70%"
              paddingAngle={1}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ cursor: onCountryClick ? 'pointer' : 'default' }}
                  onClick={() => onCountryClick?.(entry.name)}
                />
              ))}
              <LabelList 
                dataKey="name" 
                position="outside" 
                style={{ fontSize: '10px', fill: '#666' }}
              />
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [
                `${(value as number).toLocaleString()}회 (${(props as any).payload.percentage?.toFixed(1) || 0}%)`, 
                '실행 수'
              ]}
              labelFormatter={(label) => `국가: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CountryPieChart;
