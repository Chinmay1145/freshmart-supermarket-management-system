import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { inr, shortDate, titleCase } from "@/lib/format";
import { ExportButtons } from "@/components/export-buttons";
import { pdfAmount, pdfDate } from "@/lib/pdf";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["employees"]["Row"];
type Role = Database["public"]["Enums"]["app_role"];

const roles: Role[] = ["super_admin", "manager", "cashier", "inventory_staff"];

const empty = {
  name: "",
  employee_code: "",
  role: "cashier" as Role,
  department: "",
  email: "",
  phone: "",
  salary: "0",
  joining_date: new Date().toISOString().slice(0, 10),
  is_active: true,
};

export const Route = createFileRoute("/_authenticated/employees")({
  component: EmployeesPage,
  head: () => ({
    meta: [
      { title: "Employees — FreshMart ERP" },
      { name: "description", content: "Manage staff records, roles, departments and salaries." },
    ],
  }),
});

function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });

  const { data: employees, isLoading } = useRows<Employee>("employees", { orderBy: "name", ascending: true });
  const save = useSaveRow("employees", "Employee");
  const remove = useDeleteRow("employees", "Employee");

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...empty });
    setOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditingId(e.id);
    setForm({
      name: e.name,
      employee_code: e.employee_code,
      role: e.role,
      department: e.department ?? "",
      email: e.email ?? "",
      phone: e.phone ?? "",
      salary: String(e.salary ?? 0),
      joining_date: e.joining_date?.slice(0, 10) ?? empty.joining_date,
      is_active: e.is_active,
    });
    setOpen(true);
  };

  const submit = async () => {
    await save.mutateAsync({
      id: editingId ?? undefined,
      name: form.name,
      employee_code: form.employee_code,
      role: form.role,
      department: form.department || null,
      email: form.email || null,
      phone: form.phone || null,
      salary: Number(form.salary) || 0,
      joining_date: form.joining_date,
      is_active: form.is_active,
    });
    setOpen(false);
  };

  const q = search.toLowerCase();
  const filtered = (employees ?? []).filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.employee_code.toLowerCase().includes(q) ||
      (e.department ?? "").toLowerCase().includes(q),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-sm text-muted-foreground">Staff records, roles, departments and salaries.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButtons
            csv={{
              filename: "employees.csv",
              rows: () =>
                filtered.map((e) => ({
                  Code: e.employee_code,
                  Name: e.name,
                  Role: e.role,
                  Department: e.department ?? "",
                  Phone: e.phone ?? "",
                  Email: e.email ?? "",
                  Joined: e.joining_date,
                  Salary: Number(e.salary ?? 0),
                  Status: e.is_active ? "Active" : "Inactive",
                })),
            }}
            pdf={() => ({
              filename: "staff-report.pdf",
              title: "Staff Report",
              subtitle: `${filtered.length} employee${filtered.length === 1 ? "" : "s"}`,
              stats: [
                { label: "Total staff", value: String((employees ?? []).length) },
                { label: "Active", value: String((employees ?? []).filter((e) => e.is_active).length) },
                {
                  label: "Monthly payroll",
                  value: pdfAmount((employees ?? []).filter((e) => e.is_active).reduce((s, e) => s + Number(e.salary ?? 0), 0)),
                },
              ],
              tables: [
                {
                  heading: "Employees",
                  head: ["Code", "Name", "Role", "Department", "Phone", "Joined", "Salary", "Status"],
                  alignRight: [6],
                  rows: filtered.map((e) => [
                    e.employee_code,
                    e.name,
                    titleCase(e.role),
                    e.department ?? "—",
                    e.phone ?? "—",
                    pdfDate(e.joining_date),
                    pdfAmount(e.salary),
                    e.is_active ? "Active" : "Inactive",
                  ]),
                  empty: "No staff records.",
                },
              ],
              totals: [
                {
                  label: "Listed salaries",
                  value: pdfAmount(filtered.reduce((s, e) => s + Number(e.salary ?? 0), 0)),
                  strong: true,
                },
              ],
            })}
          />
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add employee
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total staff" value={String((employees ?? []).length)} />
        <StatCard label="Active" value={String((employees ?? []).filter((e) => e.is_active).length)} />
        <StatCard
          label="Monthly payroll"
          value={inr((employees ?? []).filter((e) => e.is_active).reduce((s, e) => s + Number(e.salary ?? 0), 0))}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, code or department..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                        No employees yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-mono text-xs">{e.employee_code}</TableCell>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell>{titleCase(e.role.replace(/_/g, " "))}</TableCell>
                        <TableCell className="text-muted-foreground">{e.department ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{e.phone ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{shortDate(e.joining_date)}</TableCell>
                        <TableCell className="num text-right">{inr(e.salary)}</TableCell>
                        <TableCell>
                          <Badge variant={e.is_active ? "secondary" : "outline"}>
                            {e.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(e)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(e.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit employee" : "Add employee"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Full name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Employee code</Label>
                <Input
                  placeholder="EMP-001"
                  value={form.employee_code}
                  onChange={(e) => setForm({ ...form, employee_code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {titleCase(r.replace(/_/g, " "))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Input
                  placeholder="Billing"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Monthly salary</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Joining date</Label>
                <Input
                  type="date"
                  value={form.joining_date}
                  onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.is_active ? "active" : "inactive"}
                onValueChange={(v) => setForm({ ...form, is_active: v === "active" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={save.isPending || !form.name || !form.employee_code}>
                {save.isPending ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="num mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
