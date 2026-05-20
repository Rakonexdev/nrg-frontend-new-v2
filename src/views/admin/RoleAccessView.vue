<template>
  <div class="space-y-8 pb-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Role Access Management</h1>
        <p class="text-slate-500 dark:text-slate-400">Create roles and manage menu visibility & action permissions.</p>
      </div>
      <button @click="showCreateRole = true" class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#29166e] to-[#1d0f4d] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#29166e]/30 hover:shadow-xl hover:scale-[1.02] transition-all">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-width="2.5" stroke-linecap="round"></path></svg>
        Create Role
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-[#29166e] rounded-full animate-spin"></div>
    </div>

    <!-- Roles Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="role in roles" :key="role.id" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <!-- Role Header -->
        <div class="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#29166e] to-[#1d0f4d] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#29166e]/30">
              {{ role.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-800 dark:text-white capitalize">{{ role.name.replace('_', ' ') }}</h3>
              <p class="text-xs font-medium text-slate-400">{{ role.users_count }} user(s) assigned · {{ role.permissions.length }} permissions</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="editRole(role)" class="p-2.5 rounded-xl bg-[#29166e]/5 dark:bg-[#29166e]/20 text-[#29166e] hover:bg-[#29166e]/10 transition-colors" title="Edit Permissions">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
            <button v-if="!isProtectedRole(role.name)" @click="deleteRole(role)" class="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-colors" title="Delete Role">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
          </div>
        </div>

        <!-- Permission Summary -->
        <div class="p-6 space-y-4">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Menu Access</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="perm in getMenuPermissions(role.permissions)" :key="perm"
                    class="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-100 dark:border-emerald-800/50">
                {{ formatPermissionLabel(perm) }}
              </span>
              <span v-if="getMenuPermissions(role.permissions).length === 0" class="text-xs text-slate-400 italic">No menu access</span>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Action Permissions</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="perm in getActionPermissions(role.permissions)" :key="perm"
                    class="px-3 py-1.5 rounded-lg text-[11px] font-bold border"
                    :class="perm.includes('delete') ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/50' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/50'">
                {{ formatPermissionLabel(perm) }}
              </span>
              <span v-if="getActionPermissions(role.permissions).length === 0" class="text-xs text-slate-400 italic">No action permissions</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && roles.length === 0" class="py-20 text-center">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </div>
      <h3 class="text-lg font-bold text-slate-600 dark:text-slate-300">No Roles Found</h3>
      <p class="text-sm text-slate-400 mt-2">Create your first role to get started.</p>
    </div>

    <!-- Admin Users Section -->
    <div class="mt-10">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Users</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm">Manage users who have admin dashboard access.</p>
        </div>
        <button @click="showCreateUser = true" class="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          Add Admin User
        </button>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30">
              <th class="px-6 py-4 font-black">Name</th>
              <th class="px-6 py-4 font-black">Email</th>
              <th class="px-6 py-4 font-black">Role</th>
              <th class="px-6 py-4 font-black">Status</th>
              <th class="px-6 py-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <tr v-for="user in adminUsers" :key="user.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-[#29166e]/10 dark:bg-[#29166e]/30 flex items-center justify-center text-[#29166e] dark:text-[#29166e]/80 text-xs font-bold">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-bold text-slate-800 dark:text-white">{{ user.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-lg bg-[#29166e]/5 dark:bg-[#29166e]/20 text-[#29166e] dark:text-[#29166e]/80 text-[11px] font-bold capitalize">{{ (user.role || '').replace('_', ' ') }}</span>
              </td>
              <td class="px-6 py-4">
                <span :class="user.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'" class="px-3 py-1 rounded-lg text-[11px] font-bold">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="editUser(user)" class="p-2 rounded-lg text-slate-400 hover:text-[#29166e] hover:bg-[#29166e]/5 transition-colors" title="Edit User">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </button>
                  <button @click="deleteUser(user)" class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Delete User">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="adminUsers.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-slate-400 italic text-sm">No admin users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Role Modal -->
    <Modal :show="showCreateRole || showEditRole" :title="showEditRole ? 'Edit Role Permissions' : 'Create New Role'" @close="closeRoleModal" maxWidth="3xl">
      <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <!-- Role Name (only for create) -->
        <div v-if="!showEditRole" class="space-y-2">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Role Name</label>
          <input v-model="roleForm.name" type="text" placeholder="e.g. manager, supervisor" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all dark:text-white" />
        </div>

        <!-- Editing role name display -->
        <div v-if="showEditRole" class="p-4 bg-[#29166e]/5 dark:bg-[#29166e]/20 rounded-xl border border-[#29166e]/10 dark:border-[#29166e]/20">
          <p class="text-xs font-black text-[#29166e] uppercase tracking-widest mb-1">Editing Role</p>
          <p class="text-lg font-black text-[#29166e] dark:text-[#29166e]/80 capitalize">{{ (editingRole?.name || '').replace('_', ' ') }}</p>
        </div>

        <!-- Permission Groups -->
        <div v-for="(group, key) in permissionGroups" :key="key" class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-black text-slate-800 dark:text-white">{{ group.label }}</h4>
              <p class="text-[11px] text-slate-400">{{ group.description }}</p>
            </div>
            <button @click="toggleGroup(key)" class="text-[10px] font-bold text-[#29166e] hover:text-[#1d0f4d] uppercase tracking-widest">
              {{ isGroupAllSelected(key) ? 'Deselect All' : 'Select All' }}
            </button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label v-for="perm in group.permissions" :key="perm"
                   class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                   :class="roleForm.permissions.includes(perm) ? 'bg-[#29166e]/5 dark:bg-[#29166e]/20 border-[#29166e]/20 dark:border-[#29166e]/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'">
              <input type="checkbox" :value="perm" v-model="roleForm.permissions" class="w-4 h-4 rounded border-slate-300 text-[#29166e] focus:ring-[#29166e]" />
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ formatPermissionLabel(perm) }}</span>
            </label>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <span class="text-xs font-bold text-slate-400">{{ roleForm.permissions.length }} permissions selected</span>
          <div class="flex items-center gap-3">
            <button @click="closeRoleModal" class="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            <button @click="saveRole" :disabled="saving" class="px-6 py-2.5 bg-[#29166e] text-white rounded-xl font-bold text-sm hover:bg-[#1d0f4d] transition-colors disabled:opacity-50 flex items-center gap-2">
              <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              {{ showEditRole ? 'Update Permissions' : 'Create Role' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Create/Edit Admin User Modal -->
    <Modal :show="showCreateUser || showEditUser" :title="showEditUser ? 'Edit Admin User' : 'Add Admin User'" @close="closeUserModal" maxWidth="lg">
      <div class="p-6 space-y-5">
        <div class="space-y-2">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
          <input v-model="userForm.name" type="text" placeholder="John Doe" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all dark:text-white" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
          <input v-model="userForm.email" type="email" placeholder="admin@nrg.com" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all dark:text-white" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
          <input v-model="userForm.password" type="password" placeholder="Min 8 characters" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all dark:text-white" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Mobile</label>
          <input v-model="userForm.mobile" type="text" placeholder="+974..." class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all dark:text-white" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Assign Role</label>
          <select v-model="userForm.role" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#29166e]/20 focus:border-[#29166e] outline-none transition-all dark:text-white">
            <option value="">Select a role</option>
            <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.name.replace('_', ' ') }}</option>
          </select>
        </div>
        <div v-if="showEditUser" class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="userForm.is_active" class="w-4 h-4 rounded border-slate-300 text-[#29166e] focus:ring-[#29166e]" />
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Account Active</span>
          </label>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3 w-full p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <button @click="closeUserModal" class="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
          <button @click="saveAdminUser" :disabled="saving" class="px-6 py-2.5 bg-[#29166e] text-white rounded-xl font-bold text-sm hover:bg-[#1d0f4d] transition-colors disabled:opacity-50 flex items-center gap-2">
            <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            {{ showEditUser ? 'Update User' : 'Create User' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { roleService, adminUserService } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import Modal from '@/components/shared/Modal.vue';

const notify = useNotificationStore();

const loading = ref(true);
const saving = ref(false);
const roles = ref([]);
const adminUsers = ref([]);
const permissionGroups = ref({});

const showCreateRole = ref(false);
const showEditRole = ref(false);
const showCreateUser = ref(false);
const showEditUser = ref(false);
const editingRole = ref(null);
const editingUser = ref(null);

const roleForm = ref({ name: '', permissions: [] });
const userForm = ref({ name: '', email: '', password: '', mobile: '', role: '', is_active: true });

const fetchData = async () => {
  loading.value = true;
  try {
    const [rolesRes, permsRes, usersRes] = await Promise.all([
      roleService.getAll(),
      roleService.getPermissions(),
      adminUserService.getAll()
    ]);
    roles.value = rolesRes.data;
    permissionGroups.value = permsRes.data;
    adminUsers.value = usersRes.data;
  } catch (err) {
    console.error('Failed to load role data', err);
    notify.error('Failed to load role data.');
  } finally {
    loading.value = false;
  }
};

const getMenuPermissions = (permissions) => permissions.filter(p => p.startsWith('view_'));
const getActionPermissions = (permissions) => permissions.filter(p => !p.startsWith('view_'));

const isProtectedRole = (roleName) => ['super_admin', 'admin', 'collector', 'viewer'].includes(roleName);

const deleteRole = async (role) => {
  if (role.users_count > 0) {
    notify.error(`Cannot delete role "${role.name.replace('_', ' ')}" because it has ${role.users_count} users assigned.`);
    return;
  }

  if (!confirm(`Are you sure you want to delete the role "${role.name.replace('_', ' ')}"? This action cannot be undone.`)) {
    return;
  }

  try {
    await roleService.delete(role.id);
    notify.success('Role deleted successfully.');
    await fetchData();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Failed to delete role.');
  }
};

const formatPermissionLabel = (perm) => {
  // Documentation group overrides
  if (perm === 'view_documentation') return 'View Documentation';
  if (perm === 'documentation_create') return 'Upload Document';
  if (perm === 'documentation_edit') return 'Edit Document';
  if (perm === 'documentation_delete') return 'Delete Document';
  if (perm === 'documentation_download') return 'Download Document';
  
  if (perm.startsWith('documentation_')) {
    const action = perm.replace('documentation_', '');
    return action.charAt(0).toUpperCase() + action.slice(1) + ' Documentation';
  }

  // Contracts group overrides
  if (perm.startsWith('contract_card_')) {
    const card = perm.replace('contract_card_', '').replace(/_/g, ' ');
    return 'Show Card: ' + card.replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Staff group overrides
  if (perm === 'staff_status') return 'Update Staff Status';
  
  // General formatting
  return perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const editRole = (role) => {
  editingRole.value = role;
  roleForm.value = { name: role.name, permissions: [...role.permissions] };
  showEditRole.value = true;
};

const closeRoleModal = () => {
  showCreateRole.value = false;
  showEditRole.value = false;
  editingRole.value = null;
  roleForm.value = { name: '', permissions: [] };
};

const isGroupAllSelected = (key) => {
  const group = permissionGroups.value[key];
  if (!group) return false;
  return group.permissions.every(p => roleForm.value.permissions.includes(p));
};

const toggleGroup = (key) => {
  const group = permissionGroups.value[key];
  if (!group) return;
  if (isGroupAllSelected(key)) {
    roleForm.value.permissions = roleForm.value.permissions.filter(p => !group.permissions.includes(p));
  } else {
    const newPerms = group.permissions.filter(p => !roleForm.value.permissions.includes(p));
    roleForm.value.permissions.push(...newPerms);
  }
};

const saveRole = async () => {
  saving.value = true;
  try {
    if (showEditRole.value && editingRole.value) {
      await roleService.update(editingRole.value.id, { permissions: roleForm.value.permissions });
      notify.success('Role permissions updated successfully.');
    } else {
      if (!roleForm.value.name.trim()) {
        notify.error('Please enter a role name.');
        saving.value = false;
        return;
      }
      await roleService.create(roleForm.value);
      notify.success('Role created successfully.');
    }
    closeRoleModal();
    await fetchData();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Failed to save role.');
  } finally {
    saving.value = false;
  }
};

const closeUserModal = () => {
  showCreateUser.value = false;
  showEditUser.value = false;
  editingUser.value = null;
  userForm.value = { name: '', email: '', password: '', mobile: '', role: '', is_active: true };
};

const editUser = (user) => {
  editingUser.value = user;
  userForm.value = {
    name: user.name,
    email: user.email,
    mobile: user.mobile || '',
    role: user.role || '',
    is_active: user.is_active,
    password: '' // Password blank unless changing
  };
  showEditUser.value = true;
};

const deleteUser = async (user) => {
  if (!confirm(`Are you sure you want to delete the user "${user.name}"? This will permanently remove their access to the dashboard.`)) {
    return;
  }

  try {
    await adminUserService.delete(user.id);
    notify.success('User deleted successfully.');
    await fetchData();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Failed to delete user.');
  }
};

const saveAdminUser = async () => {
  saving.value = true;
  try {
    if (showEditUser.value && editingUser.value) {
      // For update, password is optional
      const updateData = { ...userForm.value };
      if (!updateData.password) delete updateData.password;
      
      await adminUserService.update(editingUser.value.id, updateData);
      notify.success('Admin user updated successfully.');
    } else {
      await adminUserService.create(userForm.value);
      notify.success('Admin user created successfully.');
    }
    closeUserModal();
    await fetchData();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Failed to save user.');
  } finally {
    saving.value = false;
  }
};

onMounted(() => fetchData());
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>
