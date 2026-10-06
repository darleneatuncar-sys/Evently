import type { Category } from '../types'

interface CategoryChipsProps {
  categories: Category[]
  selectedId?: string
  onSelect: (categoryId?: string) => void
}

function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps) {
  const baseClass =
    'rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400'

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={`${baseClass} ${
          !selectedId
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700'
        }`}
      >
        Todas
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`${baseClass} ${
            selectedId === category.id
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}

export default CategoryChips
