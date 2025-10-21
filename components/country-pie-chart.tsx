import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList, Legend } from 'recharts';

interface CountryData {
  label: string;
  value: string | number;
  color?: string;
}

interface CountryPieChartProps {
  data: CountryData[];
  onCountryClick?: (country: string) => void;
  size?: 'small' | 'large';
  showLegend?: boolean;
}

const CountryPieChart = ({ data, onCountryClick, size = 'small', showLegend = false }: CountryPieChartProps) => {
  // 데이터를 Recharts 형식으로 변환하고 퍼센트 계산
  const numericData = data.map(item => ({
    name: item.label,
    value: parseInt(item.value.toString().replace(/[^\d]/g, '')), // 숫자만 추출
    color: item.color || '#8884d8'
  }));
  
  const total = numericData.reduce((sum, item) => sum + item.value, 0);
  
  const chartData = numericData.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  // 크기에 따른 차트 설정
  const chartConfig = size === 'large' 
    ? { 
        height: 'h-64', 
        innerRadius: 40, 
        outerRadius: 90, 
        fontSize: '12px' 
      }
    : { 
        height: 'h-32', 
        innerRadius: 20, 
        outerRadius: 45, 
        fontSize: '10px' 
      };

  return (
    <div className={`w-full ${chartConfig.height}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={chartConfig.innerRadius}
            outerRadius={chartConfig.outerRadius}
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
              style={{ fontSize: chartConfig.fontSize, fill: '#666' }}
            />
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [
              `${value.toLocaleString()}회 (${props.payload.percentage}%)`, 
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
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color, fontSize: '11px' }}>
                  {value}
                </span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CountryPieChart;
