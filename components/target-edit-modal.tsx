"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TargetsConfig, TargetConfig } from "@/lib/targets-config"
import { Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TargetEditModalProps {
  targetsConfig: TargetsConfig | null
  onSave: (config: TargetsConfig) => void
}

export function TargetEditModal({ targetsConfig, onSave }: TargetEditModalProps) {
  const [open, setOpen] = useState(false)
  const [editedConfig, setEditedConfig] = useState<TargetsConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (targetsConfig) {
      setEditedConfig(JSON.parse(JSON.stringify(targetsConfig))) // Deep copy
    }
  }, [targetsConfig, open])

  const handleSave = async () => {
    if (!editedConfig) return

    setSaving(true)
    try {
      const response = await fetch('/api/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedConfig),
      })

      if (!response.ok) {
        throw new Error('목표치 저장에 실패했습니다.')
      }

      const result = await response.json()
      // 저장된 설정을 즉시 반영
      onSave(editedConfig)
      setOpen(false)
      
      toast({
        title: "저장 완료",
        description: "목표치가 성공적으로 저장되었습니다.",
      })
    } catch (error) {
      console.error('Error saving targets:', error)
      toast({
        title: "저장 실패",
        description: error instanceof Error ? error.message : "목표치 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateTarget = (key: keyof TargetsConfig, field: keyof TargetConfig, value: string | number) => {
    if (!editedConfig) return

    setEditedConfig({
      ...editedConfig,
      [key]: {
        ...editedConfig[key],
        [field]: value,
      },
    })
  }

  if (!targetsConfig || !editedConfig) {
    return null
  }

  const targetKeys: Array<keyof TargetsConfig> = [
    'download',
    'execution',
    'scan',
    'conversionRate',
    'userInflow',
    'appInflow',
    'commerceInflow',
    'communityPosts',
    'newChatRooms',
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>목표치 설정</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {targetKeys.map((key) => {
            const target = editedConfig[key]
            return (
              <div key={key} className="space-y-2 border-b pb-4 last:border-b-0">
                <Label className="text-sm font-semibold">{target.label}</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${key}-value`} className="text-xs text-muted-foreground">
                      목표값
                    </Label>
                    <Input
                      id={`${key}-value`}
                      type="number"
                      value={target.value}
                      onChange={(e) => updateTarget(key, 'value', Number(e.target.value))}
                      min={0}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${key}-color`} className="text-xs text-muted-foreground">
                      색상
                    </Label>
                    <Input
                      id={`${key}-color`}
                      type="color"
                      value={target.color}
                      onChange={(e) => updateTarget(key, 'color', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${key}-label`} className="text-xs text-muted-foreground">
                      라벨
                    </Label>
                    <Input
                      id={`${key}-label`}
                      type="text"
                      value={target.label}
                      onChange={(e) => updateTarget(key, 'label', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

