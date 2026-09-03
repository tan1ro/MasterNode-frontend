"use client"

import { HTTP_ERROR_CODES, HTTP_ERROR_CATALOG } from "@/lib/http-errors"

function ErrorCodeList({
  title,
  codes,
  codeColor,
}: {
  title: string
  codes: number[]
  codeColor: string
}) {
  return (
    <section className="w-full">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-[#8B92A9]">
        {title}
      </h2>
      <div className="auth-surface p-5 sm:p-6">
        <ul className="space-y-5">
          {codes.map((code) => {
            const row = HTTP_ERROR_CATALOG[code as keyof typeof HTTP_ERROR_CATALOG]
            return (
              <li
                key={code}
                className="border-b border-white/8 pb-5 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-col gap-2 text-left">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className={`font-mono text-xl font-semibold tabular-nums ${codeColor}`}>
                      {code}
                    </span>
                    <span className="text-lg font-semibold text-[#F0F2F8]">{row.name}</span>
                  </div>
                  <p className="max-w-4xl text-sm leading-relaxed text-[#8B92A9] sm:text-base">
                    {row.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function HttpErrorsIndex() {
  const clientCodes = HTTP_ERROR_CODES.filter((c) => HTTP_ERROR_CATALOG[c].client)
  const serverCodes = HTTP_ERROR_CODES.filter((c) => !HTTP_ERROR_CATALOG[c].client)

  return (
    <div className="w-full min-w-0 max-w-5xl px-1 sm:px-2">
      <div className="mb-8 text-center sm:mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8B92A9]">
          Reference
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#F0F2F8] sm:text-4xl">
          HTTP errors
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#8B92A9] sm:text-base">
          All documented HTTP errors are listed here directly so users can read them without
          opening separate pages.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <ErrorCodeList
          title="Client errors (4xx)"
          codes={[...clientCodes]}
          codeColor="text-[#2DCFCF]"
        />
        <ErrorCodeList
          title="Server errors (5xx)"
          codes={[...serverCodes]}
          codeColor="text-[#E8703A]"
        />
      </div>
    </div>
  )
}
