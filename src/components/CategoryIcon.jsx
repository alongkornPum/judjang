import { getCategory } from '../data/categories'

export default function CategoryIcon({ id, size = 'md' }) {
  const c = getCategory(id)
  const Icon = c.icon
  const box = size === 'sm' ? 'size-9 rounded-xl' : 'size-11 rounded-2xl'
  return (
    <span className={`grid shrink-0 place-items-center ${box}`} style={{ backgroundColor: `${c.color}1A`, color: c.color }}>
      <Icon className={size === 'sm' ? 'size-4.5' : 'size-5'} aria-hidden />
    </span>
  )
}
