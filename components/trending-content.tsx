"use client"

import { MessageSquare, Hash, Folder } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const topPosts = [
  { id: 1, title: "플랫폼 사용 팁 공유합니다", views: 12500, likes: 850 },
  { id: 2, title: "이번 주 베스트 프로젝트", views: 10200, likes: 720 },
  { id: 3, title: "신규 기능 업데이트 안내", views: 9800, likes: 680 },
  { id: 4, title: "커뮤니티 이벤트 당첨자 발표", views: 8900, likes: 620 },
  { id: 5, title: "자주 묻는 질문 모음", views: 8200, likes: 580 },
]

const topCategories = [
  { id: 1, name: "디자인", posts: 1250 },
  { id: 2, name: "개발", posts: 1180 },
  { id: 3, name: "마케팅", posts: 980 },
  { id: 4, name: "기획", posts: 850 },
  { id: 5, name: "운영", posts: 720 },
]

const topTags = [
  { id: 1, name: "user1", count: 2340 },
  { id: 2, name: "user2", count: 2120 },
  { id: 3, name: "user3", count: 1890 },
  { id: 4, name: "user4", count: 1650 },
  { id: 5, name: "user5", count: 1420 },
]

export function TrendingContent() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">트렌드 분석 & 랭킹</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Posts */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">최근 게시물</h3>
          </div>
          <div className="space-y-3">
            {topPosts.map((post, index) => (
              <div
                key={post.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Badge variant="secondary" className="shrink-0 w-6 h-6 flex items-center justify-center p-0">
                  {index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    조회 {post.views.toLocaleString()} · 좋아요 {post.likes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Posts */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">인기 게시물 Top 5</h3>
          </div>
          <div className="space-y-3">
            {topPosts.map((post, index) => (
              <div
                key={post.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Badge variant="secondary" className="shrink-0 w-6 h-6 flex items-center justify-center p-0">
                  {index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    조회 {post.views.toLocaleString()} · 좋아요 {post.likes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Categories */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-foreground">인기 카테고리 Top 5</h3>
          </div>
          <div className="space-y-3">
            {topCategories.map((category, index) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="shrink-0 w-6 h-6 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{category.posts} 게시물</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Tags */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">유저 랭킹 Top 5</h3>
          </div>
          <div className="space-y-3">
            {topTags.map((tag, index) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="shrink-0 w-6 h-6 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">#{tag.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{tag.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
        {/* Row Tags */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">블랙 유저 랭킹 Top 5</h3>
          </div>
          <div className="space-y-3">
            {topTags.map((tag, index) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="shrink-0 w-6 h-6 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">#{tag.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{tag.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}
