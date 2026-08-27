'use client'

import type { ReactNode } from 'react'

interface ProfileBlockCardProps {
  title: string
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  readView: ReactNode
  editView: ReactNode
  hideEditButton?: boolean
}

export default function ProfileBlockCard({
  title,
  editing,
  onEdit,
  onCancel,
  readView,
  editView,
  hideEditButton,
}: ProfileBlockCardProps) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {!hideEditButton &&
          (editing ? (
            <button type="button" onClick={onCancel} className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Annuler
            </button>
          ) : (
            <button type="button" onClick={onEdit} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Modifier
            </button>
          ))}
      </div>
      <div className="mt-4">{editing ? editView : readView}</div>
    </section>
  )
}
