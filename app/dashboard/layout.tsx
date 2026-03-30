'use client';

import { ProtectedRoute } from './ProtectedRoute';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}



// 'use client';

// import { DashboardGuard } from './DashboardGuard';

// export default function DashboardLayoutWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return <DashboardGuard>{children}</DashboardGuard>;
// }

// 'use client';

// import { ProtectedRoute } from './ProtectedRoute';
// import { RestrictionGuard } from './RestrictionGuard';

// export default function DashboardLayoutWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ProtectedRoute>
//       <RestrictionGuard>{children}</RestrictionGuard>
//     </ProtectedRoute>
//   );
// }