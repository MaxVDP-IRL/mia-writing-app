import './StarRating.css'

interface Props {
  stars: 0 | 1 | 2 | 3
}

export function StarRating({ stars }: Props) {
  return (
    <div className="star-rating" aria-label={`${stars} out of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= stars ? 'star star-filled' : 'star star-empty'}>
          {i <= stars ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}
