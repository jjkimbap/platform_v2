"use client"

import { useState } from "react"
import { AlertTriangle, Building2, Mail } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { MetricModal } from "@/components/metric-modal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

// Mock data
const lowPerformingVendors = [
  { id: 1, name: "업체 A", responseRate: 35, contact: "vendor-a@example.com" },
  { id: 2, name: "업체 B", responseRate: 42, contact: "vendor-b@example.com" },
  { id: 3, name: "업체 C", responseRate: 28, contact: "vendor-c@example.com" },
  { id: 4, name: "업체 D", responseRate: 48, contact: "vendor-d@example.com" },
]

export function VendorPerformance() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVendors, setSelectedVendors] = useState<number[]>([])
  const { toast } = useToast()

  const handleSendEmail = () => {
    if (selectedVendors.length === 0) {
      toast({
        title: "업체를 선택해주세요",
        description: "이메일을 전송할 업체를 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    // Mock email sending
    toast({
      title: "이메일 전송 완료",
      description: `${selectedVendors.length}개 업체에 답변율 저조 알림을 전송했습니다.`,
    })
    setSelectedVendors([])
  }

  const toggleVendor = (id: number) => {
    setSelectedVendors((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">업체 성과</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="프리랜딩 답변율"
          value="63% (747명)"
          icon={<Building2 className="h-5 w-5" />}
        />
        <MetricCard
          title="저조 업체 알림"
          value={`${lowPerformingVendors.length}개`}
          icon={<AlertTriangle className="h-5 w-5 text-warning" />}
          onClick={() => setModalOpen(true)}
          className="border-warning/30"
        />
      </div>

      <MetricModal open={modalOpen} onOpenChange={setModalOpen} title="답변율 저조 업체 리스트">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">답변율 50% 미만 업체 ({lowPerformingVendors.length}개)</p>
            <Button onClick={handleSendEmail} disabled={selectedVendors.length === 0} size="sm">
              <Mail className="mr-2 h-4 w-4" />
              선택 업체 담당자에게 알림 전송
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">선택</TableHead>
                  <TableHead>업체명</TableHead>
                  <TableHead>답변율</TableHead>
                  <TableHead>담당자 이메일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowPerformingVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedVendors.includes(vendor.id)}
                        onCheckedChange={() => toggleVendor(vendor.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
                      <span className="text-danger font-semibold">{vendor.responseRate}%</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{vendor.contact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </MetricModal>
    </section>
  )
}
