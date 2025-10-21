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
  // 요일과 시간대 데이터 구성
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const hours = [0, 3, 6, 9, 12, 15, 18, 21];
  
  // 히트맵 데이터 생성
  const heatmapData = days.map(day => {
    const dayData: any = { day };
    hours.forEach(hour => {
      const dataPoint = data.find(d => d.day === day && d.hour === hour);
      dayData[hour] = dataPoint ? dataPoint.value : 0;
    });
    return dayData;
  });

  const maxValue = Math.max(...data.map(d => d.value));

  // 색상 계산 함수
  const getColor = (value: number) => {
    if (value === 0) return '#f8f9fa';
    const intensity = value / maxValue;
    if (intensity < 0.2) return '#e3f2fd';
    if (intensity < 0.4) return '#bbdefb';
    if (intensity < 0.6) return '#90caf9';
    if (intensity < 0.8) return '#64b5f6';
    return '#2196f3';
  };

  // 크기에 따른 상자 크기 계산
  const getBoxSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 24;
      case 'large': return 32;
      default: return 24;
    }
  };
  
  const boxSize = getBoxSize();
  const containerWidth = hours.length * (boxSize + 2) + 24; // 상자 크기 + 간격 + 요일 라벨 공간
  const containerHeight = days.length * (boxSize + 2) + 60; // 상자 크기 + 간격 + 제목/범례 공간

  return (
    <div className="w-full flex justify-center" style={{ height: `${containerHeight}px` }}>
      <div className="space-y-2">
        {/* 시간대 라벨 */}
        <div className="flex items-center" style={{ width: containerWidth }}>
          <div className="w-6"></div>
          {hours.map(hour => (
            <div 
              key={hour} 
              className="text-center text-xs text-muted-foreground"
              style={{ width: boxSize }}
            >
              {hour}
            </div>
          ))}
        </div>
        
        {/* 히트맵 그리드 */}
        <div className="space-y-1">
          {heatmapData.map((dayData, dayIndex) => (
            <div key={dayData.day} className="flex items-center" style={{ width: containerWidth }}>
              <div className="w-6 text-xs text-muted-foreground text-center">
                {dayData.day}
              </div>
              <div className="flex" style={{ gap: '2px' }}>
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="border border-gray-200 rounded flex items-center justify-center text-xs font-medium"
                    style={{ 
                      backgroundColor: getColor(dayData[hour]),
                      width: boxSize,
                      height: boxSize
                    }}
                    title={`${dayData.day} ${hour}시: ${dayData[hour]}회`}
                  >
                    {dayData[hour] > 0 && (
                      <span className={dayData[hour] > maxValue * 0.5 ? 'text-white' : 'text-gray-700'}>
                        {dayData[hour]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* 범례 */}
        {/* <div className="flex items-center justify-center space-x-1 mt-2">
          <span className="text-xs text-muted-foreground">실행 수:</span>
          <div className="flex space-x-1">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div
                  className="w-3 h-3 border border-gray-200 rounded"
                  style={{ backgroundColor: getColor(intensity * maxValue) }}
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round(intensity * maxValue)}
                </span>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CountryHeatmap;
