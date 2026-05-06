export default function Table({ columns, rows, empty }) {
  if (!rows?.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        {empty || 'No records'}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900/80">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-zinc-800 dark:text-zinc-200">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
