import './StarRating.css'

interface Props {
  stars: 0 | 1 | 2 | 3
  /** Pop the earned stars in one after another, for a fresh result. */
  celebrate?: boolean
}

export function StarRating({ stars, celebrate = false }: Props) {
  return (
    <div
      className={`star-rating ${celebrate ? 'star-rating-celebrate' : ''}`}
      role="img"
      aria-label={`${stars} out of 3 stars`}
    >
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= stars ? 'star star-filled' : 'star star-empty'} aria-hidden="true">
          {i <= stars ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}
