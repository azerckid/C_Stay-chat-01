import { cn } from "@/lib/utils"

/**
 * STAYnC의 프리미엄 디자인 시스템이 적용된 스켈레톤 컴포넌트입니다.
 * 단순한 단색 펄스 대신 은은한 글래스 효과와 부드러운 애니메이션을 사용합니다.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-lg bg-white/5 border border-white/5",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.05] before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
