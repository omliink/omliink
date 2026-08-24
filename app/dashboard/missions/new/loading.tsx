export default function NewMissionLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-4" aria-hidden="true">
      <div className="h-7 w-64 rounded bg-gray-200" />
      <div className="h-4 w-80 rounded bg-gray-100" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-11 rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  )
}
