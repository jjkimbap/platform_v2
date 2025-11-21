import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface CountryHeatmapProps {
  country: string;
  data: HeatmapData[];
  size?: 'small' | 'medium' | 'large';
}

const CountryHeatmap = ({ country, data, size = 'medium' }: CountryHeatmapProps) => {
  // 요일과 시간대 데이터 구성 (4시간 차이로 변경)
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const hours = [0, 4, 8, 12, 16, 20]; // 4시간 차이로 변경
  
  // 히트맵 데이터 생성 (시간을 x축, 요일을 y축으로 변경)
  const heatmapData = hours.map(hour => {
    const hourData: any = { hour };
    days.forEach(day => {
      const dataPoint = data.find(d => d.day === day && d.hour === hour);
      hourData[day] = dataPoint ? dataPoint.value : 0;
    });
    return hourData;
  });

  const maxValue = Math.max(...data.map(d => d.value));

  // 색상 계산 함수 (더 명확한 구분을 위해 색상 변경)
  const getColor = (value: number) => {
    if (value === 0) return '#f8f9fa';
    const intensity = value / maxValue;
    if (intensity < 0.1) return '#e8f5e8'; // 매우 연한 녹색
    if (intensity < 0.3) return '#c8e6c9'; // 연한 녹색
    if (intensity < 0.5) return '#81c784'; // 중간 녹색
    if (intensity < 0.7) return '#4caf50'; // 진한 녹색
    if (intensity < 0.9) return '#388e3c'; // 더 진한 녹색
    return '#2e7d32'; // 가장 진한 녹색
  };

  // 크기에 따른 상자 크기 계산 (flex하게 키우기 위해 더 큰 기본값 사용)
  const getBoxSize = () => {
    switch (size) {
      case 'small': return 24; // 기존 16에서 24로 증가
      case 'medium': return 32; // 기존 24에서 32로 증가
      case 'large': return 40; // 기존 32에서 40으로 증가
      default: return 32;
    }
  };
  
  const boxSize = getBoxSize();
  const containerWidth = days.length * (boxSize + 4) + 40; // 요일 라벨 공간 증가
  const containerHeight = hours.length * (boxSize + 4) + 40; // 시간 라벨 공간 증가

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="space-y-3">
        {/* 요일 라벨 (상단) */}
        <div className="flex items-center justify-center" style={{ width: containerWidth }}>
          <div className="w-8"></div>
          {days.map(day => (
            <div 
              key={day} 
              className="text-center text-xs text-muted-foreground font-medium"
              style={{ width: boxSize }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 히트맵 그리드 (시간을 세로로, 요일을 가로로) */}
        <div className="space-y-2">
          {heatmapData.map((hourData, hourIndex) => (
            <div key={hourData.hour} className="flex items-center" style={{ width: containerWidth }}>
              <div className="w-8 text-xs text-muted-foreground text-center font-medium">
                {hourData.hour}시
              </div>
              <div className="flex" style={{ gap: '4px' }}>
                {days.map(day => (
                  <div
                    key={day}
                    className="border border-gray-300 rounded-md flex items-center justify-center text-xs font-semibold shadow-sm"
                    style={{ 
                      backgroundColor: getColor(hourData[day]),
                      width: boxSize,
                      height: boxSize
                    }}
                    title={`${day} ${hourData.hour}시: ${hourData[day]}회`}
                  >
                    {hourData[day] > 0 && (
                      <span className={hourData[day] > maxValue * 0.6 ? 'text-white' : 'text-gray-800'}>
                        {hourData[day]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* 범례 */}
        <div className="flex items-center justify-center space-x-2 mt-3">
          <div className="flex space-x-1">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div
                  className="w-4 h-4 border border-gray-300 rounded"
                  style={{ backgroundColor: getColor(intensity * maxValue) }}
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round(intensity * maxValue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryHeatmap;
