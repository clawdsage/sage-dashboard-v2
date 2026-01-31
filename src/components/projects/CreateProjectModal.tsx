import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { X, Plus, X as XIcon } from 'lucide-react'
import type { Database } from '@/lib/supabase'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (project: Database['public']['Tables']['projects']['Insert'] & { priority?: string; due_date?: string; tags?: string[]; owner?: string }) => void
  isLoading?: boolean
  initialData?: Partial<Database['public']['Tables']['projects']['Row'] & { priority?: string; due_date?: string; tags?: string[]; owner?: string }>
}

const COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const OWNERS = [
  { value: 'sage', label: 'Sage' },
  { value: 'tim', label: 'Tim' },
  { value: 'both', label: 'Both' },
]

export function CreateProjectModal({ isOpen, onClose, onCreate, isLoading, initialData }: CreateProjectModalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [selectedColor, setSelectedColor] = useState(initialData?.color || COLORS[0])
  const [priority, setPriority] = useState(initialData?.priority || 'medium')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [owner, setOwner] = useState(initialData?.owner || 'sage')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onCreate({
      name: name.trim(),
      description: description.trim() || undefined,
      color: selectedColor,
      status: initialData?.status || 'active',
      priority,
      due_date: dueDate || undefined,
      tags,
      owner,
    })

    // Reset form
    setName('')
    setDescription('')
    setSelectedColor(COLORS[0])
    setPriority('medium')
    setDueDate('')
    setTags([])
    setTagInput('')
    setOwner('sage')
    onClose()
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Reset form when modal opens with initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || '')
      setDescription(initialData.description || '')
      setSelectedColor(initialData.color || COLORS[0])
      setPriority(initialData.priority || 'medium')
      setDueDate(initialData.due_date || '')
      setTags(initialData.tags || [])
      setOwner(initialData.owner || 'sage')
    } else if (isOpen) {
      setName('')
      setDescription('')
      setSelectedColor(COLORS[0])
      setPriority('medium')
      setDueDate('')
      setTags([])
      setTagInput('')
      setOwner('sage')
    }
  }, [isOpen, initialData])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-bg-secondary border border-border-subtle rounded-lg shadow-lg w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <h2 className="text-lg font-semibold">
                  {initialData ? 'Edit Project' : 'Create New Project'}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 bg-bg-primary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      placeholder="Add a tag"
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-bg-tertiary text-text-primary text-sm rounded-md"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-text-muted hover:text-text-primary"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color
                            ? 'border-text-primary'
                            : 'border-border-default'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Owner */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Owner
                  </label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    {OWNERS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!name.trim() || isLoading}>
                    {isLoading ? 'Creating...' : initialData ? 'Update Project' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}