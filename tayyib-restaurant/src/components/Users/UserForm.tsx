import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../services/supabase';
import type { User } from '../../types';
import toast from 'react-hot-toast';
import Button from '../Common/Button';

interface FormData {
  full_name: string;
  role: 'MD' | 'Manager' | 'NMD';
  is_active: boolean;
}

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('users').select('*').eq('id', id).single();
      if (data) {
        reset({
          full_name: data.full_name,
          role: data.role,
          is_active: data.is_active,
        });
      }
      setLoading(false);
    }
    fetch();
  }, [id, reset]);

  const onSubmit = async (values: FormData) => {
    const { error } = await supabase
      .from('users')
      .update(values)
      .eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('User updated');
      navigate('/users');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit User</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm">Full Name</label>
          <input {...register('full_name', { required: true })} className="border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="block text-sm">Role</label>
          <select {...register('role')} className="border rounded px-2 py-1 w-full">
            <option value="MD">MD</option>
            <option value="Manager">Manager</option>
            <option value="NMD">NMD</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('is_active')} />
          <label className="text-sm">Active</label>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
