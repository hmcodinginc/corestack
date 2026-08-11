import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { PermissionAction, AppModule } from '@/types/role';

const MODULES: { id: AppModule; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'departments', label: 'Departments' },
  { id: 'roles', label: 'Roles & Permissions' },
  { id: 'designations', label: 'Designations' },
  { id: 'employees', label: 'Employees' },
  { id: 'clients', label: 'Clients' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'documents', label: 'Documents' },
  { id: 'billing', label: 'Billing' },
  { id: 'reports', label: 'Reports' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Settings' },
  { id: 'activityLogs', label: 'Activity Logs' },
];

const ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'archive', label: 'Archive' },
  { id: 'restore', label: 'Restore' },
  { id: 'export', label: 'Export' },
  { id: 'assign', label: 'Assign' },
  { id: 'approve', label: 'Approve' },
  { id: 'manage', label: 'Manage' },
];

export const PermissionMatrix: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const permissions = watch('permissions') || {};

  // Deep clone helper to ensure React detects state changes
  const getClone = () => JSON.parse(JSON.stringify(permissions || {}));

  const handleSelectAll = (checked: boolean) => {
    const updated = getClone();
    MODULES.forEach(mod => {
      if (!updated[mod.id]) updated[mod.id] = {};
      ACTIONS.forEach(act => {
        updated[mod.id][act.id] = checked;
      });
    });
    setValue('permissions', updated, { shouldDirty: true, shouldValidate: true });
  };

  const handleSelectRow = (moduleId: string, checked: boolean) => {
    const updated = getClone();
    if (!updated[moduleId]) updated[moduleId] = {};
    ACTIONS.forEach(act => {
      updated[moduleId][act.id] = checked;
    });
    setValue('permissions', updated, { shouldDirty: true, shouldValidate: true });
  };

  const handleSelectColumn = (actionId: string, checked: boolean) => {
    const updated = getClone();
    MODULES.forEach(mod => {
      if (!updated[mod.id]) updated[mod.id] = {};
      updated[mod.id][actionId] = checked;
    });
    setValue('permissions', updated, { shouldDirty: true, shouldValidate: true });
  };

  const handleToggleCell = (moduleId: string, actionId: string, checked: boolean) => {
    const updated = getClone();
    if (!updated[moduleId]) updated[moduleId] = {};
    updated[moduleId][actionId] = checked;
    setValue('permissions', updated, { shouldDirty: true, shouldValidate: true });
  };

  // Computed states for main checkboxes
  const isAllSelected = useMemo(() => {
    return MODULES.every(mod => 
      ACTIONS.every(act => !!permissions[mod.id]?.[act.id])
    );
  }, [permissions]);

  const isRowSelected = (moduleId: string) => {
    return ACTIONS.every(act => !!permissions[moduleId]?.[act.id]);
  };

  const isColumnSelected = (actionId: string) => {
    return MODULES.every(mod => !!permissions[mod.id]?.[actionId]);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 select-none">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-48 shadow-[1px_0_0_0_#e5e7eb]">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSelectAll(!isAllSelected)}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary/20 pointer-events-none"
                />
                <span>Modules / Actions</span>
              </div>
            </th>
            {ACTIONS.map(action => (
              <th key={action.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div 
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => handleSelectColumn(action.id, !isColumnSelected(action.id))}
                >
                  <input
                    type="checkbox"
                    checked={isColumnSelected(action.id)}
                    onChange={(e) => handleSelectColumn(action.id, e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary/20 pointer-events-none"
                  />
                  <span>{action.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {MODULES.map(module => (
            <tr key={module.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 shadow-[1px_0_0_0_#e5e7eb] z-10">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleSelectRow(module.id, !isRowSelected(module.id))}
                >
                  <input
                    type="checkbox"
                    checked={isRowSelected(module.id)}
                    onChange={(e) => handleSelectRow(module.id, e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary/20 pointer-events-none"
                  />
                  {module.label}
                </div>
              </td>
              {ACTIONS.map(action => {
                const isChecked = !!permissions[module.id]?.[action.id];
                return (
                  <td 
                    key={`${module.id}-${action.id}`} 
                    className="px-4 py-3 text-center cursor-pointer"
                    onClick={() => handleToggleCell(module.id, action.id, !isChecked)}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleToggleCell(module.id, action.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary/20 h-4 w-4 pointer-events-none"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
