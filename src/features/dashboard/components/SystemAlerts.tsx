// import { CircleAlert } from 'lucide-react'
// import { AlertBox } from '@/components/ui/AlertBox'
// import { Card } from '@/components/ui/Card'
// import { cn } from '@/utils/cn'
// import type { SystemAlert } from '@/features/dashboard/data/mockData'

// type SystemAlertsProps = { alerts: SystemAlert[]; className?: string }

// export function SystemAlerts({ alerts, className }: SystemAlertsProps) {
//   return (
//     <Card
//       className={cn(
//         'w-full rounded-[12px] border border-[#e2e8f0]/60 p-6 shadow-sm',
//         className,
//       )}
//     >
//       <div className="mb-4 flex items-center gap-2">
//         <span
//           className="flex size-5 shrink-0 items-center justify-center text-[#991B1B]"
//           aria-hidden
//         >
//           <CircleAlert className="size-5 stroke-[2]" />
//         </span>
//         <h2 className="text-base font-bold text-[#991B1B]">System Alerts</h2>
//       </div>
//       <div className="flex flex-col gap-3">
//         {alerts.map((alert) => (
//           <AlertBox
//             key={alert.id}
//             title={alert.title}
//             detail={alert.detail}
//             variant={alert.variant}
//           />
//         ))}
//       </div>
//     </Card>
//   )
// }
