import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PERMISSIONS, rolesStore, type Permission } from '@/entities/merchant/roles'
import { staffStore } from '@/entities/merchant/staff'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { newId } from '@/shared/lib/createStore'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Section } from '@/shared/ui/Section'
import { TextField } from '@/shared/ui/TextField'
import { DeleteRecord } from '../components/DeleteRecord'

/** Create or edit a role: its name and what it is allowed to do. */
export function RoleFormPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = rolesStore.get(id)

  const [name, setName] = useState(existing?.name ?? '')
  const [permissions, setPermissions] = useState<Permission[]>(existing?.permissions ?? [])
  const [submitted, setSubmitted] = useState(false)
  const holders = staffStore.useAll().filter((member) => member.roleId === existing?.id).length

  const toggle = (permission: Permission, on: boolean) =>
    setPermissions((list) => (on ? [...list, permission] : list.filter((p) => p !== permission)))

  const save = () => {
    setSubmitted(true)
    if (name.trim() === '' || permissions.length === 0) return
    rolesStore.save({ id: existing?.id ?? newId(), name: name.trim(), permissions })
    toast(t('toast.saved'))
    navigate(-1)
  }

  return (
    <FormScreen
      onSubmit={save}
      onBack={() => navigate(-1)}
      footer={
        <Button type="submit" block>
          {t('common.save')}
        </Button>
      }
    >
      <IconBadge icon={ShieldCheck} />
      <ScreenIntro title={t(existing ? 'role.edit' : 'role.new')} />
      <TextField
        label={t('field.name')}
        autoComplete="off"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={submitted && name.trim() === '' ? t('error.required') : undefined}
      />
      <Section title={t('role.permissions')}>
        <div className="flex flex-col">
          {PERMISSIONS.map((permission) => (
            <Checkbox
              key={permission}
              label={t(`perm.${permission}`)}
              checked={permissions.includes(permission)}
              onChange={(on) => toggle(permission, on)}
            />
          ))}
        </div>
        {submitted && permissions.length === 0 && (
          <p role="alert" className="text-sm text-danger">
            {t('error.pickPermission')}
          </p>
        )}
      </Section>
      {existing && (
        <DeleteRecord
          blocked={holders > 0 ? t('role.inUse', { count: String(holders) }) : undefined}
          onDelete={() => {
            rolesStore.remove(existing.id)
            navigate(-1)
          }}
        />
      )}
    </FormScreen>
  )
}
