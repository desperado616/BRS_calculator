import { useRef, useState, type ChangeEvent } from 'react'
import {
  assertBackupFileSize,
  downloadBackup,
  exportAllSubjects,
  importSubjects,
  parseBackupFile,
} from '../storage/backup'
import { useSubjects } from '../hooks/useSubjects'
import { useToast } from '../hooks/useToast'
import { confirmAction } from '../utils/confirm'
import { triggerHaptic } from '../utils/haptic'
import { Button } from './Button'
import { CollapsibleSection } from './CollapsibleSection'

export function DataBackupPanel() {
  const { refresh } = useSubjects()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const backup = await exportAllSubjects()
      if (backup.subjects.length === 0) {
        showToast('Нет предметов для экспорта')
        return
      }
      downloadBackup(backup)
      triggerHaptic('success')
      showToast('Резервная копия сохранена')
    } catch {
      showToast('Не удалось экспортировать данные')
    } finally {
      setExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setImporting(true)
    try {
      assertBackupFileSize(file.size)
      const text = await file.text()
      let json: unknown
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error('Файл не является корректным JSON')
      }
      const subjects = parseBackupFile(json)

      const replace = await confirmAction(
        `Найдено предметов: ${subjects.length}. Заменить все текущие данные? «Отмена» — добавить к существующим.`,
        {
          title: 'Импорт данных',
          confirmText: 'Заменить',
          destructive: true,
        },
      )

      const count = await importSubjects(subjects, replace ? 'replace' : 'merge')
      await refresh()
      triggerHaptic('success')
      showToast(
        replace
          ? `Импортировано ${count} предметов`
          : `Добавлено ${count} предметов`,
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось импортировать файл'
      showToast(message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <CollapsibleSection
      title="Резервная копия"
      description="Экспорт и импорт всех предметов в JSON"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Выберите файл резервной копии JSON"
        onChange={(event) => void handleFileChange(event)}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          variant="secondary"
          onClick={() => void handleExport()}
          disabled={exporting || importing}
        >
          {exporting ? 'Экспорт…' : 'Экспорт JSON'}
        </Button>
        <Button
          variant="secondary"
          onClick={handleImportClick}
          disabled={exporting || importing}
        >
          {importing ? 'Импорт…' : 'Импорт JSON'}
        </Button>
      </div>
    </CollapsibleSection>
  )
}
