import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplilms/ui";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "../../lib/payment";

interface EarningsData {
  classes: {
    id: string;
    name: string;
    price_cents: number;
    commission_rate: number;
    enrolled_count: number;
    total_revenue_cents: number;
    instructor_share_cents: number;
  }[];
  totalRevenueCents: number;
  totalInstructorShareCents: number;
}

interface EarningsSummaryProps {
  earnings: EarningsData;
}

export function EarningsSummary({ earnings }: EarningsSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(earnings.totalInstructorShareCents)}
            </div>
            <p className="text-xs text-muted-foreground">Total commission earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earnings.totalRevenueCents)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.classes.length}</div>
            <p className="text-xs text-muted-foreground">
              Classes with earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.classes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No earnings data yet.</p>
              <p className="text-xs mt-1">
                Earnings will appear once students enroll in your classes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Commission</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Your Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(cls.price_cents)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {cls.enrolled_count}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {Math.round(cls.commission_rate * 100)}%
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(cls.total_revenue_cents)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-green-600">
                        {formatCurrency(cls.instructor_share_cents)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold" colSpan={4}>
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(earnings.totalRevenueCents)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatCurrency(earnings.totalInstructorShareCents)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout info */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            Payouts are processed through Stripe Connect. Your commission
            ({Math.round((earnings.classes[0]?.commission_rate ?? 0.5) * 100)}%)
            is automatically calculated and transferred to your connected
            account. For payout questions, contact{" "}
            your institution&apos;s admissions office
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
