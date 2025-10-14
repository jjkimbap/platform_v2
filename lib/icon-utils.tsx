import { 
  Activity, 
  MessageSquare, 
  Users, 
  UserCheck, 
  TrendingUp, 
  BarChart3,
  Target,
  MessageCircle,
  Scan,
  AlertTriangle
} from "lucide-react"

export const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Activity,
    MessageSquare,
    Users,
    UserCheck,
    TrendingUp,
    BarChart3,
    Target,
    MessageCircle,
    Scan,
    AlertTriangle
  }
  
  const IconComponent = iconMap[iconName]
  return IconComponent ? <IconComponent className="h-5 w-5" /> : null
}
